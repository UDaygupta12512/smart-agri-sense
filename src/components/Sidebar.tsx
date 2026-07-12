"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useSiteLanguage } from '@/lib/siteLanguage';
import {
    LayoutDashboard,
    CloudSun,
    Sprout,
    ShoppingCart,
    Bug,
    Settings,
    LogOut,
    MessageSquare,
    BookOpen,
    Calendar,
    Warehouse,
    IndianRupee,
    BarChart3,
    LineChart,
    Mic,
    Droplets,
    Landmark,
    GitBranch,
    PlayCircle,
} from 'lucide-react';

const sidebarItems = [
    { key: 'overview', href: '/dashboard', icon: LayoutDashboard },
    { key: 'analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { key: 'cropCalendar', href: '/dashboard/calendar', icon: Calendar },
    { key: 'cropLifecycle', href: '/dashboard/crop-lifecycle', icon: GitBranch },
    { key: 'weather', href: '/dashboard/weather', icon: CloudSun },
    { key: 'smartIrrigation', href: '/dashboard/irrigation', icon: Droplets },
    { key: 'fertilizerCalc', href: '/dashboard/fertilizer', icon: Sprout },
    { key: 'cropAdvisory', href: '/dashboard/advisory', icon: Sprout },
    { key: 'voiceAssistant', href: '/dashboard/voice-assistant', icon: Mic },
    { key: 'plantDoctor', href: '/dashboard/pest-detection', icon: Bug },
    { key: 'marketPrices', href: '/dashboard/market', icon: ShoppingCart },
    { key: 'govtSchemes', href: '/dashboard/schemes', icon: BookOpen },
    { key: 'loanEligibility', href: '/dashboard/loan', icon: Landmark },
    { key: 'msp', href: '/dashboard/msp', icon: IndianRupee },
    { key: 'communityForum', href: '/dashboard/forum', icon: MessageSquare },
    { key: 'yieldPredictor', href: '/dashboard/yield-predictor', icon: LineChart },
    { key: 'agriShorts', href: '/dashboard/agri-shorts', icon: PlayCircle },
    { key: 'settings', href: '/dashboard/settings', icon: Settings },
];

interface SidebarProps {
    isMobile?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isMobile = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [isSigningOut, setIsSigningOut] = useState(false);
    const { t } = useSiteLanguage();

    const handleSignOut = async () => {
        if (isSigningOut) {
            return;
        }

        setIsSigningOut(true);

        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });
        } catch {
            // Even if API logout fails, clear local client state below.
        }

        try {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userPhone');
            localStorage.removeItem('userLocation');
            localStorage.removeItem('appSettings');
        } catch {
            // localStorage can be unavailable in strict privacy modes.
        }

        window.location.href = '/';
    };

    return (
        <div className={cn(
            "border-r border-border/40 bg-card/50 backdrop-blur-xl w-72 min-h-screen",
            isMobile ? "block" : "hidden md:block"
        )}>
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-16 items-center justify-between border-b border-border/40 px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                            <Sprout className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-lg tracking-tight text-foreground">SmartAgriSense</span>
                    </Link>
                    {isMobile && onClose && (
                        <button
                            type="button"
                            aria-label="Close sidebar"
                            onClick={onClose}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
                <div className="flex-1 py-4">
                    <nav className="grid items-start px-4 text-sm font-medium gap-1">
                        {sidebarItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => isMobile && onClose?.()}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                                    pathname === item.href
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {t(item.key)}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="mt-auto p-4 border-t border-border/40">
                    <button
                        type="button"
                        onClick={() => {
                            void handleSignOut();
                        }}
                        disabled={isSigningOut}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                    >
                        <LogOut className="h-4 w-4" />
                        {isSigningOut ? t('signingOut') : t('signOut')}
                    </button>
                </div>
            </div>
        </div>
    );
}
