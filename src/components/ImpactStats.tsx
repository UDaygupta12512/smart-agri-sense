'use client';

import { motion } from 'framer-motion';
import { useSiteLanguage } from '@/lib/siteLanguage';

export default function ImpactStats() {
    const { t } = useSiteLanguage();

    const stats = [
        { label: t('farmersEmpowered'), value: '2.8L+', suffix: '' },
        { label: t('acresMonitored'), value: '3.8M', suffix: '+' },
        { label: t('yieldIncrease'), value: '32', suffix: '%' },
        { label: t('waterSaved'), value: '38', suffix: '%' },
    ];

    return (
        <section className="relative py-24 bg-primary text-primary-foreground overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-size-[40px_40px]"></div>

            <div className="container relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    {stats.map((stat, index) => (
                        <div key={stat.label} className="relative group">
                            {/* Vertical Divider for MD+ */}
                            {index < stats.length - 1 && (
                                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-12 w-px bg-linear-to-b from-transparent via-primary-foreground/30 to-transparent" />
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="px-4 py-6 rounded-2xl transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm"
                            >
                                <div className="text-5xl md:text-6xl font-extrabold mb-3 flex justify-center items-baseline tracking-tight group-hover:scale-110 transition-transform duration-300 origin-bottom text-white drop-shadow-sm">
                                    {stat.value}
                                    <span className="text-3xl ml-1 opacity-80 font-semibold">{stat.suffix}</span>
                                </div>
                                <div className="text-sm md:text-base font-bold opacity-90 uppercase tracking-widest text-primary-foreground/80 group-hover:text-white transition-colors">
                                    {stat.label}
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
