'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bug,
  Download,
  Leaf,
  Loader2,
  MapPin,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import type { AnalyticsSnapshot, FertilizerUsagePoint, SoilMetric } from '@/lib/dynamicDashboardData';

function usageState(point: FertilizerUsagePoint) {
  const ratio = point.recommended === 0 ? 0 : point.used / point.recommended;
  if (ratio < 0.7) {
    return { label: 'Below target', color: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500', width: 'w-7/12' };
  }
  if (ratio <= 1.05) {
    return { label: 'On track', color: 'text-green-600 dark:text-green-400', bar: 'bg-green-500', width: 'w-10/12' };
  }
  return { label: 'Above target', color: 'text-red-600 dark:text-red-400', bar: 'bg-red-500', width: 'w-full' };
}

function soilBadge(metric: SoilMetric) {
  if (metric.color === 'green') {
    return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300';
  }
  if (metric.color === 'amber') {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
  }
  return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300';
}

function pctTrendClass(value: number) {
  return value >= 0
    ? 'text-green-600 bg-green-50 dark:text-green-300 dark:bg-green-900/20'
    : 'text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/20';
}

function formatCurrency(value: number) {
  return `₹ ${value.toLocaleString('en-IN')}`;
}

const POPULAR_LOCATIONS = ['Nagpur', 'Pune', 'Indore', 'Ludhiana', 'Jaipur', 'Raipur', 'Hyderabad', 'Bhopal', 'Nashik', 'Ahmedabad', 'Patna', 'Lucknow', 'Chennai', 'Bangalore'];

export default function AnalyticsPage() {
  const [locationInput, setLocationInput] = useState('Nagpur');
  const [selectedLocation, setSelectedLocation] = useState('Nagpur');
  const [timePeriod, setTimePeriod] = useState<'Last 1 Month' | 'Last 3 Months' | 'Last 6 Months'>('Last 6 Months');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<AnalyticsSnapshot | null>(null);

  const loadAnalytics = async (location: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/dashboard/analytics?location=${encodeURIComponent(location)}`);
      if (!response.ok) {
        throw new Error('Unable to load analytics snapshot right now.');
      }

      const payload = (await response.json()) as AnalyticsSnapshot;
      setData(payload);
      setSelectedLocation(location);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to load dynamic analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics('Nagpur');
  }, []);

  const revenueSeries = useMemo(() => {
    if (!data) {
      return [];
    }

    if (timePeriod === 'Last 1 Month') {
      return data.revenueSeries.slice(-1);
    }

    if (timePeriod === 'Last 3 Months') {
      return data.revenueSeries.slice(-3);
    }
    return data.revenueSeries;
  }, [data, timePeriod]);

  const totalRevenue = useMemo(() => {
    return revenueSeries.reduce((sum, row) => sum + row.revenue, 0);
  }, [revenueSeries]);

  const downloadReport = () => {
    if (!data) {
      return;
    }

    const lines = [
      'SmartAgriSense Dynamic Analytics Report',
      `Generated: ${new Date().toLocaleString('en-IN')}`,
      `Location: ${data.location}`,
      '',
      `Crop Health Score: ${data.cropHealthScore}`,
      `Crop Health Trend: ${data.cropHealthTrend}%`,
      `Pest Efficiency: ${data.pestEfficiency}%`,
      '',
      'Revenue Series',
      ...data.revenueSeries.map((row) => `${row.label}: ${row.revenue}`),
      '',
      'Soil Metrics',
      ...data.soilMetrics.map((metric) => `${metric.parameter}: ${metric.value} (${metric.status})`),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `dynamic-analytics-${new Date().toISOString().slice(0, 10)}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <div className="rounded-xl bg-primary/10 p-2">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            Farm Analytics
          </h2>
          <p className="mt-1 text-muted-foreground">Weather-linked operational indicators for your selected location.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={locationInput}
              onChange={(event) => setLocationInput(event.target.value)}
              placeholder="Enter district or city"
              className="h-11 w-full rounded-xl border border-border bg-white pl-9 pr-3 text-sm outline-none ring-primary/20 transition focus:ring-2 dark:bg-card sm:w-64"
            />
          </div>

          <button
            type="button"
            onClick={() => loadAnalytics(locationInput.trim() || 'Nagpur')}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>

          <button
            type="button"
            onClick={downloadReport}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground transition hover:bg-muted dark:bg-card"
          >
            <Download className="h-4 w-4" />
            Report
          </button>
        </div>
      </div>

      {/* Location Quick Picks */}
      <div className="flex flex-wrap gap-2">
        {POPULAR_LOCATIONS.map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => {
              setLocationInput(loc);
              loadAnalytics(loc);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              selectedLocation === loc
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-muted-foreground hover:bg-primary/10 hover:text-primary dark:bg-card'
            }`}
          >
            {loc}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm dark:bg-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Location</p>
          <p className="mt-1 text-lg font-bold text-foreground">{data?.location ?? selectedLocation}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm dark:bg-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Crop Health Score</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{data?.cropHealthScore ?? '--'}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm dark:bg-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pest Efficiency</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{data?.pestEfficiency ?? '--'}%</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {(['Last 1 Month', 'Last 3 Months', 'Last 6 Months'] as const).map((period) => (
          <button
            key={period}
            type="button"
            onClick={() => setTimePeriod(period)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
              timePeriod === period
                ? 'bg-primary text-white'
                : 'border border-border bg-white text-muted-foreground hover:text-foreground dark:bg-card'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {loading && !data ? (
        <div className="flex min-h-40 items-center justify-center rounded-xl border border-border bg-white dark:bg-card">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Computing analytics...
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card">
              <div className="mb-2 flex items-center justify-between">
                <Leaf className="h-5 w-5 text-green-600" />
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${pctTrendClass(data?.cropHealthTrend ?? 0)}`}>
                  {(data?.cropHealthTrend ?? 0) >= 0 ? '+' : ''}
                  {data?.cropHealthTrend ?? 0}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Crop Health</p>
              <p className="text-2xl font-bold text-foreground">{data?.cropHealthScore ?? 0}/100</p>
            </div>

            <div className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card">
              <div className="mb-2 flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                <span className="text-xs text-muted-foreground">{revenueSeries.length} points</span>
              </div>
              <p className="text-sm text-muted-foreground">Revenue ({timePeriod})</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
            </div>

            <div className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card">
              <div className="mb-2 flex items-center justify-between">
                <Bug className="h-5 w-5 text-purple-600" />
                <span className="text-xs text-muted-foreground">Incidents</span>
              </div>
              <p className="text-sm text-muted-foreground">Pest Control</p>
              <p className="text-xl font-bold text-foreground">{data?.pestIncidents ?? 0} active events</p>
            </div>

            <div className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card">
              <div className="mb-2 flex items-center justify-between">
                <Activity className="h-5 w-5 text-blue-600" />
                <span className="text-xs text-muted-foreground">Next action</span>
              </div>
              <p className="text-sm text-muted-foreground">Spray Planning</p>
              <p className="text-xl font-bold text-foreground">{data?.nextSprayInDays ?? '--'} days</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:bg-card">
              <h3 className="mb-3 font-semibold text-foreground">Revenue Series</h3>
              <div className="space-y-2">
                {revenueSeries.map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-lg border border-border/70 p-2 text-sm">
                    <span className="font-medium text-foreground">{row.label}</span>
                    <span className="text-muted-foreground">{formatCurrency(row.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:bg-card">
              <h3 className="mb-3 font-semibold text-foreground">Yield Trends</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="py-2 text-left font-medium">Year</th>
                      <th className="py-2 text-right font-medium">Wheat</th>
                      <th className="py-2 text-right font-medium">Rice</th>
                      <th className="py-2 text-right font-medium">Cotton</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.yieldSeries ?? []).map((row) => (
                      <tr key={row.year} className="border-t border-border/60">
                        <td className="py-2 font-medium text-foreground">{row.year}</td>
                        <td className="py-2 text-right text-muted-foreground">{row.wheat}</td>
                        <td className="py-2 text-right text-muted-foreground">{row.rice}</td>
                        <td className="py-2 text-right text-muted-foreground">{row.cotton}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:bg-card">
              <h3 className="mb-3 font-semibold text-foreground">Fertilizer Usage</h3>
              <div className="space-y-4">
                {(data?.fertilizerUsage ?? []).map((point) => {
                  const state = usageState(point);
                  return (
                    <div key={point.name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{point.name}</span>
                        <span className="text-muted-foreground">
                          {point.used}/{point.recommended} {point.unit}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted/40">
                        <div className={`h-2 rounded-full ${state.bar} ${state.width}`} />
                      </div>
                      <p className={`mt-1 text-xs font-medium ${state.color}`}>{state.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:bg-card">
              <h3 className="mb-3 font-semibold text-foreground">Soil Health Matrix</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(data?.soilMetrics ?? []).map((metric) => (
                  <div key={metric.parameter} className="rounded-lg border border-border/70 p-3">
                    <p className="text-xs font-medium text-muted-foreground">{metric.parameter}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-lg font-bold text-foreground">{metric.value}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${soilBadge(metric)}`}>
                        {metric.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
