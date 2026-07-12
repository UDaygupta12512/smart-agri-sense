'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sprout, Loader2, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSiteLanguage } from '@/lib/siteLanguage';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LoginResponse {
    user?: {
        name?: string;
        email?: string;
        location?: string;
    };
    message?: string;
}

export default function LoginPage() {
    const router = useRouter();
    const { language } = useSiteLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const COPY: Record<string, Record<string, string>> = {
        en: {
            welcome: 'Welcome Back, Farmer!',
            subtitle: 'Sign in with your email to access your dashboard.',
            email: 'Email Address',
            password: 'Password',
            passwordPlaceholder: 'Enter your password',
            signIn: 'Sign in to Dashboard',
            signingIn: 'Signing in...',
            newUser: 'New to SmartAgriSense?',
            createAccount: 'Create Account',
            invalidEmail: 'Please enter a valid email address.',
            shortPassword: 'Password must be at least 8 characters long.',
            loginFailed: 'Login failed. Please try again.',
            loginRetry: 'Unable to login right now. Please try again in a moment.',
            accountNotFound: 'Account not found. Please create an account first.',
        },
        hi: {
            welcome: 'फिर से स्वागत है, किसान!',
            subtitle: 'डैशबोर्ड खोलने के लिए अपने ईमेल से साइन इन करें।',
            email: 'ईमेल पता',
            password: 'पासवर्ड',
            passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
            signIn: 'डैशबोर्ड में साइन इन करें',
            signingIn: 'साइन इन हो रहा है...',
            newUser: 'SmartAgriSense पर नए हैं?',
            createAccount: 'खाता बनाएं',
            invalidEmail: 'कृपया सही ईमेल पता दर्ज करें।',
            shortPassword: 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।',
            loginFailed: 'लॉगिन विफल हुआ। कृपया फिर प्रयास करें।',
            loginRetry: 'अभी लॉगिन संभव नहीं है। कृपया थोड़ी देर बाद प्रयास करें।',
            accountNotFound: 'खाता नहीं मिला। कृपया पहले खाता बनाएं।',
        },
        ta: {
            welcome: 'மீண்டும் வரவேற்கிறோம், விவசாயி!',
            subtitle: 'உங்கள் டாஷ்போர்டை அணுக மின்னஞ்சலால் உள்நுழையவும்.',
            email: 'மின்னஞ்சல் முகவரி',
            password: 'கடவுச்சொல்',
            passwordPlaceholder: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்',
            signIn: 'டாஷ்போர்டில் உள்நுழையவும்',
            signingIn: 'உள்நுழைகிறது...',
            newUser: 'SmartAgriSense-க்கு புதியவரா?',
            createAccount: 'கணக்கு உருவாக்கவும்',
            invalidEmail: 'சரியான மின்னஞ்சலை உள்ளிடவும்.',
            shortPassword: 'கடவுச்சொல் குறைந்தது 8 எழுத்துகள் இருக்க வேண்டும்.',
            loginFailed: 'உள்நுழைவு தோல்வி. மீண்டும் முயற்சிக்கவும்.',
            loginRetry: 'தற்போது உள்நுழைய முடியவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.',
            accountNotFound: 'கணக்கு கிடைக்கவில்லை. முதலில் கணக்கை உருவாக்கவும்.',
        },
        te: {
            welcome: 'మళ్లీ స్వాగతం రైతు!',
            subtitle: 'మీ డ్యాష్‌బోర్డ్‌కి చేరడానికి ఈమెయిల్‌తో సైన్ ఇన్ చేయండి.',
            email: 'ఈమెయిల్ చిరునామా',
            password: 'పాస్‌వర్డ్',
            passwordPlaceholder: 'మీ పాస్‌వర్డ్ నమోదు చేయండి',
            signIn: 'డ్యాష్‌బోర్డ్‌లో సైన్ ఇన్',
            signingIn: 'సైన్ ఇన్ అవుతోంది...',
            newUser: 'SmartAgriSenseకి కొత్తవారా?',
            createAccount: 'ఖాతా సృష్టించండి',
            invalidEmail: 'చెల్లుబాటు అయ్యే ఈమెయిల్ ఇవ్వండి.',
            shortPassword: 'పాస్‌వర్డ్ కనీసం 8 అక్షరాలు ఉండాలి.',
            loginFailed: 'లాగిన్ విఫలమైంది. మళ్లీ ప్రయత్నించండి.',
            loginRetry: 'ప్రస్తుతం లాగిన్ కాలేదు. కొంతసేపటి తరువాత మళ్లీ ప్రయత్నించండి.',
            accountNotFound: 'ఖాతా కనుగొనబడలేదు. దయచేసి ముందుగా ఖాతాను సృష్టించండి.',
        },
    };

    const text = COPY[language] ?? COPY.en;

    useEffect(() => {
        let isMounted = true;

        async function checkSession() {
            try {
                const response = await fetch('/api/auth/me', {
                    method: 'GET',
                    cache: 'no-store',
                });

                if (isMounted && response.ok) {
                    router.replace('/dashboard');
                }
            } catch {
                // Keep user on login page when no valid session exists.
            }
        }

        void checkSession();

        return () => {
            isMounted = false;
        };
    }, [router]);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        const normalizedEmail = email.trim().toLowerCase();
        if (!EMAIL_REGEX.test(normalizedEmail)) {
            setError(text.invalidEmail);
            return;
        }

        if (password.length < 8) {
            setError(text.shortPassword);
            return;
        }

        try {
            const registeredStr = localStorage.getItem('registeredUsers') || '[]';
            const registeredUsers = JSON.parse(registeredStr);
            if (!registeredUsers.includes(normalizedEmail)) {
                setError(text.accountNotFound);
                return;
            }
        } catch {
            // Ignore if localStorage fails
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: normalizedEmail,
                    password,
                }),
            });

            const result = (await response.json().catch(() => ({}))) as LoginResponse;

            if (!response.ok) {
                setError(result.message ?? text.loginFailed);
                return;
            }

            try {
                localStorage.setItem('isLoggedIn', 'true');
                if (result.user?.name) {
                    localStorage.setItem('userName', result.user.name);
                }
                if (result.user?.email) {
                    localStorage.setItem('userEmail', result.user.email);
                }
                if (result.user?.location) {
                    localStorage.setItem('userLocation', result.user.location);
                }
            } catch {
                // localStorage might be blocked; session cookie still works.
            }

            // Force a full page navigation so the cookie is sent with the request
            window.location.href = '/dashboard';
        } catch {
            setError(text.loginRetry);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-background rounded-2xl shadow-xl border border-border/50 overflow-hidden"
            >
                <div className="p-8 text-center border-b border-border/50 bg-muted/20">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4">
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Sprout className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">SmartAgriSense</span>
                    </Link>
                    <h1 className="text-xl font-semibold">{text.welcome}</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        {text.subtitle}
                    </p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {text.email}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {text.password}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder={text.passwordPlaceholder}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {text.signingIn}
                                </>
                            ) : (
                                text.signIn
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-muted-foreground">
                            {text.newUser}{' '}
                            <Link href="/signup" className="text-primary hover:underline font-medium">
                                {text.createAccount}
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
