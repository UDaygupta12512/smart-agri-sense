'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteLanguage } from '@/lib/siteLanguage';
import {
    ArrowLeft,
    Bookmark,
    BookmarkCheck,
    Bug,
    ChevronDown,
    ChevronUp,
    CloudRain,
    Flower2,
    Heart,
    IndianRupee,
    Landmark,
    Leaf,
    Share2,
    Sprout,
    Sun,
    ThermometerSun,
    TrendingUp,
    Wheat,
    Droplets,
    ShieldCheck,
    Zap,
    Tractor,
} from 'lucide-react';

// --- Types ---
interface AgriShort {
    id: number;
    category: 'Farming Tips' | 'Govt Schemes' | 'Market Trends' | 'Weather Alerts' | 'Pest Control';
    title: string;
    description: string;
    tags: string[];
    icon: React.ElementType;
    gradient: string;
    accentColor: string;
}

// --- Content Data ---
const AGRI_SHORTS: AgriShort[] = [
    {
        id: 1,
        category: 'Farming Tips',
        title: 'Optimal Sowing Time for Kharif Rice',
        description:
            'Begin paddy nursery preparation by mid-May in North India. Transplant seedlings 20-25 days after sowing when they reach 15-20 cm height. Use SRI (System of Rice Intensification) method to reduce seed rate by 80% and increase yield by 20-30%.',
        tags: ['Rice', 'Kharif', 'SRI Method', 'Paddy'],
        icon: Sprout,
        gradient: 'from-emerald-500 via-green-600 to-teal-700',
        accentColor: 'bg-emerald-400/30',
    },
    {
        id: 2,
        category: 'Govt Schemes',
        title: 'PM-KISAN: ₹6,000 Annual Support',
        description:
            'Under Pradhan Mantri Kisan Samman Nidhi, all landholding farmer families receive ₹6,000 per year in 3 equal installments of ₹2,000. Register on pmkisan.gov.in with Aadhaar, land records, and bank account. Over 11 crore farmers already benefit.',
        tags: ['PM-KISAN', 'Direct Benefit', '₹6000/year'],
        icon: Landmark,
        gradient: 'from-blue-600 via-indigo-600 to-violet-700',
        accentColor: 'bg-blue-400/30',
    },
    {
        id: 3,
        category: 'Market Trends',
        title: `Wheat MSP Raised to ₹2,425/quintal`,
        description:
            `The government has increased Wheat MSP for Rabi ${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(2)} to ₹2,425 per quintal — a hike of ₹150 over last year. Sell at your nearest APMC mandi or through the e-NAM portal for transparent price discovery and direct payments to your bank.`,
        tags: ['Wheat', 'MSP', 'e-NAM', 'Rabi'],
        icon: TrendingUp,
        gradient: 'from-amber-500 via-orange-500 to-red-500',
        accentColor: 'bg-amber-400/30',
    },
    {
        id: 4,
        category: 'Weather Alerts',
        title: 'Monsoon Onset: Prepare for Heavy Rains',
        description:
            'IMD predicts above-normal rainfall this monsoon season with La Niña conditions. Ensure proper field drainage, reinforce bunds, and stock waterlogging-resistant seed varieties. Complete pre-monsoon sowing of Kharif crops before June 15th for best results.',
        tags: ['Monsoon', 'IMD', 'La Niña', 'Drainage'],
        icon: CloudRain,
        gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
        accentColor: 'bg-cyan-400/30',
    },
    {
        id: 5,
        category: 'Pest Control',
        title: 'Fall Armyworm Alert in Maize',
        description:
            'Fall Armyworm (Spodoptera frugiperda) attacks are reported in maize crops across Maharashtra & Karnataka. Scout fields early morning for egg masses and larvae. Use Emamectin Benzoate 5% SG @ 0.4 g/litre or Chlorantraniliprole 18.5% SC @ 0.3 ml/litre spray.',
        tags: ['Maize', 'Armyworm', 'IPM', 'Spray Schedule'],
        icon: Bug,
        gradient: 'from-red-500 via-rose-600 to-pink-700',
        accentColor: 'bg-red-400/30',
    },
    {
        id: 6,
        category: 'Farming Tips',
        title: 'Drip Irrigation Saves 40-60% Water',
        description:
            'Switch to drip irrigation for vegetables, fruits, and cash crops. It delivers water directly to root zones, reducing wastage. Government subsidizes 55-80% of installation cost under PMKSY. Ideal for sugarcane, cotton, banana, and pomegranate cultivation.',
        tags: ['Drip', 'PMKSY', 'Water Saving', 'Subsidy'],
        icon: Droplets,
        gradient: 'from-teal-500 via-emerald-500 to-green-600',
        accentColor: 'bg-teal-400/30',
    },
    {
        id: 7,
        category: 'Govt Schemes',
        title: 'Fasal Bima Yojana: Crop Insurance',
        description:
            'Protect your crops from natural calamities under PMFBY at just 2% premium for Kharif, 1.5% for Rabi, and 5% for commercial crops. File claims within 72 hours of crop damage through the Crop Insurance App or toll-free number 14447.',
        tags: ['PMFBY', 'Insurance', 'Kharif', 'Claims'],
        icon: ShieldCheck,
        gradient: 'from-violet-500 via-purple-600 to-fuchsia-700',
        accentColor: 'bg-violet-400/30',
    },
    {
        id: 8,
        category: 'Market Trends',
        title: 'Soybean Prices Surge 15% This Season',
        description:
            'Global demand for soybean meal has pushed domestic prices to ₹4,800-5,200/quintal — 15% above MSP. Best markets: Indore, Latur, Nagpur. Consider grading and storing in warehouses registered under WDRA for higher rates. Sell in lots for better negotiation.',
        tags: ['Soybean', 'Price Rally', 'WDRA', 'Indore'],
        icon: IndianRupee,
        gradient: 'from-yellow-500 via-amber-500 to-orange-600',
        accentColor: 'bg-yellow-400/30',
    },
    {
        id: 9,
        category: 'Weather Alerts',
        title: 'Heat Wave Advisory for Rabi Crops',
        description:
            'Temperatures exceeding 40°C can cause terminal heat stress in wheat during grain filling. Apply light irrigation every 5-6 days, mulch with rice straw, and avoid nitrogen top-dressing during extreme heat. Harvest early if grain moisture reaches 14%.',
        tags: ['Heat Wave', 'Wheat', 'Irrigation', 'Stress'],
        icon: ThermometerSun,
        gradient: 'from-orange-500 via-red-500 to-rose-600',
        accentColor: 'bg-orange-400/30',
    },
    {
        id: 10,
        category: 'Pest Control',
        title: 'Neem-Based IPM for Cotton Bollworm',
        description:
            'Combat American Bollworm in cotton using Integrated Pest Management. Install pheromone traps (5/acre), spray Neem oil 1500 ppm @ 5 ml/litre at flower initiation, and release Trichogramma egg parasitoids. Reduce chemical pesticide cost by 60%.',
        tags: ['Cotton', 'Bollworm', 'Neem', 'Trichogramma'],
        icon: Leaf,
        gradient: 'from-lime-500 via-green-600 to-emerald-700',
        accentColor: 'bg-lime-400/30',
    },
    {
        id: 11,
        category: 'Farming Tips',
        title: 'Soil Testing: Foundation of Smart Farming',
        description:
            'Get your soil tested every 2 years from the nearest Krishi Vigyan Kendra (KVK) or soil testing lab — it\'s FREE. A soil health card reveals NPK levels, pH, organic carbon, and micronutrient status. This alone can reduce fertilizer costs by 25-30%.',
        tags: ['Soil Health Card', 'KVK', 'NPK', 'Free Testing'],
        icon: Flower2,
        gradient: 'from-green-500 via-teal-600 to-cyan-700',
        accentColor: 'bg-green-400/30',
    },
    {
        id: 12,
        category: 'Govt Schemes',
        title: 'KCC: Low-Interest Farm Loans at 4%',
        description:
            'Kisan Credit Card provides short-term crop loans up to ₹3 lakhs at just 4% effective interest (7% with 3% subvention). Covers crop cultivation, post-harvest, and allied activities. Apply at your nearest bank branch with land documents and Aadhaar.',
        tags: ['KCC', 'Farm Loan', '4% Interest', 'Subvention'],
        icon: Zap,
        gradient: 'from-sky-500 via-blue-600 to-indigo-700',
        accentColor: 'bg-sky-400/30',
    },
];

