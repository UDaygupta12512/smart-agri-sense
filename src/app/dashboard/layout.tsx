'use client';

import Sidebar from '@/components/Sidebar';
import { useState, useEffect, useRef } from 'react';
import { Menu, Bell } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useSiteLanguage } from '@/lib/siteLanguage';

const PAGE_TITLE_KEYS: Record<string, string> = {
    '/dashboard': 'overview',
    '/dashboard/analytics': 'analytics',
    '/dashboard/calendar': 'cropCalendar',
    '/dashboard/weather': 'weatherForecast',
    '/dashboard/advisory': 'cropAdvisory',
    '/dashboard/voice-assistant': 'voiceAssistant',
    '/dashboard/pest-detection': 'plantDoctor',
    '/dashboard/market': 'marketPrices',
    '/dashboard/schemes': 'govtSchemes',
    '/dashboard/msp': 'msp',
    '/dashboard/forum': 'communityForum',
    '/dashboard/labs': 'soilLabs',
    '/dashboard/fertilizer': 'fertilizerCalc',
    '/dashboard/yield-predictor': 'yieldPredictor',
    '/dashboard/settings': 'settings',
};

interface SessionUser {
    name?: string;
    email?: string;
    location?: string;
}

function getInitials(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) {
        return 'FA';
    }

    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

import { createClient } from '@/utils/supabase/client';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [userInitials, setUserInitials] = useState('FA');
    const pathname = usePathname();
    const router = useRouter();
    const { t } = useSiteLanguage();
    const pageTitle = t(PAGE_TITLE_KEYS[pathname] ?? 'dashboard');
    const notifRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Fetch user details for the header avatar in the background without blocking render.
    // The route itself is protected by Next.js middleware, so we don't need to block UI.
    useEffect(() => {
        let isMounted = true;

        async function checkAuth() {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();

                if (error || !user) {
                    if (isMounted) router.replace('/login');
                    return;
                }

                const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Farmer';

                if (isMounted) {
                    setUserInitials(getInitials(displayName));
                }

                try {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userName', displayName);
                    if (user.email) {
                        localStorage.setItem('userEmail', user.email);
                    }
                } catch {
                    // localStorage may be unavailable
                }
            } catch {
                if (isMounted) router.replace('/login');
            }
        }

        void checkAuth();

        return () => {
            isMounted = false;
        };
    }, [router]);

    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Heatwave Alert', message: 'Temperatures of 38-40°C forecast next 4 days.', time: '1h ago', unread: true },
        { id: 2, title: 'MSP Update', message: `Wheat MSP ${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(2)} set at ₹2,425/qtl.`, time: '6h ago', unread: true },
        { id: 3, title: 'Forum Reply', message: 'Dr. Sharma replied to your pest query.', time: '1d ago', unread: false },
    ]);
    const unreadCount = notifications.filter(n => n.unread).length;

    // Close notifications panel on outside click
    useEffect(() => {
        function handleOutsideClick(e: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
        }
        if (showNotifications) {
            document.addEventListener('mousedown', handleOutsideClick);
        }
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [showNotifications]);

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[288px_1fr] bg-muted/20">
            {/* Mobile Sidebar Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 md:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden ${
                isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <Sidebar isMobile={true} onClose={() => setIsMobileSidebarOpen(false)} />
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            <div className="flex flex-col">
                <header className="flex h-16 items-center gap-4 border-b border-border/40 bg-background/60 px-6 backdrop-blur-xl sticky top-0 z-10 supports-backdrop-filter:bg-background/40">
                    <button
                        type="button"
                        aria-label="Open sidebar"
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="md:hidden p-2 text-foreground hover:bg-accent rounded-xl transition-colors"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="w-full flex-1">
                        <h1 className="text-xl font-bold tracking-tight text-foreground">{pageTitle}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Notification Bell */}
                        <div className="relative" ref={notifRef}>
                            <button
                                type="button"
                                aria-label="Toggle notifications"
                                onClick={() => setShowNotifications(p => !p)}
                                className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                            >
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 top-12 w-80 bg-background border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
                                    <div className="p-4 border-b border-border flex items-center justify-between">
                                        <p className="font-bold text-sm">Notifications</p>
                                        {unreadCount > 0 && (
                                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">{unreadCount} {t('unread')}</span>
                                        )}
                                    </div>
                                    <div className="divide-y divide-border">
                                        {notifications.map(n => (
                                            <div key={n.id} className={`p-4 hover:bg-muted/50 transition-colors ${n.unread ? 'bg-primary/5' : ''}`}>
                                                <div className="flex items-start gap-3">
                                                    {n.unread && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                                                    {!n.unread && <div className="h-2 w-2 mt-1.5 shrink-0" />}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold">{n.title}</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                                            setShowNotifications(false);
                                        }}
                                        className="w-full p-3 text-xs text-primary hover:bg-muted/50 font-medium transition-colors"
                                    >
                                        {t('markAllRead')}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="h-9 w-9 rounded-full bg-linear-to-br from-primary to-green-600 flex items-center justify-center text-white font-bold shadow-md shadow-green-500/20 ring-2 ring-white/20">
                            {userInitials}
                        </div>
                    </div>
                </header>

                {/* Bloomberg-Style Market Ticker Tape */}
                <div className="w-full bg-slate-900 border-b border-slate-800 flex items-center overflow-hidden h-8 shrink-0">
                    <style dangerouslySetInnerHTML={{ __html: `
                        @keyframes marquee {
                            0% { transform: translateX(100%); }
                            100% { transform: translateX(-100%); }
                        }
                    `}} />
                    <div className="bg-primary text-white text-xs font-bold px-3 py-1.5 z-10 flex items-center h-full shadow-lg whitespace-nowrap">
                        LIVE MARKET
                    </div>
                    <div className="flex-1 overflow-hidden relative h-full flex items-center">
                        <div className="absolute whitespace-nowrap flex items-center gap-8 text-xs font-mono text-slate-300" style={{ animation: 'marquee 25s linear infinite' }}>
                            <span>WHEAT: ₹2400 <span className="text-emerald-400">▲ ₹45</span></span>
                            <span className="text-slate-600">|</span>
                            <span>RICE: ₹2100 <span className="text-red-400">▼ ₹15</span></span>
                            <span className="text-slate-600">|</span>
                            <span>COTTON: ₹6800 <span className="text-emerald-400">▲ ₹120</span></span>
                            <span className="text-slate-600">|</span>
                            <span>SUGARCANE: ₹315 <span className="text-slate-400">- ₹0</span></span>
                            <span className="text-slate-600">|</span>
                            <span>SOYBEAN: ₹4200 <span className="text-red-400">▼ ₹30</span></span>
                            <span className="text-slate-600">|</span>
                            <span>MUSTARD: ₹5600 <span className="text-emerald-400">▲ ₹80</span></span>
                            <span className="text-slate-600">|</span>
                            <span>ONION: ₹1800 <span className="text-emerald-400">▲ ₹150</span></span>
                        </div>
                    </div>
                </div>

                <main className="flex flex-1 flex-col gap-6 p-6 lg:gap-8 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
