'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CTA() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/90 dark:bg-primary/10 z-0">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
            </div>
            
            <div className="container relative z-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-background rounded-[3rem] p-12 md:p-20 text-center shadow-2xl border border-border/50 relative overflow-hidden"
                >
                    {/* Decorative blobs */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        Ready to transform your farm?
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        Join thousands of farmers who are using SmartAgriSense to increase yields and reduce costs.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/dashboard" className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-8 text-lg font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-105">
                            Get Started Now
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <Link href="/contact" className="inline-flex h-14 items-center justify-center rounded-full border-2 border-input bg-background px-8 text-lg font-medium shadow-sm transition-all hover:bg-accent hover:text-accent-foreground">
                            Contact Sales
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
