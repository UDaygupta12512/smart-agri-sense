'use client';

import { useEffect, useMemo, useState } from 'react';
import { Filter, Loader2, RefreshCw, Search } from 'lucide-react';
import MSPCard from '@/components/msp/MSPCard';
import type { MspRecord } from '@/lib/dynamicDashboardData';

interface MspResponse {
  year: string;
  region: string;
  records: MspRecord[];
}

function currentMarketingYear() {
  return '2025-26';
}

export default function MSPPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('All');
  const [region, setRegion] = useState('All Regions');
  const [marketingYear, setMarketingYear] = useState(currentMarketingYear());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [records, setRecords] = useState<MspRecord[]>([]);

  const loadMsp = async (targetYear: string, targetRegion: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/dashboard/msp?year=${encodeURIComponent(targetYear)}&region=${encodeURIComponent(targetRegion)}`
      );
      if (!response.ok) {
        throw new Error('Unable to load MSP rates right now.');
      }

      const payload = (await response.json()) as MspResponse;
      setRecords(payload.records);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load MSP records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMsp(currentMarketingYear(), 'All Regions');
  }, []);

  const filteredMsp = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !query ||
        record.cropName.toLowerCase().includes(query) ||
        record.location.toLowerCase().includes(query);

      const matchesSeason = seasonFilter === 'All' || record.season.includes(seasonFilter);
      return matchesSearch && matchesSeason;
    });
  }, [records, searchTerm, seasonFilter]);

  return (
    <div className="min-h-screen space-y-8 bg-muted/5 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-green-600 dark:text-green-500">Minimum Support Price (MSP)</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Official MSP reference table.
            <a href="https://cacp.dacnet.nic.in/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium">
              Source: CACP Govt. of India
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadMsp(marketingYear, region)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh Rates
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search crops or states"
            className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-4 text-sm shadow-sm outline-none ring-primary/20 transition focus:ring-2 dark:bg-card"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="relative">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <select
            title="Filter MSP by season"
            className="h-11 w-full rounded-xl border border-border bg-white pl-9 pr-4 text-sm font-medium shadow-sm outline-none dark:bg-card"
            value={seasonFilter}
            onChange={(event) => setSeasonFilter(event.target.value)}
          >
            <option value="All">All Seasons</option>
            <option value="Kharif">Kharif</option>
            <option value="Rabi">Rabi</option>
          </select>
        </div>

        <div>
          <input
            type="text"
            value={marketingYear}
            onChange={(event) => setMarketingYear(event.target.value)}
            placeholder="e.g. 2025-26"
            className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm font-medium shadow-sm outline-none ring-primary/20 transition focus:ring-2 dark:bg-card"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <select
          title="Choose state or region"
          value={region}
          onChange={(event) => setRegion(event.target.value)}
          className="h-11 rounded-xl border border-border bg-white px-4 text-sm font-medium shadow-sm outline-none dark:bg-card"
        >
          <option>All Regions</option>
          <option>Punjab</option>
          <option>Maharashtra</option>
          <option>Madhya Pradesh</option>
          <option>Rajasthan</option>
          <option>Karnataka</option>
          <option>Uttar Pradesh</option>
        </select>

        <button
          type="button"
          onClick={() => loadMsp(marketingYear, region)}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground transition hover:bg-muted dark:bg-card"
        >
          Apply Filters
        </button>

        <div className="flex h-11 items-center justify-center rounded-xl border border-border bg-white text-sm font-semibold text-muted-foreground dark:bg-card">
          {filteredMsp.length} records
        </div>
      </div>

      {loading && records.length === 0 ? (
        <div className="flex min-h-40 items-center justify-center rounded-xl border border-border bg-white dark:bg-card">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading MSP reference table...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredMsp.length > 0 ? (
            filteredMsp.map((record) => (
              <MSPCard key={`${record.cropName}-${record.location}-${record.updatedDate}`} {...record} />
            ))
          ) : (
            <div className="col-span-full rounded-xl border-2 border-dashed border-border py-12 text-center text-muted-foreground">
              No MSP records found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
