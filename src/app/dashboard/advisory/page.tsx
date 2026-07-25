'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bug,
  Droplets,
  History,
  Loader2,
  MapPin,
  Printer,
  Send,
  Sparkles,
  Sprout,
} from 'lucide-react';
import {
  type AdviceRecord,
  type AdviceResult,
  type AdvisoryLanguageCode,
  ADVISORY_LANGUAGES,
  CROP_PROFILES,
  SOIL_TIPS,
} from '@/lib/advisoryData';
import { getPrimaryCrop } from '@/lib/farmProfile';
import { useFarmProfile } from '@/lib/useFarmProfile';

const HISTORY_STORAGE_KEY = 'advisoryHistory';

function loadHistory(): AdviceRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as AdviceRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AdvisoryPage() {
  const { profile } = useFarmProfile();
  const primaryCrop = getPrimaryCrop(profile);

  const [crop, setCrop] = useState(primaryCrop?.name || 'Wheat');
  const [soil, setSoil] = useState(primaryCrop?.soilType || profile.soilType || 'Loamy Soil');
  const [stage, setStage] = useState(primaryCrop?.stage || CROP_PROFILES.Wheat.stages[0]);
  const [issue, setIssue] = useState('');
  const [language, setLanguage] = useState<AdvisoryLanguageCode>('en');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdviceResult | null>(null);
  const [history, setHistory] = useState<AdviceRecord[]>([]);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState(0);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    if (!primaryCrop) {
      return;
    }

    setCrop(primaryCrop.name);
    setSoil(primaryCrop.soilType || profile.soilType || 'Loamy Soil');
    setStage(primaryCrop.stage);
  }, [primaryCrop, profile.soilType]);

  const activeProfile = CROP_PROFILES[crop] ?? CROP_PROFILES.Wheat;
  const suggestedIssues = useMemo(() => {
    const pest = activeProfile.commonPests[0];
    return [
      `${crop} leaves are yellowing`,
      `${crop} showing uneven growth`,
      pest ? `Possible ${pest} attack in ${crop}` : `Need preventive care for ${crop}`,
    ];
  }, [activeProfile.commonPests, crop]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const now = Date.now();
    if (now - lastRequestTime < 5000) {
      window.alert('Please wait a few seconds before generating another advisory to prevent system overload.');
      return;
    }
    setLastRequestTime(now);
    
    setLoading(true);
    setResult(null);
    setSavedId(null);

    try {
      const response = await fetch('/api/advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop,
          soilType: soil,
          stage,
          issue: issue || `General advisory for ${profile.location}`,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch advisory');
      }

      const data = await response.json();
      if (data.error && !data.advisory) {
        throw new Error(data.error);
      }

      if (data.advisory) {
        setResult(data.advisory as AdviceResult);
      }
    } catch (fetchError) {
      console.error('Error fetching advisory:', fetchError);
      window.alert('Failed to generate advisory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentAdvisory = () => {
    if (!result) {
      return;
    }

    const record: AdviceRecord = {
      id: Date.now(),
      crop,
      soilType: soil,
      stage,
      issue: issue || 'General advisory',
      language,
      advice: result,
      timestamp: new Date().toLocaleString('en-IN'),
    };

    const nextHistory = [record, ...history].slice(0, 8);
    setHistory(nextHistory);
    setSavedId(record.id);
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 print:m-0 print:p-0">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Adaptive Crop Advisory</h1>
          <p className="mt-1 text-muted-foreground">Prefilled from your farm profile, with stage-specific actions you can save and reuse.</p>
        </div>
        <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
          {profile.location} · {profile.soilType}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.35fr_0.7fr]">
        <div className="space-y-6 print:hidden">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm dark:bg-card">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <Sprout className="h-5 w-5 text-green-600" />
              Farm Details
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Crop</label>
                <select value={crop} onChange={(event) => setCrop(event.target.value)} className="w-full rounded-xl border border-border bg-background p-2.5">
                  {Object.keys(CROP_PROFILES).map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Soil Type</label>
                <select value={soil} onChange={(event) => setSoil(event.target.value)} className="w-full rounded-xl border border-border bg-background p-2.5">
                  {Object.keys(SOIL_TIPS).map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Crop Stage</label>
                <select value={stage} onChange={(event) => setStage(event.target.value)} className="w-full rounded-xl border border-border bg-background p-2.5">
                  {activeProfile.stages.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Issue or Goal</label>
                <textarea
                  value={issue}
                  onChange={(event) => setIssue(event.target.value)}
                  className="min-h-[96px] w-full rounded-xl border border-border bg-background p-2.5"
                  placeholder={`Describe the current problem in ${profile.location} or ask for preventive advice.`}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Language</label>
                <select value={language} onChange={(event) => setLanguage(event.target.value as AdvisoryLanguageCode)} className="w-full rounded-xl border border-border bg-background p-2.5">
                  {ADVISORY_LANGUAGES.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
                </select>
              </div>
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-70">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                Generate Advisory
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm dark:bg-card">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              Smart Prompts
            </h3>
            <div className="space-y-2">
              {suggestedIssues.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setIssue(item)}
                  className="w-full rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-left text-sm text-foreground transition hover:bg-muted/40"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {!result && !loading && (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-8 text-center text-muted-foreground print:hidden">
              <Sprout className="mb-4 h-16 w-16 text-green-200 dark:text-green-900" />
              <h3 className="text-xl font-bold text-foreground">Ready for Analysis</h3>
              <p className="mt-2 max-w-md">The advisory form is already synced with your registered crop and soil context. Adjust anything you need and generate a field-ready plan.</p>
            </div>
          )}

          {loading && (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-border bg-white/50 backdrop-blur-sm print:hidden dark:bg-card/50">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-green-600" />
              <h3 className="text-xl font-bold">Analyzing Farm Data...</h3>
              <p className="mt-2 text-muted-foreground">Cross-checking crop stage, soil, risk factors, and saved farm context.</p>
            </div>
          )}

          {result && (
            <div className="space-y-6 print:space-y-4">
              <div className="flex items-center justify-between print:hidden">
                <h2 className="text-2xl font-bold">Advisory Report</h2>
                <div className="flex gap-2">
                  <button onClick={saveCurrentAdvisory} className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15">
                    {savedId ? 'Saved' : 'Save to History'}
                  </button>
                  <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
                    <Printer className="h-4 w-4" />
                    Download PDF
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 p-6 shadow-sm print:border-black print:bg-none dark:border-green-800 dark:from-green-950/30 dark:to-emerald-900/20">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400">
                  <Sparkles className="h-4 w-4" />
                  {crop} · {stage} · {profile.location}
                </div>
                <p className="text-lg font-medium leading-relaxed">{result.summary}</p>
              </div>

              {result.actions?.length ? (
                <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card">
                  <h3 className="mb-3 font-bold text-foreground">Recommended Actions</h3>
                  <div className="space-y-3">
                    {result.actions.map((action, index) => (
                      <div key={`${action.title}-${index}`} className="rounded-xl border border-border/70 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-foreground">{action.title}</p>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            action.urgency === 'high'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : action.urgency === 'medium'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {action.urgency}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 print:grid-cols-2">
                <div className="rounded-xl border border-border bg-white p-5 shadow-sm print:border-black print:shadow-none dark:bg-card">
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-amber-700 dark:text-amber-500 print:text-black">
                    <Sprout className="h-5 w-5" />
                    Fertilizer Schedule
                  </h3>
                  <p className="text-sm text-muted-foreground print:text-black">{result.fertilizer}</p>
                </div>
                <div className="rounded-xl border border-border bg-white p-5 shadow-sm print:border-black print:shadow-none dark:bg-card">
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400 print:text-black">
                    <Droplets className="h-5 w-5" />
                    Irrigation Guide
                  </h3>
                  <p className="text-sm text-muted-foreground print:text-black">{result.irrigation}</p>
                </div>
                <div className="rounded-xl border border-border bg-white p-5 shadow-sm print:border-black print:shadow-none dark:bg-card">
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-red-600 dark:text-red-400 print:text-black">
                    <Bug className="h-5 w-5" />
                    Pest Alerts
                  </h3>
                  <p className="text-sm text-muted-foreground print:text-black">{result.pestAlert}</p>
                </div>
                <div className="rounded-xl border border-border bg-white p-5 shadow-sm print:border-black print:shadow-none dark:bg-card">
                  <h3 className="mb-3 flex items-center gap-2 font-bold text-purple-600 dark:text-purple-400 print:text-black">
                    <MapPin className="h-5 w-5" />
                    Soil Management
                  </h3>
                  <p className="text-sm text-muted-foreground print:text-black">{result.soilTip}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 print:hidden">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm dark:bg-card">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-foreground">
              <History className="h-4 w-4 text-primary" />
              Advisory History
            </h3>
            {history.length ? (
              <div className="space-y-3">
                {history.map((record) => (
                  <button
                    key={record.id}
                    type="button"
                    onClick={() => {
                      setCrop(record.crop);
                      setSoil(record.soilType);
                      setStage(record.stage);
                      setIssue(record.issue);
                      setLanguage(record.language || 'en');
                      setResult(record.advice);
                    }}
                    className="w-full rounded-xl border border-border/70 p-3 text-left transition hover:bg-muted/30"
                  >
                    <p className="text-sm font-semibold text-foreground">{record.crop} · {record.stage}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{record.timestamp}</p>
                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{record.issue}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No saved advisories yet. Save useful ones to build your seasonal playbook.</p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm dark:bg-card">
            <h3 className="mb-3 font-bold text-foreground">Crop Snapshot</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-semibold text-foreground">Season:</span> {activeProfile.seasons.join(', ')}</p>
              <p><span className="font-semibold text-foreground">NPK:</span> {activeProfile.npk}</p>
              <p><span className="font-semibold text-foreground">Key pests:</span> {activeProfile.commonPests.join(', ')}</p>
              <p><span className="font-semibold text-foreground">Preferred soil:</span> {soil}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
