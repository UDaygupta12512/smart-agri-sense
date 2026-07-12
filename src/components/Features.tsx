'use client';

import Link from 'next/link';
import { CloudSun, ShoppingCart, Smartphone, Bug, Activity, ArrowUpRight, Droplets, Calendar, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSiteLanguage } from '@/lib/siteLanguage';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function Features() {
    const { t } = useSiteLanguage();

    const features = [
        {
            name: t('weatherIntelligence'),
            description: t('weatherIntelligenceDesc'),
            icon: CloudSun,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            gradient: 'from-blue-500/20 to-cyan-500/20',
            border: 'group-hover:border-blue-500/50',
            href: '/dashboard/weather',
        },
        {
            name: t('marketPriceDashboard'),
            description: t('marketPriceDashboardDesc'),
            icon: ShoppingCart,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            gradient: 'from-orange-500/20 to-amber-500/20',
            border: 'group-hover:border-orange-500/50',
            href: '/dashboard/market',
        },
        {
            name: t('pestDiseaseDiagnosis'),
            description: t('pestDiseaseDiagnosisDesc'),
            icon: Bug,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            gradient: 'from-red-500/20 to-rose-500/20',
            border: 'group-hover:border-red-500/50',
            href: '/dashboard/pest-detection',
        },
        {
            name: t('multilingualSupport'),
            description: t('multilingualSupportDesc'),
            icon: Smartphone,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            gradient: 'from-purple-500/20 to-violet-500/20',
            border: 'group-hover:border-purple-500/50',
            href: '/dashboard/advisory',
        },
        {
            name: t('cropHealthMonitoring'),
            description: t('cropHealthMonitoringDesc'),
            icon: Activity,
            color: 'text-teal-500',
            bg: 'bg-teal-500/10',
            gradient: 'from-teal-500/20 to-cyan-500/20',
            border: 'group-hover:border-teal-500/50',
            href: '/dashboard/my-farm',
        },
        {
            name: t('cropCalendarFeat'),
            description: t('cropCalendarFeatDesc'),
            icon: Calendar,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10',
            gradient: 'from-indigo-500/20 to-purple-500/20',
            border: 'group-hover:border-indigo-500/50',
            href: '/dashboard/calendar',
        },
        {
            name: t('smartIrrigation'),
            description: t('smartIrrigationDesc'),
            icon: Droplets,
            color: 'text-cyan-500',
            bg: 'bg-cyan-500/10',
            gradient: 'from-cyan-500/20 to-blue-500/20',
            border: 'group-hover:border-cyan-500/50',
            href: '/dashboard/irrigation',
        },
        {
            name: t('loanEligibility'),
            description: t('loanEligibilityDesc'),
            icon: Landmark,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            gradient: 'from-emerald-500/20 to-teal-500/20',
            border: 'group-hover:border-emerald-500/50',
            href: '/dashboard/loan',
        },
    ];

    return (
        <section className="py-32 bg-secondary/5 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="container relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <div className="inline-flex items-center justify-center p-1 bg-primary/5 rounded-full mb-6 border border-primary/10">
                        <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">{t('coreModules')}</span>
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6 text-foreground">
                        {t('everythingYouNeed')} <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-green-600">{t('farmSmarter')}</span>
                    </h2>
                    <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                        {t('featuresSubtitle')}
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.name}
                            variants={item}
                            className={`group relative p-8 bg-card rounded-4xl border border-border/60 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden`}
                        >
                            {/* Hover gradient background - Refined */}
                            <div className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            <div className="absolute top-8 right-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                <ArrowUpRight className={`h-6 w-6 ${feature.color}`} />
                            </div>

                            <div className={`relative inline-flex items-center justify-center p-4 ${feature.bg} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-500 ring-1 ring-inset ring-black/5`}>
                                <feature.icon className={`h-8 w-8 ${feature.color}`} />
                            </div>

                            <h3 className="relative text-2xl font-bold mb-4 text-foreground group-hover:text-foreground transition-colors">{feature.name}</h3>
                            <p className="relative text-muted-foreground text-base leading-relaxed group-hover:text-foreground/80 transition-colors mb-6">
                                {feature.description}
                            </p>
                            <Link
                                href={feature.href}
                                className={`relative inline-flex items-center gap-1.5 text-sm font-semibold ${feature.color} opacity-0 group-hover:opacity-100 transition-all duration-300`}
                            >
                                {t('openFeature')} <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
