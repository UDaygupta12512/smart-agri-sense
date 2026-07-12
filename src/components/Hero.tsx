'use client';

import Link from 'next/link';
import { ArrowRight, Sprout, ShieldCheck, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSiteLanguage } from '@/lib/siteLanguage';

export default function Hero() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    useEffect(() => {
        try {
            setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
        } catch {
            setIsLoggedIn(false);
        }
    }, []);
    const { t } = useSiteLanguage();

    return (
        <section className="relative overflow-hidden py-32 lg:py-40 bg-background selection:bg-primary/20">
            {/* Rich Background Gradients */}
            <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-linear-to-br from-primary/10 to-green-400/10 rounded-full blur-[120px] opacity-60 animate-blob mix-blend-multiply" />
                <div className="absolute top-[30%] right-[-10%] w-[800px] h-[800px] bg-linear-to-bl from-secondary/15 to-yellow-400/10 rounded-full blur-[100px] opacity-50 animate-blob animation-delay-4000 mix-blend-multiply" />
                <div className="absolute bottom-[-20%] left-[20%] w-[800px] h-[800px] bg-linear-to-tr from-emerald-500/10 to-primary/10 rounded-full blur-[120px] opacity-40 animate-blob animation-delay-2000 mix-blend-multiply" />

                {/* Texture Overlay */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div className="container relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col items-start text-left"
                    >
                        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary mb-8 backdrop-blur-md shadow-sm ring-1 ring-primary/10 hover:bg-primary/10 transition-colors">
                            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse shadow-[0_0_12px_rgba(39,174,96,0.6)]"></span>
                            {t('aiPoweredFarmingAssistant')}
                        </div>

                        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-7xl mb-8 leading-[1.05] text-foreground">
                            {t('farmingMade')} <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-emerald-600 to-secondary animate-gradient-x bg-size-[200%_auto] pb-2">
                                {t('smarterBetter')}
                            </span>
                        </h1>

                        <p className="text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed font-medium">
                            {t('heroSubtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
                            <button
                                onClick={() => {
                                    window.location.href = isLoggedIn ? '/dashboard' : '/signup';
                                }}
                                className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-8 text-lg font-semibold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            >
                                {t('startForFree')}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </button>
                            <Link href="/login" className="inline-flex h-14 items-center justify-center rounded-full border border-border bg-white/50 backdrop-blur-md px-8 text-lg font-medium text-foreground shadow-sm transition-all hover:bg-white/80 hover:text-primary hover:border-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                {t('signIn')}
                            </Link>
                        </div>

                        <div className="mt-12 flex items-center gap-8 text-sm font-semibold text-foreground/80">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-full bg-green-100 dark:bg-green-900/30">
                                    <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <span>{t('verifiedData')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-full bg-amber-100 dark:bg-amber-900/30">
                                    <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <span>{t('accuracy95')}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Visual Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                        className="relative lg:h-[700px] flex items-center justify-center perspective-[2000px]"
                    >
                        <div className="relative w-full max-w-[600px] aspect-square transform-style-3d rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out">
                            {/* Organic decorative circles */}
                            <div className="absolute inset-0 border border-primary/10 rounded-full animate-[spin_30s_linear_infinite]" />
                            <div className="absolute inset-16 border border-primary/20 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                            <div className="absolute inset-32 border border-secondary/20 rounded-full animate-[spin_50s_linear_infinite]" />

                            {/* Central Card */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-white/80 dark:bg-card/80 backdrop-blur-3xl border border-white/50 dark:border-white/10 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] p-10 flex flex-col justify-between overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                                {/* Subtle internal gradient */}
                                <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/15 blur-[100px] rounded-full pointer-events-none" />

                                <div className="relative z-10 flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-primary to-green-600 flex items-center justify-center shadow-lg shadow-primary/20 text-white">
                                            <Sprout className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-xl text-foreground">{t('cropHealthCard')}</p>
                                            <p className="text-sm text-muted-foreground font-medium">{t('wheatField2')}</p>
                                        </div>
                                    </div>
                                    <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100/80 dark:bg-emerald-900/40 px-4 py-2 rounded-full text-sm backdrop-blur-sm border border-emerald-200/50">+12% Yield</span>
                                </div>

                                <div className="relative z-10 space-y-6">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t('nitrogenLevel')}</span>
                                        <span className="font-bold text-2xl text-foreground">85%</span>
                                    </div>
                                    <div className="h-4 w-full bg-muted/50 rounded-full overflow-hidden p-1 border border-black/5">
                                        <motion.div
                                            initial={{ width: "0%" }}
                                            animate={{ width: "85%" }}
                                            transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                                            className="h-full bg-linear-to-r from-primary to-emerald-400 rounded-full shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="relative z-10 mt-8 grid grid-cols-2 gap-5">
                                    <div className="p-5 bg-linear-to-br from-white/60 to-white/20 dark:from-muted/40 dark:to-muted/10 rounded-3xl border border-white/60 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Moisture</p>
                                        </div>
                                        <p className="font-extrabold text-3xl text-foreground">64%</p>
                                        <p className="text-xs text-muted-foreground mt-1">{t('optimalRange')}</p>
                                    </div>
                                    <div className="p-5 bg-linear-to-br from-white/60 to-white/20 dark:from-muted/40 dark:to-muted/10 rounded-3xl border border-white/60 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-2 w-2 rounded-full bg-orange-500" />
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('temp')}</p>
                                        </div>
                                        <p className="font-extrabold text-3xl text-foreground">24°C</p>
                                        <p className="text-xs text-muted-foreground mt-1">{t('sunny')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements - Enhanced */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-8 -right-4 p-5 bg-white/90 dark:bg-card/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] border border-white/50 dark:border-white/10 ring-1 ring-black/5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="h-3 w-3 rounded-full bg-green-500" />
                                        <div className="absolute inset-0 h-3 w-3 rounded-full bg-green-500 animate-ping opacity-75" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">{t('pestRisk')}</p>
                                        <p className="text-xs text-green-600 font-semibold">{t('lowSafe')}</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 20, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute -bottom-10 -left-6 p-6 bg-white/90 dark:bg-card/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] border border-white/50 dark:border-white/10 ring-1 ring-black/5"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800/30">
                                        <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground mb-1">{t('marketPrice')}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-extrabold text-foreground">₹2,520</span>
                                            <span className="text-xs text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">▲ 3.8%</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
