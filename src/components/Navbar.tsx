'use client';

import Link from 'next/link';
import { Sprout, Menu, X, Languages } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSiteLanguage } from '@/lib/siteLanguage';

export default function Navbar() {
    const [mounted, setMounted] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    useEffect(() => {
        setMounted(true);
        try {
            setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
        } catch {
            setIsLoggedIn(false);
        }
    }, []);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { language, setLanguage, t } = useSiteLanguage();

    const navLinks = [
        { href: '/dashboard', label: t('dashboard') },
        { href: '/dashboard/advisory', label: t('advisory') },
        { href: '/dashboard/weather', label: t('weather') },
        { href: '/dashboard/market', label: t('market') },
        { href: '/yojana-sahayak', label: t('yojana') },
    ];

    const isActive = (href: string) => href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

    return (
        <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-backdrop-filter:bg-background/40 transition-all duration-300">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2 group">
                    <div className="p-1.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 ring-1 ring-inset ring-primary/10">
                        <Sprout className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">SmartAgriSense</span>
                </Link>

                <div className="hidden md:flex items-center space-x-1 p-1 rounded-full bg-secondary/5 border border-secondary/10">
                    {navLinks.map(({ href, label }) => (
                        <Link key={href} href={href}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                                isActive(href)
                                    ? 'bg-white dark:bg-card text-primary font-semibold shadow-sm'
                                    : 'text-muted-foreground hover:text-primary hover:bg-white/50 hover:shadow-sm'
                            }`}>
                            {label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center space-x-4">
                    <div className="hidden md:flex items-center rounded-full border border-secondary/10 bg-secondary/5 px-3 py-1.5">
                        <Languages className="mr-2 h-4 w-4 text-muted-foreground" />
                        <select
                            title={t('settings')}
                            value={language}
                            onChange={(event) => setLanguage(event.target.value as typeof language)}
                            className="bg-transparent text-xs font-semibold text-foreground outline-none"
                        >
                            <option className="bg-background text-foreground" value="en">EN</option>
                            <option className="bg-background text-foreground" value="hi">HI</option>
                            <option className="bg-background text-foreground" value="mr">MR</option>
                            <option className="bg-background text-foreground" value="ta">TA</option>
                            <option className="bg-background text-foreground" value="te">TE</option>
                            <option className="bg-background text-foreground" value="kn">KN</option>
                            <option className="bg-background text-foreground" value="bn">BN</option>
                            <option className="bg-background text-foreground" value="pa">PA</option>
                        </select>
                    </div>
                    {mounted && isLoggedIn ? (
                        <Link href="/dashboard" className="hidden md:inline-flex h-10 items-center justify-center rounded-full bg-primary/90 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary hover:-translate-y-0.5 hover:shadow-primary/30 active:scale-95">
                            {t('myDashboard')}
                        </Link>
                    ) : (
                        <Link href="/signup" className="hidden md:inline-flex h-10 items-center justify-center rounded-full bg-primary/90 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary hover:-translate-y-0.5 hover:shadow-primary/30 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            {t('startForFree') || 'Sign Up'}
                        </Link>
                    )}
                    <button
                        type="button"
                        aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
                        title={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-foreground hover:bg-accent rounded-xl transition-colors"
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
                    <div className="container py-4 space-y-2">
                        <div className="flex items-center rounded-xl border border-secondary/10 bg-secondary/5 px-3 py-2 mb-2">
                            <Languages className="mr-2 h-4 w-4 text-muted-foreground" />
                            <select
                                title={t('settings')}
                                value={language}
                                onChange={(event) => setLanguage(event.target.value as typeof language)}
                                className="w-full bg-transparent text-sm font-semibold text-foreground outline-none"
                            >
                                <option className="bg-background text-foreground" value="en">EN</option>
                                <option className="bg-background text-foreground" value="hi">HI</option>
                                <option className="bg-background text-foreground" value="mr">MR</option>
                                <option className="bg-background text-foreground" value="ta">TA</option>
                                <option className="bg-background text-foreground" value="te">TE</option>
                                <option className="bg-background text-foreground" value="kn">KN</option>
                                <option className="bg-background text-foreground" value="bn">BN</option>
                                <option className="bg-background text-foreground" value="pa">PA</option>
                            </select>
                        </div>
                        {navLinks.map(({ href, label }) => (
                            <Link key={href} href={href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    isActive(href)
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-muted-foreground hover:text-primary hover:bg-muted'
                                }`}>
                                {label}
                            </Link>
                        ))}
                        {mounted && isLoggedIn ? (
                            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block md:hidden h-10 items-center justify-center rounded-full bg-primary/90 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary hover:-translate-y-0.5 hover:shadow-primary/30 active:scale-95 text-center mt-2">
                                {t('myDashboard')}
                            </Link>
                        ) : (
                            <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block md:hidden h-10 items-center justify-center rounded-full bg-primary/90 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary hover:-translate-y-0.5 hover:shadow-primary/30 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-center mt-2">
                                {t('startForFree') || 'Sign Up'}
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
