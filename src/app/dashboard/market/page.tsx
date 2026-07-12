'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell, Bot, ChartNoAxesCombined, Loader2, MapPin, RefreshCw, Search, TrendingDown, TrendingUp } from 'lucide-react';
import type { MarketBasketItem, MarketCommodity, MarketSnapshot } from '@/lib/dynamicDashboardData';
import { createMarketAlertsFromProfile } from '@/lib/farmProfile';
import { useFarmProfile } from '@/lib/useFarmProfile';

type CategoryTab = 'all' | 'grains' | 'vegetables' | 'fruits';

interface PriceAlert {
  crop: string;
  condition: '>' | '<';
  threshold: number;
  enabled: boolean;
}

const POPULAR_LOCATIONS = ['Nagpur', 'Pune', 'Indore', 'Ludhiana', 'Jaipur', 'Raipur', 'Hyderabad', 'Bhopal', 'Nashik', 'Ahmedabad', 'Patna', 'Lucknow'];

function trendClass(change: number) {
  if (change > 0.4) return 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-300';
  if (change < -0.4) return 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300';
  return 'text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300';
}

function basketChange(item: MarketBasketItem) {
  if (item.lastWeek === 0 || !Number.isFinite(item.lastWeek) || !Number.isFinite(item.current)) {
    return 0;
  }

  const change = ((item.current - item.lastWeek) / item.lastWeek) * 100;
  return Number.isFinite(change) ? Number(change.toFixed(1)) : 0;
}

