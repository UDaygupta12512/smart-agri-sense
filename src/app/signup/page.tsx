'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sprout, Loader2, MapPin, User, Mail, Lock, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSiteLanguage } from '@/lib/siteLanguage';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RegisterResponse {
    user?: {
        name?: string;
        email?: string;
        location?: string;
    };
    message?: string;
}

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
    requirements: {
        minLength: boolean;
        hasUppercase: boolean;
        hasLowercase: boolean;
        hasNumber: boolean;
    };
}

function calculatePasswordStrength(password: string): PasswordStrength {
    const requirements = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
    };

    const metCount = Object.values(requirements).filter(Boolean).length;

    if (metCount === 0) {
        return { score: 0, label: '', color: '', requirements };
    } else if (metCount === 1) {
        return { score: 25, label: 'Weak', color: 'bg-red-500', requirements };
    } else if (metCount === 2) {
        return { score: 50, label: 'Fair', color: 'bg-orange-500', requirements };
    } else if (metCount === 3) {
        return { score: 75, label: 'Good', color: 'bg-yellow-500', requirements };
    } else {
        return { score: 100, label: 'Strong', color: 'bg-green-500', requirements };
    }
}

import { createClient } from '@/utils/supabase/client';

export default function SignupPage() {
    const router = useRouter();
    const { language } = useSiteLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const supabase = createClient();

    const COPY: Record<string, Record<string, string>> = {
        en: {
            title: 'Join the Revolution!',
            subtitle: 'Create your email account to get smart insights for your farm.',
            fullName: 'Full Name',
            email: 'Email Address',
            password: 'Password',
            confirmPassword: 'Confirm Password',
            farmLocation: 'Farm Location',
            createAccount: 'Create Account',
            creating: 'Creating Account...',
            already: 'Already have an account?',
            loginHere: 'Login here',
            passwordsMatch: 'Passwords match',
            passwordsDontMatch: 'Passwords do not match',
            nameReq: 'Please enter your full name.',
            nameShort: 'Name must be at least 2 characters.',
            emailInvalid: 'Please enter a valid email address.',
            pwdShort: 'Password must be at least 8 characters long.',
            pwdRules: 'Password must include uppercase, lowercase, and a number.',
            pwdMismatch: 'Passwords do not match.',
        },
        hi: {
            title: 'क्रांति से जुड़ें!',
            subtitle: 'अपने खेत के लिए स्मार्ट जानकारी पाने हेतु ईमेल खाता बनाएं।',
            fullName: 'पूरा नाम',
            email: 'ईमेल पता',
            password: 'पासवर्ड',
            confirmPassword: 'पासवर्ड पुष्टि करें',
            farmLocation: 'खेत का स्थान',
            createAccount: 'खाता बनाएं',
            creating: 'खाता बनाया जा रहा है...',
            already: 'पहले से खाता है?',
            loginHere: 'यहां लॉगिन करें',
            passwordsMatch: 'पासवर्ड मेल खाते हैं',
            passwordsDontMatch: 'पासवर्ड मेल नहीं खाते',
            nameReq: 'कृपया अपना पूरा नाम दर्ज करें।',
            nameShort: 'नाम कम से कम 2 अक्षरों का होना चाहिए।',
            emailInvalid: 'कृपया सही ईमेल पता दर्ज करें।',
            pwdShort: 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।',
            pwdRules: 'पासवर्ड में uppercase, lowercase और number होना चाहिए।',
            pwdMismatch: 'पासवर्ड मेल नहीं खाते।',
        },
        ta: {
            title: 'புதிய மாற்றத்தில் சேருங்கள்!',
            subtitle: 'உங்கள் பண்ணைக்கான புத்திசாலி தகவல்களுக்கு கணக்கு உருவாக்கவும்.',
            fullName: 'முழு பெயர்',
            email: 'மின்னஞ்சல் முகவரி',
            password: 'கடவுச்சொல்',
            confirmPassword: 'கடவுச்சொல் உறுதிசெய்க',
            farmLocation: 'பண்ணை இடம்',
            createAccount: 'கணக்கு உருவாக்கவும்',
            creating: 'கணக்கு உருவாக்கப்படுகிறது...',
            already: 'ஏற்கனவே கணக்கு உள்ளதா?',
            loginHere: 'இங்கே உள்நுழையவும்',
            passwordsMatch: 'கடவுச்சொற்கள் பொருந்துகின்றன',
            passwordsDontMatch: 'கடவுச்சொற்கள் பொருந்தவில்லை',
            nameReq: 'தயவு செய்து உங்கள் முழு பெயரை உள்ளிடவும்.',
            nameShort: 'பெயர் குறைந்தது 2 எழுத்துகள் இருக்க வேண்டும்.',
            emailInvalid: 'சரியான மின்னஞ்சல் முகவரி உள்ளிடவும்.',
            pwdShort: 'கடவுச்சொல் குறைந்தது 8 எழுத்துகள் இருக்க வேண்டும்.',
            pwdRules: 'கடவுச்சொலில் uppercase, lowercase மற்றும் எண் இருக்க வேண்டும்.',
            pwdMismatch: 'கடவுச்சொற்கள் பொருந்தவில்லை.',
        },
        te: {
            title: 'విప్లవంలో చేరండి!',
            subtitle: 'మీ వ్యవసాయానికి స్మార్ట్ సమాచారం కోసం ఖాతా సృష్టించండి.',
            fullName: 'పూర్తి పేరు',
            email: 'ఈమెయిల్ చిరునామా',
            password: 'పాస్‌వర్డ్',
            confirmPassword: 'పాస్‌వర్డ్ నిర్ధారించండి',
            farmLocation: 'వ్యవసాయ స్థలం',
            createAccount: 'ఖాతా సృష్టించండి',
            creating: 'ఖాతా సృష్టిస్తోంది...',
            already: 'ఇప్పటికే ఖాతా ఉందా?',
            loginHere: 'ఇక్కడ లాగిన్ అవ్వండి',
            passwordsMatch: 'పాస్‌వర్డ్‌లు సరిపోతున్నాయి',
            passwordsDontMatch: 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు',
            nameReq: 'దయచేసి మీ పూర్తి పేరు నమోదు చేయండి.',
            nameShort: 'పేరు కనీసం 2 అక్షరాలు ఉండాలి.',
            emailInvalid: 'చెల్లుబాటు అయ్యే ఈమెయిల్ నమోదు చేయండి.',
            pwdShort: 'పాస్‌వర్డ్ కనీసం 8 అక్షరాలు ఉండాలి.',
            pwdRules: 'పాస్‌వర్డ్‌లో uppercase, lowercase మరియు సంఖ్య ఉండాలి.',
            pwdMismatch: 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు.',
        },
    };

    const text = COPY[language] ?? COPY.en;

    const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    useEffect(() => {
        let isMounted = true;

        async function checkSession() {
            const { data: { session } } = await supabase.auth.getSession();
            if (isMounted && session) {
                router.replace('/dashboard');
            }
        }

        void checkSession();

        return () => {
            isMounted = false;
        };
    }, [router, supabase.auth]);

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        const trimmedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();

        if (!trimmedName) {
            setError(text.nameReq);
            return;
        }

        if (trimmedName.length < 2) {
            setError(text.nameShort);
            return;
        }

        if (!EMAIL_REGEX.test(normalizedEmail)) {
            setError(text.emailInvalid);
            return;
        }

        if (password.length < 8) {
            setError(text.pwdShort);
            return;
        }

        const strength = calculatePasswordStrength(password);
        if (!strength.requirements.hasUppercase || !strength.requirements.hasLowercase || !strength.requirements.hasNumber) {
            setError(text.pwdRules);
            return;
        }

        if (password !== confirmPassword) {
            setError(text.pwdMismatch);
            return;
        }

        setIsLoading(true);

        try {
            const { data, error: authError } = await supabase.auth.signUp({
                email: normalizedEmail,
                password: password,
                options: {
                    data: {
                        full_name: trimmedName,
                    }
                }
            });

            if (authError) {
                console.error("Supabase auth error:", authError);
                let msg = authError?.message;
                if (typeof msg === 'string' && (msg === '{}' || msg.trim() === '')) {
                    msg = '';
                }
                setError(msg || (typeof authError === 'string' && authError !== '{}' ? authError : 'Unable to create account. Please verify your connection.'));
                return;
            }

            try {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userName', trimmedName);
                localStorage.setItem('userEmail', normalizedEmail);
            } catch {
                // Ignore localStorage errors
            }

            // Force a full page navigation so the cookie is sent with the request
            window.location.href = '/dashboard';
        } catch (err: any) {
            console.error("Unexpected error:", err);
            const msg = err?.message || (typeof err === 'string' ? err : null);
            setError(msg && msg !== '{}' ? msg : 'Unable to create your account right now. Please try again in a moment.');
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
                    <h1 className="text-xl font-semibold">{text.title}</h1>
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
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium leading-none">
                                {text.fullName}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    maxLength={80}
                                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none">
                                {text.email}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium leading-none">
                                {text.password}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    maxLength={128}
                                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    autoComplete="new-password"
                                    required
                                />
                            </div>
                            {password.length > 0 && (
                                <div className="space-y-2 mt-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Password strength:</span>
                                        <span className={`font-medium ${passwordStrength.score >= 75 ? 'text-green-600 dark:text-green-400' : passwordStrength.score >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.score === 0 ? 'w-0' : passwordStrength.score === 25 ? 'w-1/4' : passwordStrength.score === 50 ? 'w-1/2' : passwordStrength.score === 75 ? 'w-3/4' : 'w-full'}`}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-1 text-xs">
                                        <div className={`flex items-center gap-1 ${passwordStrength.requirements.minLength ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                            {passwordStrength.requirements.minLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                            8+ characters
                                        </div>
                                        <div className={`flex items-center gap-1 ${passwordStrength.requirements.hasUppercase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                            {passwordStrength.requirements.hasUppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                            Uppercase letter
                                        </div>
                                        <div className={`flex items-center gap-1 ${passwordStrength.requirements.hasLowercase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                            {passwordStrength.requirements.hasLowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                            Lowercase letter
                                        </div>
                                        <div className={`flex items-center gap-1 ${passwordStrength.requirements.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                            {passwordStrength.requirements.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                            Number
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                                {text.confirmPassword}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    maxLength={128}
                                    className={`flex h-10 w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${confirmPassword.length > 0 && !passwordsMatch ? 'border-red-400 dark:border-red-500' : 'border-input'}`}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>
                            {confirmPassword.length > 0 && (
                                <p className={`text-xs flex items-center gap-1 ${passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                    {passwordsMatch ? text.passwordsMatch : text.passwordsDontMatch}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {text.creating}
                                </>
                            ) : (
                                text.createAccount
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-muted-foreground">
                            {text.already}{' '}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                {text.loginHere}
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
