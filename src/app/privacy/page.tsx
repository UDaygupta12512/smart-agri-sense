'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Lock, Eye, Bell, Trash2, Globe, Mail, ChevronRight } from 'lucide-react';
import { useSiteLanguage } from '@/lib/siteLanguage';

const sections = [
    {
        id: '1',
        icon: Eye,
        title: '1. Information We Collect',
        content: [
            'Account Information: Name, mobile number, location (district/state), and preferred language when you register.',
            'Farm Data: Crop types, acreage, soil test results, photos of crops/pests uploaded for AI analysis, and yield history.',
            'Device & Usage Data: IP address, browser type, pages visited, feature usage logs, and session duration — used solely to improve performance.',
            'Location Data: Approximate GPS coordinates (if permitted) to deliver hyper-local weather and market data.',
            'Voice Input: Temporary audio recordings when using the Kisan Sahayak voice assistant. These are processed in-session and not permanently stored.',
        ]
    },
    {
        id: '2',
        icon: Shield,
        title: '2. How We Use Your Data',
        content: [
            'Personalized Advisory: Your farm location, crop type, and soil data are used to generate AI-driven recommendations for fertilizers, irrigation, and pest control.',
            'Model Improvement: Anonymized crop images and outcomes help retrain our pest detection and yield prediction models.',
            'Market Alerts: Your preferred crops are used to send relevant MSP updates and mandi price notifications.',
            'Platform Communication: We use your mobile number to send OTP logins, critical weather alerts, and scheme deadline reminders.',
            'We never sell your personal data to third parties for advertising or commercial purposes.',
        ]
    },
    {
        id: '3',
        icon: Lock,
        title: '3. Data Security',
        content: [
            'All data transmitted between your device and our servers is encrypted using TLS 1.3.',
            'Stored data is encrypted at rest using AES-256 encryption on our cloud infrastructure.',
            'We employ role-based access controls — only authorized personnel can access identifiable user data.',
            'Crop images uploaded for AI analysis are processed in an isolated compute environment and deleted after 30 days unless you save them to your profile.',
            'We conduct quarterly security audits and penetration testing on all APIs and data stores.',
        ]
    },
    {
        id: '4',
        icon: Globe,
        title: '4. Data Sharing',
        content: [
            'Government Partners: Anonymized and aggregated crop yield data may be shared with ICAR, state agriculture departments, or NAFED for policy planning — never individual-identifiable.',
            'Financial Partners: If you apply for a loan or scheme through our platform, only the information required by that institution (e.g., KYC data, land records) is shared with your explicit consent.',
            'Analytics Providers: We use privacy-compliant analytics to understand platform usage. No personally identifiable information is shared.',
            'Legal Obligations: We may disclose data if required by a court order, law enforcement, or applicable Indian law (IT Act 2000, DPDP Act 2023).',
        ]
    },
    {
        id: '5',
        icon: Bell,
        title: '5. Cookies & Tracking',
        content: [
            'We use essential session cookies to keep you logged in and maintain your language preference.',
            'Analytics cookies (first-party only) help us identify which features are most useful to farmers.',
            'We do not use third-party advertising cookies or tracking pixels.',
            'You can disable cookies in your browser settings; however, some platform features (e.g., persistent login) may not work.',
        ]
    },
    {
        id: '6',
        icon: Shield,
        title: '6. Your Rights',
        content: [
            'Right to Access: Request a copy of all personal data we hold about you via Settings → Privacy → Download My Data.',
            'Right to Correction: Update your name, location, or farm details at any time from Settings → Profile.',
            'Right to Deletion: Request full account and data deletion by contacting support@smartagrisense.com. Processing takes up to 30 days.',
            'Right to Portability: Export your farm records, crop history, and soil test data as a CSV file from Settings → Analytics.',
            'Right to Withdraw Consent: Opt out of non-essential data processing at any time via Settings → Privacy Controls.',
        ]
    },
    {
        id: '7',
        icon: Trash2,
        title: '7. Data Retention',
        content: [
            'Active account data is retained for the duration of your account plus 2 years for regulatory compliance.',
            'Voice recordings are deleted within 24 hours of processing.',
            'Pest-scan images are deleted after 30 days unless explicitly saved to your library.',
            'Transaction records related to government scheme applications are retained for 7 years per Indian financial regulations.',
            'Upon account deletion, all personal data is purged within 30 days except where legally required.',
        ]
    },
    {
        id: '8',
        icon: Mail,
        title: '8. Contact Us',
        content: [
            'Data Protection Officer: dpo@smartagrisense.com',
            'General Privacy Queries: support@smartagrisense.com',
            'Grievance Redressal (DPDP Act 2023): grievance@smartagrisense.com — response within 72 hours.',
            'Mailing Address: SmartAgriSense Pvt. Ltd., 123 Innovation Hub, Tech City, Bangalore, Karnataka 560100.',
        ]
    },
];