export default function MarketPage() {
  const { profile } = useFarmProfile();
  const [locationInput, setLocationInput] = useState(profile.location || 'Nagpur');
  const [activeLocation, setActiveLocation] = useState(profile.location || 'Nagpur');
  const [activeTab, setActiveTab] = useState<CategoryTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<MarketSnapshot | null>(null);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  useEffect(() => {
    setLocationInput(profile.location || 'Nagpur');
    setAlerts((current) => {
      if (current.length) {
        return current;
      }

      try {
        const stored = window.localStorage.getItem('marketAlerts');
        if (stored) {
          const parsed = JSON.parse(stored) as PriceAlert[];
          if (Array.isArray(parsed) && parsed.length) {
            return parsed;
          }
        }
      } catch {
        // Ignore invalid saved alerts.
      }

      return createMarketAlertsFromProfile(profile);
    });
  }, [profile]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('marketAlerts', JSON.stringify(alerts));
  }, [alerts]);

  const fetchMarket = async (targetLocation: string) => {
    const sanitizedLocation = targetLocation.trim();
    if (!sanitizedLocation) {
      setError('Please enter a valid location.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cropHint = profile.crops.map((crop) => crop.name).join(', ');
      const response = await fetch(`/api/dashboard/market?location=${encodeURIComponent(sanitizedLocation)}&crop=${encodeURIComponent(cropHint)}`);
      if (!response.ok) {
        throw new Error('Unable to load market data right now.');
      }

      const payload = (await response.json()) as MarketSnapshot;
      setData(payload);
      setActiveLocation(sanitizedLocation);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Something went wrong while loading market data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket(profile.location || 'Nagpur');
  }, [profile.location]);

  const relevantCommodities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const commodities = data?.commodities ?? [];
    const cropNames = new Set(profile.crops.map((crop) => crop.name.toLowerCase()));

    return commodities.filter((row) => {
      const matchesSearch = !query || row.crop.toLowerCase().includes(query) || row.market.toLowerCase().includes(query);
      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'grains' && ['grain', 'pulse', 'oilseed', 'fiber'].includes(row.category));

      return matchesSearch && matchesTab && (activeTab !== 'all' || cropNames.size === 0 || cropNames.has(row.crop.toLowerCase()) || matchesSearch);
    });
  }, [activeTab, data?.commodities, profile.crops, searchQuery]);

  const alertHits = useMemo(() => {
    return alerts
      .filter((alert) => alert.enabled)
      .map((alert) => {
        const latest = data?.commodities.find((item: MarketCommodity) => item.crop.toLowerCase().includes(alert.crop.toLowerCase()));
        if (!latest) {
          return null;
        }

        const triggered = alert.condition === '>' ? latest.price >= alert.threshold : latest.price <= alert.threshold;
        return { ...alert, latest, triggered };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [alerts, data?.commodities]);

  const bestPerformer = useMemo(() => {
    return [...(data?.commodities ?? [])].sort((left, right) => right.change - left.change)[0] ?? null;
  }, [data?.commodities]);

  const weakestPerformer = useMemo(() => {
    return [...(data?.commodities ?? [])].sort((left, right) => left.change - right.change)[0] ?? null;
  }, [data?.commodities]);

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Farm-Aware Market Desk</h2>
          <p className="text-muted-foreground">Prices, alerts, and sell/hold signals now prioritize the crops registered in your farm profile.</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <div className="relative min-w-[260px]">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={locationInput}
              onChange={(event) => setLocationInput(event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm"
              placeholder="Search mandi location"
            />
          </div>
          <button
            type="button"
            onClick={() => fetchMarket(locationInput)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {POPULAR_LOCATIONS.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => {
              setLocationInput(city);
              fetchMarket(city);
            }}
            className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground dark:bg-card"
          >
            {city}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card">
          <p className="text-sm font-medium text-muted-foreground">Tracking Location</p>
          <h3 className="mt-2 text-2xl font-bold text-foreground">{activeLocation}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{profile.crops.length} crop types linked to this desk</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card">
          <p className="text-sm font-medium text-muted-foreground">Best Opportunity</p>
          <h3 className="mt-2 text-xl font-bold text-green-700 dark:text-green-400">{bestPerformer?.crop ?? 'Loading...'}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{bestPerformer ? `${bestPerformer.change.toFixed(1)}% weekly momentum` : 'Waiting for market feed'}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card">
          <p className="text-sm font-medium text-muted-foreground">Watch Caution</p>
          <h3 className="mt-2 text-xl font-bold text-rose-700 dark:text-rose-400">{weakestPerformer?.crop ?? 'Loading...'}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{weakestPerformer ? `${weakestPerformer.change.toFixed(1)}% weekly movement` : 'Waiting for market feed'}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card">
          <p className="text-sm font-medium text-muted-foreground">Triggered Alerts</p>
          <h3 className="mt-2 text-2xl font-bold text-foreground">{alertHits.filter((item) => item.triggered).length}</h3>
          <p className="mt-1 text-xs text-muted-foreground">Out of {alertHits.length} active crop watch rules</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm dark:bg-card">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm"
                placeholder="Search crop or mandi"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'grains', 'vegetables', 'fruits'] as CategoryTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    activeTab === tab ? 'bg-primary text-white' : 'border border-border bg-background text-muted-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300">{error}</div>}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Crop</th>
                  <th className="px-4 py-3 text-left font-medium">Market</th>
                  <th className="px-4 py-3 text-right font-medium">Current</th>
                  <th className="px-4 py-3 text-right font-medium">Weekly</th>
                  <th className="px-4 py-3 text-center font-medium">AI Signal</th>
                </tr>
              </thead>
              <tbody>
                {(relevantCommodities.length ? relevantCommodities : data?.commodities ?? []).map((row) => (
                  <tr key={row.id} className="border-t border-border/60 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium text-foreground">{row.crop}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.market}</td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{row.price.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${trendClass(row.change)}`}>
                        {row.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {Math.abs(row.change).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        row.change > 0 ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      }`}>
                        <Bot className="h-3 w-3" />
                        {row.change > 0 ? 'Sell Window' : 'Hold & Watch'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-4 shadow-sm dark:bg-card">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <Bell className="h-4 w-4 text-primary" />
              Smart Alerts
            </h3>
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={`${alert.crop}-${index}`} className="rounded-lg border border-border/70 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{alert.crop} {alert.condition} {alert.threshold.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-muted-foreground">{alert.enabled ? 'Active farm watch rule' : 'Paused watch rule'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAlerts((current) => current.map((item, currentIndex) => currentIndex === index ? { ...item, enabled: !item.enabled } : item))}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        alert.enabled ? 'bg-primary text-white' : 'border border-border bg-background text-muted-foreground'
                      }`}
                    >
                      {alert.enabled ? 'Enabled' : 'Paused'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 shadow-sm dark:bg-card">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <ChartNoAxesCombined className="h-4 w-4 text-primary" />
              Basket Movement
            </h3>
            <div className="space-y-2">
              {[...(data?.vegetables ?? []), ...(data?.fruits ?? [])].slice(0, 6).map((item) => {
                const change = basketChange(item);
                return (
                  <div key={item.name} className="flex items-center justify-between rounded-lg border border-border/60 p-2 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.current.toLocaleString('en-IN')} / {item.unit}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${trendClass(change)}`}>
                      {change >= 0 ? '+' : ''}{change}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-border bg-white dark:bg-card">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading market reference data...
          </div>
        </div>
      ) : null}
    </div>
  );
}
