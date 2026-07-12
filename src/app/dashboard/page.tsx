'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    CloudSun,
    Droplets,
    TrendingUp,
    AlertTriangle,
    Leaf,
    Bug,
    ShoppingCart,
    Calendar,
    ArrowRight,
    Sprout,
    BarChart3,
    Thermometer,
    Wind,
    DollarSign,
    Bell,
    Sparkles,
    Activity,
    Target,
    LineChart,
    Mic,
    Volume2,
    Play,
    Pause,
    AudioLines
} from 'lucide-react';

// Quick action cards
const quickActions = [
    {
        title: 'Weather Forecast',
        description: 'Check 7-day forecast & alerts',
        icon: CloudSun,
        href: '/dashboard/weather',
        color: 'blue',
        stat: '32°C',
        substat: 'Sunny'
    },
    {
        title: 'Plant Doctor',
        description: 'AI disease diagnosis',
        icon: Bug,
        href: '/dashboard/pest-detection',
        color: 'red',
        stat: 'Scan Now',
        substat: 'Live camera ready'
    },
    {
        title: 'Market Prices',
        description: 'Live Mandi rates',
        icon: ShoppingCart,
        href: '/dashboard/market',
        color: 'green',
        stat: '₹4,120',
        substat: 'Rice ↑3.2%'
    },
    {
        title: 'Crop Advisory',
        description: 'AI recommendations',
        icon: Sprout,
        href: '/dashboard/advisory',
        color: 'amber',
        stat: '3 Tips',
        substat: 'For your crops'
    },
    {
        title: 'Voice Q&A',
        description: 'Ask and hear answers',
        icon: Mic,
        href: '/dashboard/voice-assistant',
        color: 'green',
        stat: 'Live',
        substat: 'Multilingual'
    },
    {
        title: 'Yield Predictor',
        description: 'AI harvest forecasting',
        icon: LineChart,
        href: '/dashboard/yield-predictor',
        color: 'blue',
        stat: 'Simulate',
        substat: 'Accurate model'
    }
];

interface AlertItem {
    type: string;
    title: string;
    message: string;
    time: string;
}

interface CropHealthItem {
    name: string;
    health: number;
    area: string;
    stage: string;
}

