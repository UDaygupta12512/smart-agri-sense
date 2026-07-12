'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Upload, Cpu, Sprout, ArrowRight } from 'lucide-react';
import { useSiteLanguage } from '@/lib/siteLanguage';

export default function HowItWorks() {
    const { t } = useSiteLanguage();

    const steps = [
        {
            id: 1,
            title: t('uploadData'),
            description: t('uploadDataDesc'),
            icon: Upload,
        },
        {
            id: 2,
            title: t('aiAnalysis'),
            description: t('aiAnalysisDesc'),
            icon: Cpu,
        },
        {
            id: 3,
            title: t('getResults'),
            description: t('getResultsDesc'),
            icon: Sprout,
        },
    ];

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
                        {t('howItWorksTitle')}
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        {t('howItWorksSubtitle')}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop) - Enhanced with gradient and animation */}
                    <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-linear-to-r from-transparent via-primary/30 to-transparent z-0 overflow-hidden">
                        <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="w-1/2 h-full bg-linear-to-r from-transparent via-primary to-transparent opacity-50"
                        />
                    </div>

                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className="relative z-10 flex flex-col items-center group"
                        >
                            <div className="w-24 h-24 rounded-4xl bg-white dark:bg-card border-2 border-border flex items-center justify-center mb-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] group-hover:border-primary group-hover:shadow-primary/20 transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-3 relative">
                                <div className="absolute inset-0 bg-primary/5 rounded-[1.8rem] scale-0 group-hover:scale-100 transition-transform duration-500" />
                                <step.icon className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors relative z-10" />

                                <div className="absolute -top-3 -right-3 bg-primary text-white font-bold rounded-xl w-10 h-10 flex items-center justify-center text-sm shadow-lg shadow-primary/30 border-4 border-background group-hover:scale-110 transition-transform duration-500">
                                    {step.id}
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{step.title}</h3>
                            <p className="text-muted-foreground leading-relaxed max-w-xs group-hover:text-foreground/80 transition-colors">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="container mt-24">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative bg-white dark:bg-card rounded-[3rem] p-12 md:p-24 text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] dark:shadow-primary/5 border border-white/20 dark:border-white/5 overflow-hidden ring-1 ring-black/5 dark:ring-white/5"
                >
                    {/* Rich Background Elements */}
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-linear-to-br from-primary/20 to-transparent rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-linear-to-tl from-secondary/15 to-transparent rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

                    <div className="relative z-10 max-w-4xl mx-auto">
                        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary mb-8 backdrop-blur-md shadow-sm">
                            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                            {t('joinAgriRevolution')}
                        </div>

                        <h2 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-foreground leading-[1.1]">
                            {t('readyToTransform')} <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-emerald-600 to-secondary animate-gradient-x bg-size-[200%_auto]">{t('yourHarvest')}</span>
                        </h2>

                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                            {t('howItWorksCtaSubtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link href="/dashboard" className="inline-flex h-16 items-center justify-center rounded-full bg-primary px-10 text-lg font-bold text-white shadow-xl shadow-primary/30 transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-primary/50 group">
                                {t('getStartedForFree')}
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link href="/contact" className="inline-flex h-16 items-center justify-center rounded-full border border-border bg-white/50 dark:bg-white/5 backdrop-blur-md px-10 text-lg font-semibold text-foreground shadow-sm transition-all hover:bg-white/80 dark:hover:bg-white/10 hover:border-primary/20">
                                {t('contactRuralAdvisors')}
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
