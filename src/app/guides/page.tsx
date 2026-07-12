'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Book, Download, ChevronRight } from 'lucide-react';
import { useSiteLanguage } from '@/lib/siteLanguage';

const guides = [
    {
        title: 'Wheat Cultivation Masterclass',
        category: 'Crops',
        difficulty: 'Beginner',
        description: 'Covers variety selection (HD-2967, PBW-343), sowing methods, irrigation scheduling at 6 critical stages, and MSP-based selling strategy for Rabi 2025-26.',
        pages: 32
    },
    {
        title: 'Smart Irrigation Techniques',
        category: 'Resource Mgmt',
        difficulty: 'Intermediate',
        description: 'Drip vs. sprinkler vs. furrow irrigation cost-benefit analysis. Includes soil moisture monitoring, ET-based scheduling, and government subsidy scheme details.',
        pages: 28
    },
    {
        title: 'Soil Fertility & Composition',
        category: 'Soil Science',
        difficulty: 'Advanced',
        description: 'Interpreting soil test reports (N, P, K, pH, OC, micronutrients), calculating fertilizer dosages, and improving soil organic carbon for long-term productivity.',
        pages: 45
    },
    {
        title: 'Pest Identification Guide',
        category: 'Protection',
        difficulty: 'Beginner',
        description: 'Photo-based guide to 40+ common pests in Kharif and Rabi crops. Includes Economic Threshold Levels (ETL), chemical and bio-pesticide options.',
        pages: 56
    },
    {
        title: 'Mandi Selling Optimization',
        category: 'Finance',
        difficulty: 'Intermediate',
        description: 'When to sell, when to hold. Covers APMC mandi registration, e-NAM platform trading, FPO aggregation, and post-harvest price negotiation tactics.',
        pages: 24
    },
    {
        title: 'Cold Storage Best Practices',
        category: 'Post-Harvest',
        difficulty: 'Advanced',
        description: 'Temperature and humidity guidelines for storing wheat, onion, potato, and pulses. Includes government cold storage subsidy (NHM) and WDRA warehouse receipt financing.',
        pages: 38
    },
];

export default function GuidesPage() {
    const { language } = useSiteLanguage();
    const text = language === 'hi'
        ? {
            title: 'फसल और खेती गाइड',
            subtitle: 'बेहतर परिणामों के लिए चरण-दर-चरण संसाधन और गाइड।',
            download: 'डाउनलोड PDF',
            pages: 'पृष्ठ',
        }
        : language === 'ta'
            ? {
                title: 'பயிர் & விவசாய வழிகாட்டிகள்',
                subtitle: 'சிறந்த விளைவுகளுக்கு படிப்படியான வழிமுறைகள்.',
                download: 'PDF பதிவிறக்கு',
                pages: 'பக்கங்கள்',
            }
            : language === 'te'
                ? {
                    title: 'పంట & వ్యవసాయ మార్గదర్శకాలు',
                    subtitle: 'మంచి ఫలితాలకు దశలవారీ మార్గదర్శకాలు.',
                    download: 'PDF డౌన్‌లోడ్',
                    pages: 'పేజీలు',
                }
        : {
            title: 'Crop & Farming Guides',
            subtitle: 'Step-by-step PDF resources and online manuals for better results.',
            download: 'Download PDF',
            pages: 'pages',
        };
    const handleDownload = (guide: typeof guides[0]) => {
        const content = [
            `SmartAgriSense - ${guide.title}`,
            `Category: ${guide.category} | Difficulty: ${guide.difficulty} | Pages: ${guide.pages}`,
            `\n--- Overview ---\n${guide.description}`,
            `\n--- Table of Contents ---`,
            `1. Introduction to ${guide.title}`,
            `2. Prerequisites and tools required`,
            `3. Step-by-step implementation guide`,
            `4. Region-specific recommendations (Kharif/Rabi seasons)`,
            `5. Government schemes and subsidies applicable`,
            `6. Case studies from Maharashtra, MP, Punjab`,
            `7. Common mistakes and how to avoid them`,
            `8. Quick reference charts and tables`,
            `\n[Full ${guide.pages}-page PDF available at SmartAgriSense Knowledge Portal]`,
            `\nDownloaded: ${new Date().toLocaleString('en-IN')}`,
        ].join('\n');

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${guide.title.replace(/\s+/g, '_')}_Guide.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <main className="min-h-screen flex flex-col pt-24">
            <Navbar />
            <div className="container py-16">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl font-extrabold mb-4">{text.title}</h1>
                    <p className="text-muted-foreground text-lg">{text.subtitle}</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {guides.map((guide, idx) => (
                        <div key={idx} className="p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all group shadow-sm flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <Book className="h-6 w-6 text-primary" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-muted px-2 py-1 rounded-md text-muted-foreground">
                                    {guide.difficulty}
                                </span>
                            </div>
                            <p className="text-xs text-primary font-bold mb-1">{guide.category}</p>
                            <h3 className="text-xl font-bold mb-2">{guide.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{guide.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{guide.pages} {text.pages}</span>
                                <button
                                    onClick={() => handleDownload(guide)}
                                    className="flex items-center gap-2 text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors hover:underline"
                                >
                                    <Download className="h-4 w-4" /> {text.download}
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </main>
    );
}
