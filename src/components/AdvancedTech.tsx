'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Cpu, Globe, Database, Wifi } from 'lucide-react';
import { useSiteLanguage } from '@/lib/siteLanguage';

export default function AdvancedTech() {
    const { t } = useSiteLanguage();

    const technologies = [
        {
            title: t('deepLearningModels'),
            description: t('deepLearningModelsDesc'),
            icon: Cpu,
            color: 'text-indigo-400',
            gradient: 'from-indigo-500/20 to-purple-500/20',
        },
        {
            title: t('satelliteRemoteSensing'),
            description: t('satelliteRemoteSensingDesc'),
            icon: Globe,
            color: 'text-blue-400',
            gradient: 'from-blue-500/20 to-cyan-500/20',
        },
        {
            title: t('bigDataAnalytics'),
            description: t('bigDataAnalyticsDesc'),
            icon: Database,
            color: 'text-emerald-400',
            gradient: 'from-emerald-500/20 to-teal-500/20',
        },
        {
            title: t('iotConnectivity'),
            description: t('iotConnectivityDesc'),
            icon: Wifi,
            color: 'text-rose-400',
            gradient: 'from-rose-500/20 to-pink-500/20',
        },
    ];

    return (
        <section className="py-32 bg-[#06150b] text-white relative overflow-hidden">
            {/* Rich Background Gradients - Premium Deep Theme */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[120px] animate-blob" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[150px] animate-blob animation-delay-4000" />

                {/* Texture Overlay */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[64px_64px]" />
            </div>

            <div className="container relative z-10">
                <div className="flex flex-col lg:flex-row gap-20 items-center">

                    {/* Left Side: Content */}
                    <div className="lg:w-5/12">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center rounded-full border border-green-500/20 bg-green-500/5 px-4 py-2 text-sm font-semibold text-green-400 mb-8 backdrop-blur-md">
                                <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                                {t('aerospaceTechnology')}
                            </div>

                            <h3 className="text-5xl md:text-6xl font-extrabold mb-8 leading-[1.1] tracking-tight">
                                {t('intelligenceBehind')} <br />
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-green-400 via-emerald-400 to-primary">
                                    {t('everyHarvest')}
                                </span>
                            </h3>
                            <p className="text-green-100/70 text-xl leading-relaxed mb-10 font-medium">
                                {t('advancedSubtitle')}
                            </p>

                            <Link href="/about" className="inline-block px-10 py-5 bg-white text-green-950 rounded-full font-bold hover:bg-green-50 transition-all hover:scale-105 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] active:scale-95">
                                {t('exploreEngine')}
                            </Link>
                        </motion.div>
                    </div>

                    {/* Right Side: Grid */}
                    <div className="lg:w-7/12 grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {technologies.map((tech, index) => (
                            <motion.div
                                key={tech.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className={`group p-8 rounded-[2.5rem] bg-white/3 border border-white/10 backdrop-blur-xl hover:bg-white/8 transition-all duration-500 hover:border-white/20 hover:-translate-y-2 overflow-hidden relative`}
                            >
                                {/* Mini gradient glow on hover */}
                                <div className={`absolute -bottom-24 -right-24 w-48 h-48 bg-linear-to-br ${tech.gradient} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                                <div className={`p-4 rounded-2xl bg-white/5 w-fit mb-8 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 ring-1 ring-white/10`}>
                                    <tech.icon className={`h-8 w-8 ${tech.color}`} />
                                </div>

                                <h4 className="text-2xl font-bold mb-4 text-white group-hover:text-green-400 transition-colors">{tech.title}</h4>
                                <p className="text-base text-green-100/60 leading-relaxed group-hover:text-green-100/80 transition-colors">
                                    {tech.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