export default function PrivacyPage() {
    const { language } = useSiteLanguage();
    const text = language === 'hi'
        ? {
            title: 'आपकी गोपनीयता हमारे लिए महत्वपूर्ण है',
            subtitle: 'हम आपके व्यक्तिगत और कृषि डेटा की सुरक्षा के लिए प्रतिबद्ध हैं।',
            policy: 'गोपनीयता नीति',
            updated: 'अंतिम अपडेट:',
            sectionJump: 'खंड पर जाएं',
        }
        : language === 'ta'
            ? {
                title: 'உங்கள் தனியுரிமை எங்களுக்கு முக்கியம்',
                subtitle: 'உங்கள் தனிப்பட்ட மற்றும் பண்ணை தரவை பாதுகாக்க நாங்கள் உறுதியாக இருக்கிறோம்.',
                policy: 'தனியுரிமைக் கொள்கை',
                updated: 'கடைசியாக புதுப்பிக்கப்பட்டது:',
                sectionJump: 'பிரிவுக்கு செல்லவும்',
            }
            : language === 'te'
                ? {
                    title: 'మీ గోప్యత మాకు ముఖ్యమైనది',
                    subtitle: 'మీ వ్యక్తిగత మరియు వ్యవసాయ డేటాను రక్షించడానికి మేము కట్టుబడి ఉన్నాం.',
                    policy: 'గోప్యతా విధానం',
                    updated: 'చివరి నవీకరణ:',
                    sectionJump: 'విభాగానికి వెళ్లండి',
                }
        : {
            title: 'Your Privacy Matters to Us',
            subtitle: 'We are committed to protecting the personal and farm data of every farmer on our platform. This policy explains exactly what we collect, why, and how it\'s protected.',
            policy: 'Privacy Policy',
            updated: 'Last updated:',
            sectionJump: 'Jump to Section',
        };
    return (
        <main className="min-h-screen flex flex-col pt-24">
            <Navbar />
            <div className="container py-16 max-w-4xl">
                {/* Header */}
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                        <Shield className="h-4 w-4" />
                        {text.policy}
                    </div>
                    <h1 className="text-4xl font-extrabold mb-4">{text.title}</h1>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        {text.subtitle}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{text.updated} <strong className="text-foreground">March 1, 2026</strong></span>
                        <span>•</span>
                        <span>Compliant with <strong className="text-foreground">DPDP Act 2023</strong></span>
                    </div>
                </div>

                {/* Quick Navigation */}
                <div className="mb-10 p-5 bg-muted/30 rounded-2xl border border-border">
                    <p className="text-sm font-semibold mb-3">{text.sectionJump}</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                        {sections.map(s => (
                            <a
                                key={s.id}
                                href={`#section-${s.id}`}
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                                {s.title}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-10">
                    {sections.map(s => (
                        <div key={s.id} id={`section-${s.id}`} className="scroll-mt-28">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <s.icon className="h-5 w-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold">{s.title}</h2>
                            </div>
                            <ul className="space-y-3 pl-13">
                                {s.content.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                                        <span className="leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </main>
    );
}
