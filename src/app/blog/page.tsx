'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, User, ArrowRight, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { useSiteLanguage } from '@/lib/siteLanguage';

const posts = [
    {
        title: 'Rabi 2025-26 Harvest Preparation Guide',
        excerpt: 'Wheat and gram crops are reaching maturity across central India. Here is your checklist for a profitable harvest this March.',
        date: 'Mar 3, 2026',
        author: 'Dr. Arpit Sharma',
        image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=800&auto=format&fit=crop',
        content: 'Wheat in Vidarbha and Madhya Pradesh is entering the grain-filling stage with harvesting expected between March 15-25, 2026. Key actions: (1) Arrange combine harvester or thresher 10 days in advance — demand is high. (2) Ensure moisture content is below 14% before storage to prevent fungal growth. (3) Target Nagpur APMC or Akola for wheat — current prices are ₹2,480-2,520/qtl, above the MSP of ₹2,425. (4) Apply final irrigation if grain is still filling — avoid water stress at this stage. Gram (Chana) harvesting can start when 70% pods turn brown. Store in gunny bags lined with polythene to prevent moisture ingress.'
    },
    {
        title: 'Maximizing Wheat Yield in Winter 2026',
        excerpt: 'Early predictions suggest a unique climatic pattern this season. Here is how you can prepare your fields for maximum output.',
        date: 'Feb 5, 2026',
        author: 'Dr. Arpit Sharma',
        image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=800&auto=format&fit=crop',
        content: 'The 2025-26 Rabi season has seen adequate winter chill in the Indo-Gangetic plains, supporting strong tiller development in wheat. Key tips for maximizing output: (1) Apply 40 kg/acre urea as top-dress during jointing stage (Zadoks 30-32). (2) Use chlorpyrifos + lambda-cyhalothrin spray if aphid infestation exceeds 50 aphids/tiller. (3) Irrigate at crown-root initiation (21 DAS), tillering (45 DAS), jointing, booting, milky grain, and dough stages. Expect yields of 18-22 qtl/acre in irrigated conditions with HD-2967 or GW-322 varieties. MSP for wheat is ₹2,425/qtl for 2025-26.'
    },
    {
        title: 'New Organic Pesticides: A Complete Guide',
        excerpt: 'Learn about natural alternatives that are safe for your family and the soil.',
        date: 'Jan 28, 2026',
        author: 'Sunita Mehra',
        image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop',
        content: 'Organic pest control is gaining ground as Residue-Free Produce commands 15-20% price premium in urban markets. Top organic options available in 2026: (1) Neem-based oil (Azadirachtin 300 ppm) — effective against aphids, whitefly, jassids; apply 5 ml/litre water. (2) Beauveria bassiana (fungal biocontrol) for stem borer in rice; mix 5g/litre and spray evening. (3) Spinosad (bacterial fermentation product) for diamondback moth in vegetables. (4) Trichoderma viride for soil-borne diseases — apply at sowing @ 4g/kg seed. All are approved under Participatory Guarantee System (PGS-India) certification for organic farming.'
    },
    {
        title: 'Market Trends: Why Pulse Prices are Rising',
        excerpt: 'An analysis of current mandi prices and what it means for the next cropping season.',
        date: 'Jan 15, 2026',
        author: 'Vijay Singh',
        image: 'https://images.unsplash.com/photo-1627916607164-7b20241db935?q=80&w=800&auto=format&fit=crop',
        content: 'Pulse (dal) prices have risen 18-22% year-on-year in Jan 2026 due to back-to-back production shortfalls. Tur (Arhar) dal is trading at ₹120-135/kg at retail — its highest since 2017. Gram (Chana) at Akola APMC is ₹5,800-6,200/qtl vs MSP of ₹5,650. What this means for farmers: (1) Consider allocating 2-3 acres to kharif tur for 2026. (2) Urad and moong also showing strong forward prices for Kharif 2026. (3) Government is likely to offer procurement support under NAFED if prices fall below MSP — register your crop on e-Samridhi portal. (4) Contract farming opportunities are available with ITC and NCDEX-linked processors.'
    }
];

export default function BlogPage() {
    const [expandedPost, setExpandedPost] = useState<number | null>(null);
    const { language } = useSiteLanguage();
    const text = language === 'hi'
        ? {
            title: 'किसान ब्लॉग',
            subtitle: 'आधुनिक किसानों के लिए विशेषज्ञ सलाह, कहानियां और उपयोगी जानकारी।',
            readMore: 'और पढ़ें',
            collapse: 'संकुचित करें',
        }
        : language === 'ta'
            ? {
                title: 'விவசாயிகள் வலைப்பதிவு',
                subtitle: 'நவீன விவசாயிக்கான தகவல்கள் மற்றும் நிபுணர் ஆலோசனைகள்.',
                readMore: 'மேலும் படிக்க',
                collapse: 'சுருக்கு',
            }
            : language === 'te'
                ? {
                    title: 'రైతుల బ్లాగ్',
                    subtitle: 'ఆధునిక రైతుల కోసం ఉపయోగకరమైన సూచనలు మరియు సమాచారం.',
                    readMore: 'ఇంకా చదవండి',
                    collapse: 'ముడిచివేయి',
                }
        : {
            title: 'Farmers\' Blog',
            subtitle: 'Insights, stories, and expert advice for the modern farmer.',
            readMore: 'Read More',
            collapse: 'Collapse',
        };

    return (
        <main className="min-h-screen flex flex-col pt-24">
            <Navbar />
            <div className="container py-16">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl font-extrabold mb-4">{text.title}</h1>
                    <p className="text-muted-foreground text-lg">{text.subtitle}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {posts.map((post, idx) => (
                        <div key={idx} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col">
                            <div className="h-48 overflow-hidden">
                                <Image src={post.image} alt={post.title} width={800} height={400} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="p-6 space-y-4 flex flex-col flex-1">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.author}</span>
                                </div>
                                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{post.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{post.excerpt}</p>

                                {expandedPost === idx && (
                                    <div className="p-4 bg-muted/50 rounded-xl text-sm text-foreground leading-relaxed border border-border">
                                        {post.content}
                                    </div>
                                )}

                                <button
                                    onClick={() => setExpandedPost(expandedPost === idx ? null : idx)}
                                    className="flex items-center gap-2 text-primary font-bold text-sm mt-auto"
                                >
                                    {expandedPost === idx ? (
                                        <><ChevronUp className="h-4 w-4" /> {text.collapse}</>
                                    ) : (
                                        <>{text.readMore} <ArrowRight className="h-4 w-4" /></>
                                    )}
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