export default function Dashboard() {
    const [greeting] = useState(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    });

    const [userName, setUserName] = useState(() => {
        try { return localStorage.getItem('userName') || 'Farmer'; } catch { return 'Farmer'; }
    });

    const todayDate = new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const [recentAlerts, setRecentAlerts] = useState<AlertItem[]>([]);
    const [cropHealth, setCropHealth] = useState<CropHealthItem[]>([]);

    useEffect(() => {
        fetch('/api/dashboard/stats')
            .then(res => res.json())
            .then(data => {
                setRecentAlerts(data.recentAlerts || []);
                setCropHealth(data.cropHealth || []);
            })
            .catch(err => console.error('Failed to fetch dashboard stats:', err));
    }, []);

    const warningAlertCount = recentAlerts.filter(a => a.type === 'warning').length;
    const newAlertCount = recentAlerts.filter(a => a.type === 'warning' || a.type === 'info').length;

    // --- AI Audio Briefing State ---
    const [isPlayingBrief, setIsPlayingBrief] = useState(false);
    
    const playBriefing = () => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        
        if (isPlayingBrief) {
            window.speechSynthesis.cancel();
            setIsPlayingBrief(false);
            return;
        }

        const briefText = `Good morning ${userName}. Today is ${todayDate}. ${cropHealth.length > 0 ? `Your ${cropHealth[0].name} crop is currently in the ${cropHealth[0].stage} stage with a health score of ${cropHealth[0].health}%. ` : ''}The local weather forecasts a maximum of 32 degrees with sunny conditions. In the market, Wheat prices have increased by 3.8% since last week. Overall, no critical alerts require immediate action today. Have a productive day on the farm.`;
        
        const utterance = new SpeechSynthesisUtterance(briefText);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        // Optional: Pick a nice voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => setIsPlayingBrief(false);
        utterance.onerror = () => setIsPlayingBrief(false);
        
        setIsPlayingBrief(true);
        window.speechSynthesis.speak(utterance);
    };

    const hour = new Date().getHours();
    let timeTheme = '';
    let timeIcon = '';
    
    if (hour < 12) {
        timeTheme = 'from-amber-400 via-orange-500 to-rose-500'; // Morning sunrise
        timeIcon = '🌅';
    } else if (hour < 17) {
        timeTheme = 'from-sky-400 via-blue-500 to-cyan-600'; // Afternoon sky
        timeIcon = '☀️';
    } else if (hour < 20) {
        timeTheme = 'from-violet-500 via-fuchsia-600 to-orange-500'; // Evening sunset
        timeIcon = '🌇';
    } else {
        timeTheme = 'from-slate-800 via-indigo-900 to-slate-900'; // Night sky
        timeIcon = '🌙';
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        {greeting}, {userName}!
                        <span className="text-2xl">{timeIcon}</span>
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {todayDate} — Here&apos;s what&apos;s happening with your farm today.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/analytics"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                    >
                        <BarChart3 className="h-4 w-4" />
                        View Analytics
                    </Link>
                </div>
            </div>

            {/* AI Audio Briefing Card (Dynamic Theming) */}
            <div className={`relative rounded-2xl overflow-hidden shadow-xl border border-white/20 bg-linear-to-r ${timeTheme} p-1 transition-all duration-1000`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
                <div className="relative h-full w-full bg-white/10 backdrop-blur-xl rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-white">
                        <div className={`p-4 rounded-full bg-white/20 shadow-inner flex items-center justify-center transition-all duration-500 ${isPlayingBrief ? 'animate-pulse ring-4 ring-white/30' : ''}`}>
                            <Volume2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                Daily AI Briefing
                                {isPlayingBrief && (
                                    <span className="flex gap-1 ml-2">
                                        <span className="w-1.5 h-4 bg-green-300 rounded-full animate-[bounce_1s_infinite_0.1s]"></span>
                                        <span className="w-1.5 h-6 bg-green-300 rounded-full animate-[bounce_1s_infinite_0.3s]"></span>
                                        <span className="w-1.5 h-3 bg-green-300 rounded-full animate-[bounce_1s_infinite_0.5s]"></span>
                                    </span>
                                )}
                            </h3>
                            <p className="text-white/80 text-sm mt-1 max-w-lg">
                                Listen to your personalized smart farm summary for today, including crop stages, weather, and market updates.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={playBriefing}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-teal-700 hover:bg-teal-50 rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 shrink-0"
                    >
                        {isPlayingBrief ? (
                            <>
                                <Pause className="h-5 w-5 fill-current" /> Pause Briefing
                            </>
                        ) : (
                            <>
                                <Play className="h-5 w-5 fill-current" /> Play Briefing
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Key Stats Row */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <div className="rounded-xl border bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-lg p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                    <div className="flex flex-row items-start justify-between space-y-0 pb-2 relative z-10">
                        <div>
                            <h3 className="tracking-tight text-sm font-medium text-blue-100">Current Weather</h3>
                            <div className="text-3xl font-bold mt-1">32°C</div>
                            <p className="text-xs text-blue-100 mt-1 flex items-center gap-1">
                                <Droplets className="h-3 w-3" /> Humidity 38%
                            </p>
                        </div>
                        <div className="p-2 bg-white/20 rounded-xl">
                            <CloudSun className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-linear-to-br from-green-500 to-green-600 text-white shadow-lg p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                    <div className="flex flex-row items-start justify-between space-y-0 pb-2 relative z-10">
                        <div>
                            <h3 className="tracking-tight text-sm font-medium text-green-100">Crop Health</h3>
                            <div className="text-3xl font-bold mt-1">85%</div>
                            <p className="text-xs text-green-100 mt-1 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" /> +3% this week
                            </p>
                        </div>
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Leaf className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-linear-to-br from-amber-500 to-amber-600 text-white shadow-lg p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                    <div className="flex flex-row items-start justify-between space-y-0 pb-2 relative z-10">
                        <div>
                            <h3 className="tracking-tight text-sm font-medium text-amber-100">Market Trend</h3>
                            <div className="text-3xl font-bold mt-1">↑ Wheat</div>
                            <p className="text-xs text-amber-100 mt-1">+3.8% since last week</p>
                        </div>
                        <div className="p-2 bg-white/20 rounded-xl">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-linear-to-br from-red-500 to-red-600 text-white shadow-lg p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                    <div className="flex flex-row items-start justify-between space-y-0 pb-2 relative z-10">
                        <div>
                            <h3 className="tracking-tight text-sm font-medium text-red-100">Active Alerts</h3>
                            <div className="text-3xl font-bold mt-1">{warningAlertCount}</div>
                            <p className="text-xs text-red-100 mt-1">Requires attention</p>
                        </div>
                        <div className="p-2 bg-white/20 rounded-xl">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Quick Actions
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {quickActions.map((action, idx) => (
                        <Link
                            key={idx}
                            href={action.href}
                            className="group rounded-xl border bg-card hover:bg-muted/50 text-card-foreground shadow-sm p-5 transition-all hover:shadow-md hover:border-primary/50"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${action.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                    action.color === 'red' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                        action.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                            'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                                    }`}>
                                    <action.icon className="h-6 w-6" />
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                            <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold text-primary">{action.stat}</span>
                                <span className="text-xs text-muted-foreground">{action.substat}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                {/* Crop Health Overview */}
                <div className="lg:col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex flex-col space-y-1.5 p-6 border-b border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-green-500" />
                                    Crop Health Overview
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">Your registered crops this season</p>
                            </div>
                            <Link href="/dashboard/my-farm" className="text-sm text-primary hover:underline font-medium">
                                View All →
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-5">
                            {cropHealth.map((crop, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="relative h-16 w-16">
                                        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                className="text-muted"
                                            />
                                            <path
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeDasharray={`${crop.health}, 100`}
                                                className={crop.health >= 85 ? 'text-green-500' : crop.health >= 70 ? 'text-amber-500' : 'text-red-500'}
                                            />
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                                            {crop.health}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-bold">{crop.name}</h4>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${crop.health >= 85 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                crop.health >= 70 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {crop.health >= 85 ? 'Healthy' : crop.health >= 70 ? 'Fair' : 'Attention'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{crop.area} • {crop.stage}</p>
                                        <progress
                                            className={`mt-2 h-2 w-full rounded-full overflow-hidden ${crop.health >= 85 ? 'accent-green-500' : crop.health >= 70 ? 'accent-amber-500' : 'accent-red-500'}`}
                                            value={crop.health}
                                            max={100}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Alerts & Advisory */}
                <div className="lg:col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="flex flex-col space-y-1.5 p-6 border-b border-border">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
                                <Bell className="h-5 w-5 text-amber-500" />
                                Recent Alerts
                            </h3>
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                {newAlertCount} New
                            </span>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="space-y-3">
                            {recentAlerts.map((alert, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-xl border ${alert.type === 'warning' ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/30' :
                                        alert.type === 'success' ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30' :
                                            'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/30'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-1.5 rounded-full ${alert.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' :
                                            alert.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                                                'bg-blue-100 dark:bg-blue-900/30'
                                            }`}>
                                            {alert.type === 'warning' ? (
                                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                            ) : alert.type === 'success' ? (
                                                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium text-sm">{alert.title}</h4>
                                                <span className="text-xs text-muted-foreground">{alert.time}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link
                            href="/dashboard/weather"
                            className="mt-4 flex items-center justify-center gap-2 py-2 text-sm text-primary hover:underline font-medium"
                        >
                            View All Alerts <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Farm Command Center Map Grid */}
            <div className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="flex flex-col space-y-1.5 p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                Farm Command Center
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">Satellite-view health map of your farm plots</p>
                        </div>
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">LIVE</span>
                    </div>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
                        {[
                            { name: 'Plot A1', crop: 'Wheat', health: 92, status: 'healthy' },
                            { name: 'Plot A2', crop: 'Rice', health: 78, status: 'water' },
                            { name: 'Plot A3', crop: 'Cotton', health: 45, status: 'pest' },
                            { name: 'Plot B1', crop: 'Sugarcane', health: 88, status: 'healthy' },
                            { name: 'Plot B2', crop: 'Soybean', health: 65, status: 'water' },
                            { name: 'Plot B3', crop: 'Wheat', health: 95, status: 'healthy' },
                            { name: 'Plot C1', crop: 'Maize', health: 82, status: 'healthy' },
                            { name: 'Plot C2', crop: 'Mustard', health: 55, status: 'pest' },
                            { name: 'Plot C3', crop: 'Rice', health: 90, status: 'healthy' },
                        ].map((plot, idx) => (
                            <div
                                key={idx}
                                className={`relative aspect-square rounded-xl border-2 p-3 flex flex-col items-center justify-center text-center transition-all hover:scale-105 cursor-pointer ${
                                    plot.status === 'healthy'
                                        ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-800'
                                        : plot.status === 'water'
                                            ? 'bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-800'
                                            : 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-800 animate-pulse'
                                }`}
                            >
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{plot.name}</span>
                                <span className={`text-lg font-extrabold mt-1 ${
                                    plot.status === 'healthy' ? 'text-green-600 dark:text-green-400'
                                        : plot.status === 'water' ? 'text-amber-600 dark:text-amber-400'
                                            : 'text-red-600 dark:text-red-400'
                                }`}>{plot.health}%</span>
                                <span className="text-[10px] text-muted-foreground font-medium">{plot.crop}</span>
                                {plot.status === 'pest' && (
                                    <span className="absolute top-1 right-1 text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">🐛 PEST</span>
                                )}
                                {plot.status === 'water' && (
                                    <span className="absolute top-1 right-1 text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">💧 DRY</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-green-500"></div> Healthy</div>
                        <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-amber-500"></div> Needs Water</div>
                        <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div> Pest Alert</div>
                    </div>
                </div>
            </div>

            {/* AI Assistant Promo */}
            <div className="rounded-2xl bg-linear-to-r from-primary via-emerald-500 to-teal-500 p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                            <Sparkles className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Meet Kisan Sahayak</h3>
                            <p className="text-white/80">Your 24/7 AI agricultural assistant. Ask anything in your language!</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                            🗣️ Voice Enabled
                        </span>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                            🌐 7 Languages
                        </span>
                        <Link
                            href="/dashboard/advisory"
                            className="px-5 py-2 bg-white text-primary rounded-full text-sm font-bold hover:bg-white/90 transition-colors shadow-lg"
                        >
                            Ask Now →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
