'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Sprout, Users, Target, Rocket, Award, Globe2, TrendingUp, ShieldCheck } from 'lucide-react';
import { useSiteLanguage } from '@/lib/siteLanguage';

const stats = [
    { value: '2.8L+', label: 'Farmers Empowered', icon: Users, color: 'text-green-600' },
    { value: '18', label: 'States Covered', icon: Globe2, color: 'text-blue-600' },
    { value: '24', label: 'Crops Supported', icon: Sprout, color: 'text-amber-600' },
    { value: '99.7%', label: 'Platform Uptime', icon: ShieldCheck, color: 'text-purple-600' },
];

const team = [
    { name: 'Dr. Arpit Sharma', role: 'Chief Agronomist', bio: 'PhD in Agronomy, IARI Delhi. 15 years experience in precision agriculture and crop modelling.' },
    { name: 'Sunita Mehra', role: 'AI/ML Lead', bio: 'IIT Bombay alumna. Built SmartAgriSense\'s pest detection model trained on 500K+ crop images.' },
    { name: 'Vijay Singh', role: 'Market Intelligence', bio: 'Former NABARD analyst. Tracks MSP trends and mandi prices across 200+ APMCs nationwide.' },
];

export default function AboutPage() {
    const { language } = useSiteLanguage();
    const text = language === 'hi'
        ? {
            missionA: 'हमारा मिशन',
            missionB: 'सतत खेती के लिए',
            subtitle: 'SmartAgriSense में हमारा विश्वास है कि तकनीक हर किसान तक पहुंचे। हमारा लक्ष्य AI आधारित जानकारी से छोटे किसानों को सशक्त बनाना है।',
            precision: 'सटीकता',
            community: 'समुदाय',
            innovation: 'नवाचार',
            awards: 'मान्यता और पुरस्कार',
            team: 'हमारी टीम',
        }
        : language === 'ta'
            ? {
                missionA: 'எங்கள் நோக்கம்',
                missionB: 'நிலைத்த விவசாயத்திற்கு',
                subtitle: 'ஒவ்வொரு விவசாயிக்கும் தொழில்நுட்பம் சென்றடைய வேண்டும் என்பதே எங்கள் இலக்கு.',
                precision: 'துல்லியம்',
                community: 'சமூகம்',
                innovation: 'புதுமை',
                awards: 'அங்கீகாரம் மற்றும் விருதுகள்',
                team: 'எங்கள் அணியை சந்திக்கவும்',
            }
            : language === 'te'
                ? {
                    missionA: 'మా లక్ష్యం',
                    missionB: 'సుస్థిర వ్యవసాయం కోసం',
                    subtitle: 'ప్రతి రైతుకు సాంకేతికత చేరాలి అనే విశ్వాసంతో మేము పనిచేస్తున్నాం.',
                    precision: 'ఖచ్చితత్వం',
                    community: 'సముదాయం',
                    innovation: 'నవీకరణ',
                    awards: 'గౌరవాలు మరియు పురస్కారాలు',
                    team: 'మా బృందాన్ని కలవండి',
                }
        : {
            missionA: 'Our Mission to',
            missionB: 'Sustainable Farming',
            subtitle: 'At SmartAgriSense, we believe that technology should be accessible to every farmer. Our goal is to empower small-scale agriculture with AI-driven insights to maximize yield and ensure food security.',
            precision: 'Precision',
            community: 'Community',
            innovation: 'Innovation',
            awards: 'Recognition & Awards',
            team: 'Meet the Team',
        };
    return (
        <main className="min-h-screen flex flex-col pt-24">
            <Navbar />
            <div className="container py-16 space-y-20">
                {/* Mission Section */}
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
                        {text.missionA} <br />
                        <span className="text-primary">{text.missionB}</span>
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        {text.subtitle}
                    </p>
                </div>

                {/* Impact Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="p-6 bg-card border border-border rounded-2xl shadow-sm text-center">
                            <div className="flex justify-center mb-3">
                                <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center">
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                            <div className="text-3xl font-extrabold mb-1">{stat.value}</div>
                            <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Values */}
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 bg-card border border-border rounded-4xl shadow-sm">
                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                            <Target className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">{text.precision}</h3>
                        <p className="text-muted-foreground">Every piece of advice we provide is backed by data and hyper-local environmental factors. Our models are trained on 10+ years of district-level weather, soil, and yield records.</p>
                    </div>
                    <div className="p-8 bg-card border border-border rounded-4xl shadow-sm">
                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">{text.community}</h3>
                        <p className="text-muted-foreground">We are building a platform where farmers can learn from each other and grow together. Our forum has over 42,000 active discussions in 7 regional languages.</p>
                    </div>
                    <div className="p-8 bg-card border border-border rounded-4xl shadow-sm">
                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                            <Rocket className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">{text.innovation}</h3>
                        <p className="text-muted-foreground">Pushing the boundaries of what&apos;s possible in agritech with AI and deep learning. Our pest detection model achieves 94.2% accuracy across 45 crop diseases.</p>
                    </div>
                </div>

                {/* Awards */}
                <div className="rounded-2xl bg-linear-to-r from-primary/10 to-emerald-500/10 border border-primary/20 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Award className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-extrabold">{text.awards}</h2>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-6">
                        <div className="p-4 bg-background rounded-xl shadow-sm">
                            <p className="font-bold text-sm">NASSCOM Deep Tech Award 2025</p>
                            <p className="text-xs text-muted-foreground mt-1">Best AI Application in Agriculture</p>
                        </div>
                        <div className="p-4 bg-background rounded-xl shadow-sm">
                            <p className="font-bold text-sm">ICAR AgriTech Innovation Prize</p>
                            <p className="text-xs text-muted-foreground mt-1">Precision Farming Category, 2024</p>
                        </div>
                        <div className="p-4 bg-background rounded-xl shadow-sm">
                            <p className="font-bold text-sm">Startup India Recognition</p>
                            <p className="text-xs text-muted-foreground mt-1">DPIIT Registered, Funding Stage 2</p>
                        </div>
                    </div>
                </div>

                {/* Team */}
                <div>
                    <h2 className="text-3xl font-extrabold text-center mb-10">{text.team}</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {team.map((member, idx) => (
                            <div key={idx} className="p-6 bg-card border border-border rounded-2xl shadow-sm text-center">
                                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg">{member.name}</h3>
                                <p className="text-primary text-sm font-medium mb-3">{member.role}</p>
                                <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
