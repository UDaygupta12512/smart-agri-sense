'use client';

import Link from 'next/link';
import { Sprout, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useSiteLanguage } from '@/lib/siteLanguage';

export default function Footer() {
    const { t } = useSiteLanguage();

    return (
        <footer className="border-t border-border/40 bg-secondary/5 pt-24 pb-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
            <div className="absolute bottom-0 left-0 w-full h-[500px] bg-linear-to-t from-background to-transparent pointer-events-none" />
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Sprout className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-xl font-bold text-foreground">SmartAgriSense</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            {t('empowering')}
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-6 text-foreground">{t('platform')}</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/dashboard" className="hover:text-primary transition-colors">{t('dashboard')}</Link></li>
                            <li><Link href="/dashboard/advisory" className="hover:text-primary transition-colors">{t('aiAdvisory')}</Link></li>
                            <li><Link href="/dashboard/weather" className="hover:text-primary transition-colors">{t('weatherForecast')}</Link></li>
                            <li><Link href="/dashboard/market" className="hover:text-primary transition-colors">{t('marketPrices')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-6 text-foreground">{t('resources')}</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/blog" className="hover:text-primary transition-colors">{t('farmingBlog')}</Link></li>
                            <li><Link href="/guides" className="hover:text-primary transition-colors">{t('cropGuides')}</Link></li>
                            <li><Link href="/dashboard/schemes" className="hover:text-primary transition-colors">{t('govtSchemes')}</Link></li>
                            <li><Link href="/dashboard/forum" className="hover:text-primary transition-colors">{t('community')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-6 text-foreground">{t('contact')}</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>support@smartagrisense.com</li>
                            <li>+91 1800-123-4567</li>
                            <li className="pt-2">
                                <span className="block text-xs font-medium text-foreground mb-1">{t('office')}</span>
                                123 Innovation Hub, Tech City,<br />
                                Bangalore, India 560100
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} SmartAgriSense. All rights reserved.</p>
                    <div className="flex space-x-6">
                        <Link href="/privacy" className="hover:text-foreground transition-colors">{t('privacyPolicy')}</Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">{t('termsOfService')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
