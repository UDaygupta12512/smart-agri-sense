'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSiteLanguage } from '@/lib/siteLanguage';

const PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
    subject?: string;
    message?: string;
}

export default function ContactPage() {
    const { language } = useSiteLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [errors, setErrors] = useState<FormErrors>({});

    const text = language === 'hi'
        ? {
            title: 'संपर्क करें',
            subtitle: 'हमारे ग्रामीण सलाहकार आपकी मदद के लिए उपलब्ध हैं। नीचे दिए गए माध्यमों से संपर्क करें।',
            messageSent: 'संदेश भेज दिया गया!',
            messageSentDesc: 'संपर्क के लिए धन्यवाद। हमारी टीम 4 घंटे में जवाब देगी।',
            sendAnother: 'एक और संदेश भेजें',
            name: 'नाम',
            phone: 'फोन',
            email: 'ईमेल',
            subject: 'विषय',
            message: 'संदेश',
            sending: 'भेजा जा रहा है...',
            sendMessage: 'संदेश भेजें',
        }
        : language === 'ta'
            ? {
                title: 'தொடர்பு கொள்ளுங்கள்',
                subtitle: 'எங்கள் ஆலோசகர்கள் உங்களுக்கு உதவ தயாராக உள்ளனர்.',
                messageSent: 'செய்தி அனுப்பப்பட்டது!',
                messageSentDesc: 'நன்றி. எங்கள் குழு 4 மணி நேரத்தில் பதிலளிக்கும்.',
                sendAnother: 'மற்றொரு செய்தி அனுப்பு',
                name: 'பெயர்',
                phone: 'தொலைபேசி',
                email: 'மின்னஞ்சல்',
                subject: 'பொருள்',
                message: 'செய்தி',
                sending: 'அனுப்புகிறது...',
                sendMessage: 'செய்தி அனுப்பு',
            }
            : language === 'te'
                ? {
                    title: 'సంప్రదించండి',
                    subtitle: 'మా గ్రామీణ సలహాదారులు మీకు సహాయం చేయడానికి సిద్ధంగా ఉన్నారు.',
                    messageSent: 'సందేశం పంపబడింది!',
                    messageSentDesc: 'ధన్యవాదాలు. మా బృందం 4 గంటల్లో స్పందిస్తుంది.',
                    sendAnother: 'మరొక సందేశం పంపండి',
                    name: 'పేరు',
                    phone: 'ఫోన్',
                    email: 'ఈమెయిల్',
                    subject: 'విషయం',
                    message: 'సందేశం',
                    sending: 'పంపుతోంది...',
                    sendMessage: 'సందేశం పంపండి',
                }
        : {
            title: 'Get in Touch',
            subtitle: 'Our rural advisors are here to help you grow. Reach out to us via any of these channels.',
            messageSent: 'Message Sent!',
            messageSentDesc: 'Thank you for reaching out. Our team will respond to your query within 4 hours.',
            sendAnother: 'Send Another Message',
            name: 'Name',
            phone: 'Phone',
            email: 'Email',
            subject: 'Subject',
            message: 'Message',
            sending: 'Sending...',
            sendMessage: 'Send Message',
        };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Name validation
        const trimmedName = formData.name.trim();
        if (!trimmedName) {
            newErrors.name = 'Name is required.';
        } else if (trimmedName.length < 2) {
            newErrors.name = 'Name must be at least 2 characters.';
        } else if (trimmedName.length > 100) {
            newErrors.name = 'Name cannot exceed 100 characters.';
        }

        // Email validation
        const trimmedEmail = formData.email.trim().toLowerCase();
        if (!trimmedEmail) {
            newErrors.email = 'Email is required.';
        } else if (!EMAIL_REGEX.test(trimmedEmail)) {
            newErrors.email = 'Please enter a valid email address.';
        }

        // Phone validation (optional but must be valid if provided)
        const trimmedPhone = formData.phone.trim().replace(/\s/g, '');
        if (trimmedPhone && !PHONE_REGEX.test(trimmedPhone)) {
            newErrors.phone = 'Please enter a valid 10-digit Indian mobile number.';
        }

        // Subject validation
        const trimmedSubject = formData.subject.trim();
        if (!trimmedSubject) {
            newErrors.subject = 'Subject is required.';
        } else if (trimmedSubject.length < 3) {
            newErrors.subject = 'Subject must be at least 3 characters.';
        } else if (trimmedSubject.length > 200) {
            newErrors.subject = 'Subject cannot exceed 200 characters.';
        }

        // Message validation
        const trimmedMessage = formData.message.trim();
        if (!trimmedMessage) {
            newErrors.message = 'Message is required.';
        } else if (trimmedMessage.length < 10) {
            newErrors.message = 'Message must be at least 10 characters.';
        } else if (trimmedMessage.length > 2000) {
            newErrors.message = 'Message cannot exceed 2000 characters.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            setErrors({});
        }, 1400);
    };

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <main className="min-h-screen flex flex-col pt-24">
            <Navbar />
            <div className="container py-16">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Info */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-extrabold mb-4">{text.title}</h1>
                            <p className="text-xl text-muted-foreground">{text.subtitle}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <Mail className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold">Email Support</p>
                                    <p className="text-muted-foreground">support@smartagrisense.com</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <Phone className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold">Agricultural Helpline</p>
                                    <p className="text-muted-foreground">+91 1800-123-4567</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Mon–Sat, 8 AM – 8 PM IST</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <MapPin className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold">Innovation Hub</p>
                                    <p className="text-muted-foreground">123 Tech City, Bangalore, KA 560100</p>
                                </div>
                            </div>
                        </div>

                        {/* Response time notice */}
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                            <p className="text-sm font-medium text-primary">Average Response Time</p>
                            <p className="text-sm text-muted-foreground mt-1">Email queries answered within 4 hours. Helpline available in Hindi, Marathi, Telugu, Punjabi, and English.</p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 shadow-sm">
                        {submitted ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-4">
                                <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold">{text.messageSent}</h2>
                                <p className="text-muted-foreground max-w-xs">{text.messageSentDesc}</p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="mt-4 px-6 py-2 rounded-full border border-primary text-primary font-medium text-sm hover:bg-primary hover:text-white transition-colors"
                                >
                                    {text.sendAnother}
                                </button>
                            </div>
                        ) : (
                            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{text.name} <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => handleInputChange('name', e.target.value)}
                                            className={`w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none ${errors.name ? 'border-red-400 dark:border-red-500' : 'border-border'}`}
                                            placeholder="Your name"
                                            maxLength={100}
                                        />
                                        {errors.name && (
                                            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> {errors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">{text.phone}</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => handleInputChange('phone', e.target.value)}
                                            className={`w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none ${errors.phone ? 'border-red-400 dark:border-red-500' : 'border-border'}`}
                                            placeholder="10-digit mobile number"
                                            maxLength={10}
                                        />
                                        {errors.phone && (
                                            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> {errors.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{text.email} <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => handleInputChange('email', e.target.value)}
                                        className={`w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none ${errors.email ? 'border-red-400 dark:border-red-500' : 'border-border'}`}
                                        placeholder="your@email.com"
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> {errors.email}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{text.subject} <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={e => handleInputChange('subject', e.target.value)}
                                        className={`w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none ${errors.subject ? 'border-red-400 dark:border-red-500' : 'border-border'}`}
                                        placeholder="How can we help?"
                                        maxLength={200}
                                    />
                                    {errors.subject && (
                                        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> {errors.subject}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{text.message} <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={formData.message}
                                        onChange={e => handleInputChange('message', e.target.value)}
                                        className={`w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none h-32 resize-none ${errors.message ? 'border-red-400 dark:border-red-500' : 'border-border'}`}
                                        placeholder="Tell us more... (minimum 10 characters)"
                                        maxLength={2000}
                                    ></textarea>
                                    <div className="flex justify-between items-center">
                                        {errors.message ? (
                                            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> {errors.message}
                                            </p>
                                        ) : (
                                            <span />
                                        )}
                                        <span className="text-xs text-muted-foreground">{formData.message.length}/2000</span>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-primary text-white py-4 rounded-full font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-70"
                                >
                                    {isSubmitting ? (
                                        <><span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> {text.sending}</>
                                    ) : (
                                        <>{text.sendMessage} <Send className="h-4 w-4" /></>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
