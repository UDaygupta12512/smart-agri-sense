'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Download,
  Loader2,
  QrCode,
  Search,
  ShieldCheck,
  Link as LinkIcon,
} from 'lucide-react';
import type { TraceabilityRecord } from '@/lib/dynamicDashboardData';

export default function TraceabilityPage() {
  const [batchId, setBatchId] = useState('');
  const [cropHint, setCropHint] = useState('');
  const [originHint, setOriginHint] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [record, setRecord] = useState<TraceabilityRecord | null>(null);
  const [downloadMsg, setDownloadMsg] = useState('');

  const runLookup = async () => {
    const trimmedBatchId = batchId.trim();

    if (!trimmedBatchId) {
      setError('Please enter a batch ID.');
      return;
    }

    if (trimmedBatchId.length < 4) {
      setError('Batch ID must be at least 4 characters.');
      return;
    }

    if (trimmedBatchId.length > 50) {
      setError('Batch ID cannot exceed 50 characters.');
      return;
    }

    // Validate batch ID format (alphanumeric with hyphens allowed)
    if (!/^[A-Z0-9][A-Z0-9-]*[A-Z0-9]$|^[A-Z0-9]$/.test(trimmedBatchId)) {
      setError('Batch ID can only contain letters, numbers, and hyphens.');
      return;
    }

    // Validate optional fields length
    const trimmedCrop = cropHint.trim();
    const trimmedOrigin = originHint.trim();

    if (trimmedCrop.length > 50) {
      setError('Crop name cannot exceed 50 characters.');
      return;
    }

    if (trimmedOrigin.length > 100) {
      setError('Origin cannot exceed 100 characters.');
      return;
    }

    setLoading(true);
    setError('');
    setRecord(null);

    try {
      const response = await fetch(
        `/api/dashboard/traceability?batchId=${encodeURIComponent(trimmedBatchId)}&crop=${encodeURIComponent(trimmedCrop)}&origin=${encodeURIComponent(trimmedOrigin)}`
      );

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string; error?: string };
        throw new Error(payload.error || payload.message || 'Unable to verify batch ID.');
      }

      const payload = (await response.json()) as TraceabilityRecord;
      setRecord(payload);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to verify traceability record.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (!record) {
      return;
    }

    const content = [
      'SMARTAGRISENSE TRACEABILITY CERTIFICATE',
      '--------------------------------------',
      `Batch ID: ${record.id}`,
      `Crop: ${record.crop}`,
      `Origin: ${record.origin}`,
      `Farmer ID: ${record.farmerId}`,
      `Status: ${record.status}`,
      `Ledger Hash: ${record.ledgerHash}`,
      `Certifications: ${record.certifications.join(', ')}`,
      '',
      'Timeline:',
      ...record.timeline.map((event) => `${event.date} - ${event.event}: ${event.details}`),
      '',
      `Generated at: ${new Date().toLocaleString('en-IN')}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `traceability_${record.id}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);

    setDownloadMsg('Certificate downloaded.');
    setTimeout(() => setDownloadMsg(''), 2200);
  };

  return (
    <div className="min-h-screen space-y-8 p-6">
      <div className="flex flex-col gap-3 border-b border-border/50 pb-6">
        <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-foreground">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <QrCode className="h-8 w-8 text-primary" />
          </div>
          Farm-to-Fork Traceability
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Verify registered batch IDs and view their documented chain-of-custody records.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-4">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <Search className="h-5 w-5 text-primary" />
              Lookup Batch
            </h2>

            <div className="space-y-3">
              <div>
                <label htmlFor="trace-batch" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Batch ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="trace-batch"
                  type="text"
                  value={batchId}
                  onChange={(event) => {
                    setBatchId(event.target.value.toUpperCase());
                    if (error) setError('');
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !loading) {
                      runLookup();
                    }
                  }}
                  placeholder="e.g. BATCH-1234"
                  maxLength={50}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-mono uppercase focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label htmlFor="trace-crop" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Crop (optional)
                </label>
                <input
                  id="trace-crop"
                  type="text"
                  value={cropHint}
                  onChange={(event) => setCropHint(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !loading) {
                      runLookup();
                    }
                  }}
                  placeholder="e.g. Wheat"
                  maxLength={50}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label htmlFor="trace-origin" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Origin (optional)
                </label>
                <input
                  id="trace-origin"
                  type="text"
                  value={originHint}
                  onChange={(event) => setOriginHint(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !loading) {
                      runLookup();
                    }
                  }}
                  placeholder="e.g. Nagpur"
                  maxLength={100}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={runLookup}
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Verify Batch
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-900/20 dark:bg-blue-900/10 dark:text-blue-300">
            <p className="font-semibold">Registry Note</p>
            <p className="mt-1">
              Only registered batch IDs can be verified. Try: BATCH-2026-001, BATCH-2026-002, or BATCH-2026-003.
            </p>
          </div>
        </div>

        <div className="lg:col-span-8">
          {!record && !loading ? (
            <div className="flex min-h-[460px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/10 p-10 text-center">
              <LinkIcon className="mb-4 h-14 w-14 text-muted-foreground/40" />
              <h3 className="text-xl font-bold text-muted-foreground">Awaiting Verification Request</h3>
              <p className="mt-2 max-w-md text-muted-foreground">
                Enter a registered batch ID to view source, certifications, and timeline.
              </p>
            </div>
          ) : loading ? (
            <div className="flex min-h-[460px] flex-col items-center justify-center rounded-2xl border border-border bg-white p-10 shadow-sm dark:bg-card">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
              <p className="text-base font-semibold text-foreground">Verifying batch record...</p>
              <p className="mt-1 text-sm text-muted-foreground">Fetching registered chain-of-custody timeline.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-lg dark:bg-card">
              <div className="bg-primary p-6 text-white">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                  <CheckCircle2 className="h-4 w-4" />
                  Verified
                </div>
                <h2 className="text-2xl font-bold">{record?.crop}</h2>
                <p className="mt-1 text-sm text-white/90">Batch ID: {record?.id}</p>
                <p className="text-sm text-white/90">Origin: {record?.origin}</p>
              </div>

              <div className="space-y-6 p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-border bg-muted/20 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Farmer ID</p>
                    <p className="mt-1 font-semibold text-foreground">{record?.farmerId}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current Status</p>
                    <p className="mt-1 font-semibold text-foreground">{record?.status}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ledger Hash</p>
                    <p className="mt-1 truncate font-mono text-sm text-foreground">{record?.ledgerHash}</p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {record?.certifications.map((certification) => (
                      <span
                        key={certification}
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground"
                      >
                        {certification}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Supply Chain Timeline</h3>
                  <div className="space-y-3">
                    {record?.timeline.map((event, index) => (
                      <div key={`${event.date}-${event.event}-${index}`} className="rounded-lg border border-border/70 p-3">
                        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                          <p className="font-semibold text-foreground">{event.event}</p>
                          <span className="text-xs text-muted-foreground">{event.date}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{event.details}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <button
                    type="button"
                    onClick={handleDownloadCertificate}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary/90"
                  >
                    <Download className="h-4 w-4" />
                    Download Certificate
                  </button>
                  {downloadMsg && <p className="text-sm font-medium text-green-600 dark:text-green-400">{downloadMsg}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
