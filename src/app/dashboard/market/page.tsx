'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Bell,
    Bot,
    ChartNoAxesCombined,
    Loader2,
    MapPin,
    RefreshCw,
    Search,
    TrendingDown,
    TrendingUp,
    Sparkles,
    ShieldCheck,
    Building2,
    Calendar,
    Coins,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Minus
} from 'lucide-react';
import type { MarketBasketItem, MarketCommodity, MarketSnapshot } from '@/lib/dynamicDashboardData';
import { COMMODITY_PROFILES, type ForecastResult } from '@/lib/marketForecaster';
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

    // AI Forecaster State
    const [selectedCrop, setSelectedCrop] = useState('wheat');
    const [aiForecastLoading, setAiForecastLoading] = useState(false);
    const [aiForecastData, setAiForecastData] = useState<ForecastResult | null>(null);
    const [hoveredPoint, setHoveredPoint] = useState<{ date: string; price: number; isForecast?: boolean; upperBound?: number; lowerBound?: number } | null>(null);

    useEffect(() => {
        setLocationInput(profile.location || 'Nagpur');
        setAlerts((current) => {
            if (current.length) return current;
            try {
                const stored = window.localStorage.getItem('marketAlerts');
                if (stored) {
                    const parsed = JSON.parse(stored) as PriceAlert[];
                    if (Array.isArray(parsed) && parsed.length) return parsed;
                }
            } catch {
                // Ignore invalid saved alerts.
            }
            return createMarketAlertsFromProfile(profile);
        });
    }, [profile]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
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

    const fetchAIForecast = async (cropKey: string) => {
        setSelectedCrop(cropKey);
        setAiForecastLoading(true);
        try {
            const res = await fetch(`/api/market-forecast?crop=${cropKey.toLowerCase()}`);
            if (res.ok) {
                const json = await res.json();
                if (json.data) {
                    setAiForecastData(json.data);
                }
            }
        } catch (e) {
            console.error('Forecast fetch error:', e);
        } finally {
            setAiForecastLoading(false);
        }
    };

    useEffect(() => {
        fetchMarket(profile.location || 'Nagpur');
        fetchAIForecast('wheat');
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
                if (!latest) return null;
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

    // Chart SVG coordinates computation
    const chartSeries = useMemo(() => {
        if (!aiForecastData) return null;

        const hist = aiForecastData.historical;
        const fcast = aiForecastData.forecast;
        const allPoints = [...hist, ...fcast];

        const allPrices = [
            ...allPoints.map(p => p.price),
            ...fcast.map(p => p.upperBound95 || p.price),
            ...fcast.map(p => p.lowerBound95 || p.price),
            aiForecastData.commodity.msp
        ];

        const minPrice = Math.min(...allPrices) * 0.95;
        const maxPrice = Math.max(...allPrices) * 1.05;
        const priceRange = maxPrice - minPrice || 1;

        const width = 800;
        const height = 240;
        const paddingLeft = 45;
        const paddingRight = 20;
        const paddingTop = 20;
        const paddingBottom = 30;

        const chartW = width - paddingLeft - paddingRight;
        const chartH = height - paddingTop - paddingBottom;

        const getX = (index: number) => paddingLeft + (index / (allPoints.length - 1)) * chartW;
        const getY = (val: number) => paddingTop + chartH - ((val - minPrice) / priceRange) * chartH;

        // Hist path
        const histPoints = hist.map((pt, i) => `${getX(i)},${getY(pt.price)}`);
        const histPath = `M ${histPoints.join(' L ')}`;

        // Forecast path (starts at last hist point)
        const fcastPoints = [
            `${getX(hist.length - 1)},${getY(hist[hist.length - 1].price)}`,
            ...fcast.map((pt, i) => `${getX(hist.length + i)},${getY(pt.price)}`)
        ];
        const fcastPath = `M ${fcastPoints.join(' L ')}`;

        // Confidence band polygon
        const upperPoints = fcast.map((pt, i) => `${getX(hist.length + i)},${getY(pt.upperBound95 || pt.price)}`);
        const lowerPointsReversed = [...fcast].reverse().map((pt, i) => {
            const idx = fcast.length - 1 - i;
            return `${getX(hist.length + idx)},${getY(pt.lowerBound95 || pt.price)}`;
        });
        const bandPolygon = `M ${getX(hist.length - 1)},${getY(hist[hist.length - 1].price)} L ${upperPoints.join(' L ')} L ${lowerPointsReversed.join(' L ')} Z`;

        // MSP Line Y
        const mspY = getY(aiForecastData.commodity.msp);
        const splitX = getX(hist.length - 1);

        return {
            width,
            height,
            minPrice,
            maxPrice,
            paddingLeft,
            chartW,
            chartH,
            histPath,
            fcastPath,
            bandPolygon,
            mspY,
            splitX,
            allPoints,
            getX,
            getY
        };
    }, [aiForecastData]);

    return (
        <div className="space-y-8 p-1 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                        <Sparkles className="h-3.5 w-3.5" />
                        Agmarknet / APMC Market Intelligence Desk
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        <BarChart3 className="h-9 w-9 text-blue-600 dark:text-blue-400" />
                        Farm-Aware Market Desk & Price Forecaster
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-3xl text-sm sm:text-base">
                        Combines live APMC mandi spot prices, Govt MSP baselines, and a Double Exponential Smoothing (Holt-Winters) time-series ML engine for optimal harvest selling decisions.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative min-w-[220px]">
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Mandi city location"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => fetchMarket(locationInput)}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] px-4 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Refresh Mandi
                    </button>
                </div>
            </div>

            {/* Popular Mandi Locations */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-muted-foreground font-semibold shrink-0">Popular Hubs:</span>
                {POPULAR_LOCATIONS.map((city) => (
                    <button
                        key={city}
                        type="button"
                        onClick={() => {
                            setLocationInput(city);
                            fetchMarket(city);
                        }}
                        className={`rounded-full border px-3 py-1 font-medium transition-colors shrink-0 ${
                            activeLocation.toLowerCase() === city.toLowerCase()
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-white dark:bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border'
                        }`}
                    >
                        {city}
                    </button>
                ))}
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* AI PRICE FORECASTER (TIME-SERIES ML) SECTION */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-slate-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-card border border-blue-200/80 dark:border-blue-800/40 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-blue-200/60 dark:border-blue-800/40 pb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <Bot className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-blue-950 dark:text-blue-100">
                                AI 30-Day Mandi Price Forecaster (Holt-Winters ML)
                            </h2>
                        </div>
                        <p className="text-xs sm:text-sm text-blue-900/70 dark:text-blue-200/70 mt-1 max-w-2xl">
                            Evaluates 60-day historical time-series with damped linear trends, seasonal price cyclicality, and 95% confidence corridor bands.
                        </p>
                    </div>

                    {/* Commodity Selector Chips */}
                    <div className="flex flex-wrap gap-1.5">
                        {Object.values(COMMODITY_PROFILES).slice(0, 8).map((crop) => (
                            <button
                                key={crop.key}
                                type="button"
                                onClick={() => fetchAIForecast(crop.key)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    selectedCrop === crop.key
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                                        : 'bg-white/80 dark:bg-card border border-border/80 hover:bg-white text-foreground'
                                }`}
                            >
                                {crop.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Forecaster Body */}
                {aiForecastLoading ? (
                    <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
                        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                        <span className="text-sm font-bold text-foreground">Computing Double Exponential Smoothing...</span>
                        <span className="text-xs text-muted-foreground">Fitting level alpha (0.35), trend beta (0.15), damping phi (0.94)</span>
                    </div>
                ) : aiForecastData && chartSeries ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Interactive SVG Chart (8 cols) */}
                        <div className="lg:col-span-8 bg-white dark:bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-3 w-3 rounded-full bg-slate-500 inline-block" />
                                        <span className="font-semibold text-muted-foreground">Historical 60 Days</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`h-3 w-3 rounded-full inline-block ${aiForecastData.trend === 'rising' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        <span className="font-semibold text-muted-foreground">30-Day Prediction</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2 w-4 border-b-2 border-dashed border-amber-500 inline-block" />
                                        <span className="font-semibold text-muted-foreground">Govt MSP (₹{aiForecastData.commodity.msp})</span>
                                    </div>
                                </div>

                                <div className="text-[11px] text-muted-foreground font-mono bg-muted/60 px-2.5 py-1 rounded-lg">
                                    MAPE: {aiForecastData.accuracyMetrics.mape}% • RMSE: ₹{aiForecastData.accuracyMetrics.rmse}
                                </div>
                            </div>

                            {/* SVG Chart Container */}
                            <div className="relative w-full overflow-hidden">
                                <svg
                                    viewBox={`0 0 ${chartSeries.width} ${chartSeries.height}`}
                                    className="w-full h-auto max-h-[300px] overflow-visible select-none"
                                >
                                    <defs>
                                        <linearGradient id="forecastBandGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={aiForecastData.trend === 'rising' ? '#10b981' : '#f43f5e'} stopOpacity="0.18" />
                                            <stop offset="100%" stopColor={aiForecastData.trend === 'rising' ? '#10b981' : '#f43f5e'} stopOpacity="0.03" />
                                        </linearGradient>
                                    </defs>

                                    {/* Grid Lines */}
                                    {[0.25, 0.5, 0.75].map((factor) => {
                                        const y = chartSeries.paddingLeft + factor * chartSeries.chartH;
                                        return (
                                            <line
                                                key={factor}
                                                x1={chartSeries.paddingLeft}
                                                y1={y}
                                                x2={chartSeries.width - 20}
                                                y2={y}
                                                stroke="currentColor"
                                                strokeOpacity="0.08"
                                                strokeDasharray="4 4"
                                            />
                                        );
                                    })}

                                    {/* Govt MSP Dotted Line */}
                                    <line
                                        x1={chartSeries.paddingLeft}
                                        y1={chartSeries.mspY}
                                        x2={chartSeries.width - 20}
                                        y2={chartSeries.mspY}
                                        stroke="#f59e0b"
                                        strokeWidth="1.5"
                                        strokeDasharray="4 4"
                                    />
                                    <text
                                        x={chartSeries.width - 25}
                                        y={chartSeries.mspY - 4}
                                        textAnchor="end"
                                        fill="#f59e0b"
                                        fontSize="10"
                                        fontWeight="bold"
                                    >
                                        MSP ₹{aiForecastData.commodity.msp}
                                    </text>

                                    {/* Historical / Forecast Split Vertical Marker */}
                                    <line
                                        x1={chartSeries.splitX}
                                        y1={15}
                                        x2={chartSeries.splitX}
                                        y2={chartSeries.height - 25}
                                        stroke="#6366f1"
                                        strokeWidth="1.5"
                                        strokeDasharray="3 3"
                                    />
                                    <text
                                        x={chartSeries.splitX + 6}
                                        y={25}
                                        fill="#6366f1"
                                        fontSize="9"
                                        fontWeight="bold"
                                    >
                                        TODAY
                                    </text>

                                    {/* 95% Confidence Band Polygon */}
                                    <path
                                        d={chartSeries.bandPolygon}
                                        fill="url(#forecastBandGrad)"
                                    />

                                    {/* Historical Line */}
                                    <path
                                        d={chartSeries.histPath}
                                        fill="none"
                                        stroke="#64748b"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />

                                    {/* Forecast Trajectory Line */}
                                    <path
                                        d={chartSeries.fcastPath}
                                        fill="none"
                                        stroke={aiForecastData.trend === 'rising' ? '#10b981' : '#f43f5e'}
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />

                                    {/* Interactive Dots & Tooltip Hit Areas */}
                                    {chartSeries.allPoints.map((pt, i) => {
                                        const cx = chartSeries.getX(i);
                                        const cy = chartSeries.getY(pt.price);
                                        return (
                                            <g
                                                key={i}
                                                className="cursor-pointer"
                                                onMouseEnter={() => setHoveredPoint({
                                                    date: pt.date,
                                                    price: pt.price,
                                                    isForecast: pt.isForecast,
                                                    upperBound: pt.upperBound95,
                                                    lowerBound: pt.lowerBound95
                                                })}
                                                onMouseLeave={() => setHoveredPoint(null)}
                                            >
                                                <circle
                                                    cx={cx}
                                                    cy={cy}
                                                    r={pt.isForecast ? 3.5 : 2}
                                                    fill={pt.isForecast ? (aiForecastData.trend === 'rising' ? '#10b981' : '#f43f5e') : '#64748b'}
                                                    className="transition-all hover:r-5"
                                                />
                                            </g>
                                        );
                                    })}
                                </svg>

                                {/* Interactive Hover Tooltip */}
                                {hoveredPoint && (
                                    <div className="absolute top-2 right-4 bg-black/90 text-white text-xs px-3 py-2 rounded-xl shadow-lg pointer-events-none backdrop-blur-sm border border-white/10 z-20">
                                        <div className="font-bold flex items-center gap-1.5">
                                            <span>{hoveredPoint.date}</span>
                                            {hoveredPoint.isForecast && (
                                                <span className="text-[10px] bg-indigo-500 px-1.5 py-0.2 rounded font-mono">Predicted</span>
                                            )}
                                        </div>
                                        <div className="text-sm font-black text-amber-400 mt-0.5">
                                            ₹{hoveredPoint.price.toLocaleString('en-IN')} / quintal
                                        </div>
                                        {hoveredPoint.upperBound && hoveredPoint.lowerBound && (
                                            <div className="text-[10px] text-slate-300 mt-0.5">
                                                95% Range: ₹{hoveredPoint.lowerBound} - ₹{hoveredPoint.upperBound}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                                <span>60-Day Mandi Price History</span>
                                <span className="font-mono">Reference Mandi: {aiForecastData.commodity.mandiHub}</span>
                                <span>30-Day Forward Forecast</span>
                            </div>
                        </div>

                        {/* Trading Signal & Actionable Insights (4 cols) */}
                        <div className="lg:col-span-4 space-y-4">
                            {/* Action Signal Card */}
                            <div className="bg-white dark:bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <ShieldCheck className="h-4 w-4 text-indigo-600" />
                                        AI Trade Advisory
                                    </span>
                                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                                        {aiForecastData.signal.confidence}% Confidence
                                    </span>
                                </div>

                                <div className={`p-4 rounded-xl text-center border ${
                                    aiForecastData.signal.recommendation === 'STRONG SELL'
                                        ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
                                        : aiForecastData.signal.recommendation === 'HOLD IN STORAGE'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                                        : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200'
                                }`}>
                                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Recommended Action</div>
                                    <div className="text-xl font-black tracking-tight mt-0.5">
                                        {aiForecastData.signal.recommendation}
                                    </div>
                                </div>

                                {/* Price Delta & 30-Day Target */}
                                <div className="grid grid-cols-2 gap-2 text-center">
                                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                                        <div className="text-[10px] text-muted-foreground font-semibold">Current Spot</div>
                                        <div className="text-base font-extrabold text-foreground mt-0.5">
                                            ₹{aiForecastData.signal.currentPrice}
                                        </div>
                                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                            +{aiForecastData.signal.aboveMspPercent}% vs MSP
                                        </div>
                                    </div>

                                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                                        <div className="text-[10px] text-muted-foreground font-semibold">30-Day Target</div>
                                        <div className="text-base font-extrabold text-foreground mt-0.5">
                                            ₹{aiForecastData.signal.targetPrice30d}
                                        </div>
                                        <div className={`text-[10px] font-bold flex items-center justify-center gap-0.5 ${
                                            aiForecastData.signal.expectedGainLossPercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                        }`}>
                                            {aiForecastData.signal.expectedGainLossPercent >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                            {aiForecastData.signal.expectedGainLossPercent}%
                                        </div>
                                    </div>
                                </div>

                                {/* Agronomic Rationale */}
                                <div className="text-xs space-y-2 border-t border-border/50 pt-3">
                                    <div className="font-semibold text-foreground">Market Rationale:</div>
                                    <p className="text-muted-foreground leading-relaxed text-[11px]">
                                        {aiForecastData.signal.rationale}
                                    </p>
                                </div>

                                {/* Warehouse / Pledge Advice */}
                                <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs">
                                    <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1 mb-1">
                                        <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                                        WDRA & Storage Strategy:
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed text-[11px]">
                                        {aiForecastData.signal.holdingAdvise}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Top Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tracking Mandi Hub</p>
                    <h3 className="mt-2 text-2xl font-bold text-foreground">{activeLocation}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{profile.crops.length} registered profile crops linked</p>
                </div>
                <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top Weekly Momentum</p>
                    <h3 className="mt-2 text-xl font-bold text-green-700 dark:text-green-400">{bestPerformer?.crop ?? 'Loading...'}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{bestPerformer ? `+${bestPerformer.change.toFixed(1)}% weekly gain` : 'Analyzing APMC feed'}</p>
                </div>
                <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Market Softening Watch</p>
                    <h3 className="mt-2 text-xl font-bold text-rose-700 dark:text-rose-400">{weakestPerformer?.crop ?? 'Loading...'}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{weakestPerformer ? `${weakestPerformer.change.toFixed(1)}% weekly dip` : 'Analyzing APMC feed'}</p>
                </div>
                <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Price Triggers</p>
                    <h3 className="mt-2 text-2xl font-bold text-foreground">{alertHits.filter((item) => item.triggered).length}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Triggered out of {alertHits.length} configured rules</p>
                </div>
            </div>

            {/* Main Market Table & Basket Grid */}
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
                {/* Mandi Table */}
                <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Filter commodity or mandi..."
                            />
                        </div>
                        <div className="flex flex-wrap gap-1 bg-muted/60 p-1 rounded-xl">
                            {(['all', 'grains', 'vegetables', 'fruits'] as CategoryTab[]).map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-all ${
                                        activeTab === tab ? 'bg-white dark:bg-card text-blue-600 shadow-sm font-bold' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300">{error}</div>}

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-muted/50 text-muted-foreground uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 text-left">Commodity</th>
                                    <th className="px-4 py-3 text-left">Market Mandi</th>
                                    <th className="px-4 py-3 text-right">Modal Price (₹/q)</th>
                                    <th className="px-4 py-3 text-right">7-Day Change</th>
                                    <th className="px-4 py-3 text-center">AI Signal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {(relevantCommodities.length ? relevantCommodities : data?.commodities ?? []).map((row) => (
                                    <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3.5 font-bold text-foreground flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fetchAIForecast(row.crop)}
                                                className="hover:text-indigo-600 hover:underline text-left"
                                            >
                                                {row.crop}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3.5 text-muted-foreground">{row.market}</td>
                                        <td className="px-4 py-3.5 text-right font-black text-foreground text-sm">
                                            ₹{row.price.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${trendClass(row.change)}`}>
                                                {row.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                {Math.abs(row.change).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <button
                                                type="button"
                                                onClick={() => fetchAIForecast(row.crop)}
                                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 ${
                                                    row.change > 0 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                                                }`}
                                            >
                                                <Bot className="h-3 w-3" />
                                                {row.change > 0 ? 'Forecast Sell' : 'Forecast Hold'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: Price Alerts & Consumer Basket */}
                <div className="space-y-6">
                    {/* Price Alerts */}
                    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                                <Bell className="h-4 w-4 text-blue-600" />
                                Smart Price Alerts
                            </h3>
                            <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">
                                {alerts.length} Rules
                            </span>
                        </div>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                            {alerts.map((alert, index) => (
                                <div key={`${alert.crop}-${index}`} className="rounded-xl border border-border/70 p-3 bg-muted/20 text-xs">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-foreground">{alert.crop} {alert.condition} ₹{alert.threshold.toLocaleString('en-IN')}</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">{alert.enabled ? 'Active farm alert' : 'Paused'}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setAlerts((current) => current.map((item, currentIndex) => currentIndex === index ? { ...item, enabled: !item.enabled } : item))}
                                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                                                alert.enabled ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground border'
                                            }`}
                                        >
                                            {alert.enabled ? 'Active' : 'Mute'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Consumer Veg & Fruit Basket */}
                    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-card space-y-3">
                        <h3 className="font-bold text-sm flex items-center gap-2 text-foreground">
                            <ChartNoAxesCombined className="h-4 w-4 text-blue-600" />
                            Retail Horticultural Basket
                        </h3>
                        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                            {[...(data?.vegetables ?? []), ...(data?.fruits ?? [])].slice(0, 6).map((item) => {
                                const change = basketChange(item);
                                return (
                                    <div key={item.name} className="flex items-center justify-between rounded-xl border border-border/60 p-2.5 text-xs bg-muted/10">
                                        <div>
                                            <p className="font-bold text-foreground">{item.name}</p>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">₹{item.current.toLocaleString('en-IN')} / {item.unit}</p>
                                        </div>
                                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${trendClass(change)}`}>
                                            {change >= 0 ? '+' : ''}{change}%
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