const CATEGORY_COLORS: Record<string, string> = {
    'Farming Tips': 'bg-emerald-500/90 text-white',
    'Govt Schemes': 'bg-indigo-500/90 text-white',
    'Market Trends': 'bg-amber-500/90 text-white',
    'Weather Alerts': 'bg-cyan-500/90 text-white',
    'Pest Control': 'bg-rose-500/90 text-white',
};

export default function AgriShortsPage() {
    const router = useRouter();
    const { t } = useSiteLanguage();
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());
    const [liked, setLiked] = useState<Set<number>>(new Set());
    const [shareToast, setShareToast] = useState(false);
    const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set([0]));

    // Track which card is in view via IntersectionObserver
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const cards = container.querySelectorAll('[data-card-index]');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const index = Number(entry.target.getAttribute('data-card-index'));
                    if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                        setActiveIndex(index);
                        setVisibleCards((prev) => new Set(prev).add(index));
                    }
                });
            },
            { root: container, threshold: 0.5 }
        );

        cards.forEach((card) => observer.observe(card));
        return () => observer.disconnect();
    }, []);

    const scrollToIndex = useCallback(
        (index: number) => {
            const container = containerRef.current;
            if (!container) return;
            const card = container.querySelector(`[data-card-index="${index}"]`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        },
        []
    );

    const toggleBookmark = (id: number) => {
        setBookmarked((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleLike = (id: number) => {
        setLiked((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleShare = async (short: AgriShort) => {
        const text = `${short.title}\n\n${short.description}\n\n#SmartAgriSense #${short.category.replace(/\s/g, '')}`;
        if (navigator.share) {
            try {
                await navigator.share({ title: short.title, text });
            } catch {
                // user cancelled
            }
        } else {
            await navigator.clipboard.writeText(text);
            setShareToast(true);
            setTimeout(() => setShareToast(false), 2000);
        }
    };

    const progress = ((activeIndex + 1) / AGRI_SHORTS.length) * 100;

    return (
        <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-50">
                {/* Progress Bar */}
                <div className="h-1 w-full bg-white/10">
                    <motion.div
                        className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center gap-2 text-white/90 hover:text-white transition-colors backdrop-blur-md bg-white/10 rounded-full px-3 py-1.5 text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('overview')}</span>
                    </button>

                    <h1 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
                        <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                            {t('agriShorts')}
                        </span>
                    </h1>

                    <div className="text-white/60 text-xs font-medium backdrop-blur-md bg-white/10 rounded-full px-3 py-1.5">
                        {activeIndex + 1} / {AGRI_SHORTS.length}
                    </div>
                </div>
            </div>

            {/* Main Scroll Container */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {AGRI_SHORTS.map((short, index) => (
                    <div
                        key={short.id}
                        data-card-index={index}
                        className="h-screen w-full snap-start snap-always flex items-center justify-center p-4 sm:p-6 relative"
                    >
                        {/* Background gradient */}
                        <div
                            className={`absolute inset-0 bg-gradient-to-br ${short.gradient} opacity-20`}
                        />

                        {/* Card */}
                        <AnimatePresence>
                            {visibleCards.has(index) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 60, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    className="relative w-full max-w-lg mx-auto"
                                >
                                    {/* Glassmorphism Card */}
                                    <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl">
                                        {/* Card gradient background */}
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-br ${short.gradient} opacity-90`}
                                        />
                                        <div className="absolute inset-0 backdrop-blur-xl bg-black/20" />

                                        {/* Content */}
                                        <div className="relative z-10 p-6 sm:p-8 flex flex-col min-h-[65vh] sm:min-h-[60vh]">
                                            {/* Category Badge */}
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2, duration: 0.4 }}
                                            >
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase backdrop-blur-md ${CATEGORY_COLORS[short.category]}`}
                                                >
                                                    {short.category}
                                                </span>
                                            </motion.div>

                                            {/* Icon */}
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
                                                className="mt-6 mb-4"
                                            >
                                                <div
                                                    className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${short.accentColor} backdrop-blur-md border border-white/20`}
                                                >
                                                    <short.icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                                                </div>
                                            </motion.div>

                                            {/* Title */}
                                            <motion.h2
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.35, duration: 0.5 }}
                                                className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight"
                                            >
                                                {short.title}
                                            </motion.h2>

                                            {/* Description */}
                                            <motion.p
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.45, duration: 0.5 }}
                                                className="mt-4 text-white/85 text-sm sm:text-base leading-relaxed flex-1"
                                            >
                                                {short.description}
                                            </motion.p>

                                            {/* Tags */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.55, duration: 0.4 }}
                                                className="mt-5 flex flex-wrap gap-2"
                                            >
                                                {short.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-md text-white/90 text-xs font-medium border border-white/10"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </motion.div>

                                            {/* Action Buttons */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.6, duration: 0.4 }}
                                                className="mt-6 flex items-center gap-3"
                                            >
                                                <button
                                                    onClick={() => toggleLike(short.id)}
                                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl backdrop-blur-md border transition-all duration-300 text-sm font-medium ${
                                                        liked.has(short.id)
                                                            ? 'bg-red-500/30 border-red-400/40 text-red-200'
                                                            : 'bg-white/10 border-white/15 text-white/80 hover:bg-white/20'
                                                    }`}
                                                >
                                                    <Heart
                                                        className={`h-4 w-4 transition-transform duration-300 ${
                                                            liked.has(short.id) ? 'fill-red-400 text-red-400 scale-110' : ''
                                                        }`}
                                                    />
                                                    {liked.has(short.id) ? 'Liked' : 'Like'}
                                                </button>

                                                <button
                                                    onClick={() => toggleBookmark(short.id)}
                                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl backdrop-blur-md border transition-all duration-300 text-sm font-medium ${
                                                        bookmarked.has(short.id)
                                                            ? 'bg-amber-500/30 border-amber-400/40 text-amber-200'
                                                            : 'bg-white/10 border-white/15 text-white/80 hover:bg-white/20'
                                                    }`}
                                                >
                                                    {bookmarked.has(short.id) ? (
                                                        <BookmarkCheck className="h-4 w-4 text-amber-400" />
                                                    ) : (
                                                        <Bookmark className="h-4 w-4" />
                                                    )}
                                                    {bookmarked.has(short.id) ? 'Saved' : 'Save'}
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        void handleShare(short);
                                                    }}
                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl backdrop-blur-md bg-white/10 border border-white/15 text-white/80 hover:bg-white/20 transition-all duration-300 text-sm font-medium"
                                                >
                                                    <Share2 className="h-4 w-4" />
                                                    Share
                                                </button>
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Swipe Indicator — only show on first card */}
                        {index === 0 && activeIndex === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 1.5, duration: 0.5 }}
                                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50"
                            >
                                <motion.div
                                    animate={{ y: [0, 8, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    <ChevronDown className="h-6 w-6" />
                                </motion.div>
                                <span className="text-xs font-medium">Scroll to explore</span>
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation Dots — Right Side */}
            <div className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2">
                <button
                    onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
                    className="p-1 text-white/40 hover:text-white/80 transition-colors"
                    aria-label="Previous card"
                >
                    <ChevronUp className="h-4 w-4" />
                </button>

                {AGRI_SHORTS.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollToIndex(index)}
                        aria-label={`Go to card ${index + 1}`}
                        className="group relative flex items-center justify-center"
                    >
                        <motion.div
                            className={`rounded-full transition-all duration-300 ${
                                index === activeIndex
                                    ? 'w-2.5 h-2.5 bg-white shadow-lg shadow-white/30'
                                    : 'w-1.5 h-1.5 bg-white/30 group-hover:bg-white/60'
                            }`}
                            layout
                        />
                        {/* Tooltip on hover */}
                        <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/80 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg pointer-events-none border border-white/10">
                            {AGRI_SHORTS[index].title.slice(0, 30)}
                            {AGRI_SHORTS[index].title.length > 30 ? '…' : ''}
                        </div>
                    </button>
                ))}

                <button
                    onClick={() => scrollToIndex(Math.min(AGRI_SHORTS.length - 1, activeIndex + 1))}
                    className="p-1 text-white/40 hover:text-white/80 transition-colors"
                    aria-label="Next card"
                >
                    <ChevronDown className="h-4 w-4" />
                </button>
            </div>

            {/* Share Toast */}
            <AnimatePresence>
                {shareToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xl text-neutral-900 dark:text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 text-sm font-medium"
                    >
                        ✅ Copied to clipboard!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hide scrollbar globally for this page */}
            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
