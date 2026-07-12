'use client';

import React, { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, Languages, Palette, HelpCircle, Save, Check, Eye, EyeOff, ChevronDown, ChevronUp, Sun, Moon, Monitor, AlertCircle } from 'lucide-react';

const PHONE_REGEX = /^[6-9]\d{9}$/;

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button
            type="button"
            aria-label="Toggle setting"
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}
        >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 py-4 border-b border-border last:border-0">
            <div>
                <p className="text-sm font-semibold">{label}</p>
                {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
            </div>
            {children}
        </div>
    );
}

interface ProfileErrors {
    name?: string;
    phone?: string;
    location?: string;
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('Profile');
    const [saveMessage, setSaveMessage] = useState('');
    const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});

    function loadStoredSettings() {
        if (typeof window === 'undefined') return null;
        try {
            const stored = localStorage.getItem('appSettings');
            if (stored) return JSON.parse(stored);
            return null;
        } catch { return null; }
    }

    function loadSignupFallback(key: string) {
        if (typeof window === 'undefined') return '';
        try { return localStorage.getItem(key) || ''; } catch { return ''; }
    }

    // Profile
    const [name, setName] = useState(() => {
        const s = loadStoredSettings();
        return s?.name || loadSignupFallback('userName') || '';
    });
    const [phone, setPhone] = useState(() => {
        const s = loadStoredSettings();
        return s?.phone || loadSignupFallback('userPhone') || '';
    });
    const [location, setLocation] = useState(() => {
        const s = loadStoredSettings();
        return s?.location || loadSignupFallback('userLocation') || '';
    });

    // Notifications
    const [smsAlerts, setSmsAlerts] = useState(() => {
        const s = loadStoredSettings();
        return s?.smsAlerts !== undefined ? s.smsAlerts : true;
    });
    const [emailAlerts, setEmailAlerts] = useState(() => {
        const s = loadStoredSettings();
        return s?.emailAlerts !== undefined ? s.emailAlerts : false;
    });
    const [priceAlerts, setPriceAlerts] = useState(() => {
        const s = loadStoredSettings();
        return s?.priceAlerts !== undefined ? s.priceAlerts : true;
    });
    const [weatherAlerts, setWeatherAlerts] = useState(() => {
        const s = loadStoredSettings();
        return s?.weatherAlerts !== undefined ? s.weatherAlerts : true;
    });
    const [schemeAlerts, setSchemeAlerts] = useState(() => {
        const s = loadStoredSettings();
        return s?.schemeAlerts !== undefined ? s.schemeAlerts : false;
    });

    // Security
    const [showPin, setShowPin] = useState(false);
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [twoFA, setTwoFA] = useState(() => {
        const s = loadStoredSettings();
        return s?.twoFA !== undefined ? s.twoFA : false;
    });
    const [loginAlerts, setLoginAlerts] = useState(() => {
        const s = loadStoredSettings();
        return s?.loginAlerts !== undefined ? s.loginAlerts : true;
    });

    // Language
    const [language, setLanguage] = useState(() => {
        const s = loadStoredSettings();
        return s?.language || 'English';
    });
    const [dateFormat, setDateFormat] = useState(() => {
        const s = loadStoredSettings();
        return s?.dateFormat || 'DD/MM/YYYY';
    });
    const [units, setUnits] = useState(() => {
        const s = loadStoredSettings();
        return s?.units || 'Metric';
    });

    // Appearance
    const [theme, setTheme] = useState(() => {
        const s = loadStoredSettings();
        return s?.theme || 'System';
    });
    const [fontSize, setFontSize] = useState(() => {
        const s = loadStoredSettings();
        return s?.fontSize || 'Medium';
    });
    const [compactMode, setCompactMode] = useState(() => {
        const s = loadStoredSettings();
        return s?.compactMode !== undefined ? s.compactMode : false;
    });

    // Load settings from localStorage on mount


    // Apply theme whenever it changes
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'Dark') {
            root.classList.add('dark');
            root.setAttribute('data-theme', 'dark');
        } else if (theme === 'Light') {
            root.classList.remove('dark');
            root.setAttribute('data-theme', 'light');
        } else {
            // System
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.toggle('dark', prefersDark);
            root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
    }, [theme]);

    // Apply font size whenever it changes
    useEffect(() => {
        const root = document.documentElement;
        if (fontSize === 'Small') {
            root.style.fontSize = '14px';
        } else if (fontSize === 'Large') {
            root.style.fontSize = '18px';
        } else {
            root.style.fontSize = '16px';
        }
    }, [fontSize]);

    // Apply compact mode whenever it changes
    useEffect(() => {
        if (compactMode) {
            document.documentElement.classList.add('compact');
        } else {
            document.documentElement.classList.remove('compact');
        }
    }, [compactMode]);

    // Help FAQ
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
        { q: 'How is the crop advisory generated?', a: 'Our advisory uses a combination of agronomic databases, regional soil profiles, crop stage data, and reported pest patterns to generate stage-specific recommendations tailored to your farm.' },
        { q: 'Is my farm data private?', a: 'Yes. All your farm data is stored locally on your device. We do not share any personally identifiable information with third parties.' },
        { q: 'How accurate is the weather data?', a: 'Weather data is sourced from IMD (India Meteorological Department) feeds and updated every 3 hours for your registered location.' },
        { q: 'Can I use the app offline?', a: 'Advisory, calendar, and farm management features work fully offline. Weather, market prices, and forum require an internet connection.' },
        { q: 'How do I get SMS alerts for MSP changes?', a: 'Enable SMS Alerts in the Notifications tab and ensure your phone number is saved in your Profile. Alerts are sent within 24 hours of official MSP announcements.' },
    ];

    const validateProfile = (): boolean => {
        const errors: ProfileErrors = {};

        const trimmedName = name.trim();
        if (trimmedName && trimmedName.length < 2) {
            errors.name = 'Name must be at least 2 characters.';
        } else if (trimmedName.length > 80) {
            errors.name = 'Name cannot exceed 80 characters.';
        }

        const trimmedPhone = phone.trim().replace(/\s/g, '');
        if (trimmedPhone && !PHONE_REGEX.test(trimmedPhone)) {
            errors.phone = 'Enter a valid 10-digit mobile number.';
        }

        const trimmedLocation = location.trim();
        if (trimmedLocation.length > 150) {
            errors.location = 'Location cannot exceed 150 characters.';
        }

        setProfileErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = () => {
        if (activeTab === 'Profile' && !validateProfile()) {
            return;
        }

        try {
            localStorage.setItem('appSettings', JSON.stringify({
                name, phone, location,
                smsAlerts, emailAlerts, priceAlerts, weatherAlerts, schemeAlerts,
                twoFA, loginAlerts,
                language, dateFormat, units,
                theme, fontSize, compactMode,
            }));
            // Sync profile data used by dashboard and sidebar
            if (name.trim()) localStorage.setItem('userName', name.trim());
            if (phone.trim()) localStorage.setItem('userPhone', phone.trim());
            if (location.trim()) localStorage.setItem('userLocation', location.trim());
        } catch {}
        setSaveMessage('Changes saved!');
        setTimeout(() => setSaveMessage(''), 2500);
    };

    const tabs = [
        { name: 'Profile', icon: User },
        { name: 'Notifications', icon: Bell },
        { name: 'Security', icon: Shield },
        { name: 'Language', icon: Languages },
        { name: 'Appearance', icon: Palette },
        { name: 'Help', icon: HelpCircle },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-1">
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-xl">
                        <Settings className="h-6 w-6 text-primary" />
                    </div>
                    Account Settings
                </h1>
                <p className="text-muted-foreground mt-1">Manage your profile, notifications, and preferences.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    <nav className="flex flex-col gap-1">
                        {tabs.map((item) => (
                            <button key={item.name} onClick={() => setActiveTab(item.name)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.name ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="md:col-span-3 space-y-6">
                    {/* ── PROFILE ── */}
                    {activeTab === 'Profile' && (
                        <>
                            <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                <h2 className="text-xl font-bold flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Profile Information</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Name</label>
                                        <input
                                            value={name}
                                            onChange={e => {
                                                setName(e.target.value);
                                                if (profileErrors.name) setProfileErrors(prev => ({ ...prev, name: undefined }));
                                            }}
                                            maxLength={80}
                                            className={`w-full p-2.5 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm ${profileErrors.name ? 'border-red-400 dark:border-red-500' : 'border-border'}`}
                                        />
                                        {profileErrors.name && (
                                            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> {profileErrors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone Number</label>
                                        <input
                                            value={phone}
                                            onChange={e => {
                                                setPhone(e.target.value);
                                                if (profileErrors.phone) setProfileErrors(prev => ({ ...prev, phone: undefined }));
                                            }}
                                            maxLength={10}
                                            placeholder="10-digit mobile number"
                                            className={`w-full p-2.5 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm ${profileErrors.phone ? 'border-red-400 dark:border-red-500' : 'border-border'}`}
                                        />
                                        {profileErrors.phone && (
                                            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> {profileErrors.phone}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <label className="text-sm font-medium">Location</label>
                                        <input
                                            value={location}
                                            onChange={e => {
                                                setLocation(e.target.value);
                                                if (profileErrors.location) setProfileErrors(prev => ({ ...prev, location: undefined }));
                                            }}
                                            maxLength={150}
                                            placeholder="District, State"
                                            className={`w-full p-2.5 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm ${profileErrors.location ? 'border-red-400 dark:border-red-500' : 'border-border'}`}
                                        />
                                        {profileErrors.location && (
                                            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> {profileErrors.location}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-border flex items-center justify-between">
                                    {saveMessage && <span className="text-sm text-green-600 font-semibold flex items-center gap-1"><Check className="h-4 w-4" />{saveMessage}</span>}
                                    <button onClick={handleSave} className="ml-auto flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                        <Save className="h-4 w-4" /> Save Changes
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-red-600"><Shield className="h-5 w-5" /> Danger Zone</h2>
                                <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back. Please be certain.</p>
                                <button
                                    onClick={async () => {
                                        if (window.confirm('Are you sure you want to delete your account? All local data will be cleared. This action cannot be undone.')) {
                                            try {
                                                await fetch('/api/auth/logout', {
                                                    method: 'POST',
                                                });
                                            } catch {}
                                            try {
                                                localStorage.removeItem('isLoggedIn');
                                                localStorage.removeItem('userName');
                                                localStorage.removeItem('userEmail');
                                                localStorage.removeItem('userPhone');
                                                localStorage.removeItem('userLocation');
                                                localStorage.removeItem('appSettings');
                                                localStorage.removeItem('forumPosts');
                                                localStorage.removeItem('marketAlerts');
                                                localStorage.removeItem('advisoryHistory');
                                                localStorage.removeItem('savedYieldPredictions');
                                            } catch {}
                                            window.location.href = '/';
                                        }
                                    }}
                                    className="px-6 py-2.5 border border-red-200 text-red-600 rounded-full font-semibold hover:bg-red-50 transition-all text-sm">Delete Account</button>
                            </div>
                        </>
                    )}

                    {/* ── NOTIFICATIONS ── */}
                    {activeTab === 'Notifications' && (
                        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><Bell className="h-5 w-5 text-primary" /> Notification Preferences</h2>
                            <p className="text-sm text-muted-foreground mb-4">Choose how and when you receive alerts.</p>
                            <SettingRow label="SMS Alerts" description="Receive critical advisories via SMS to your registered number">
                                <Toggle checked={smsAlerts} onChange={() => setSmsAlerts(!smsAlerts)} />
                            </SettingRow>
                            <SettingRow label="Email Notifications" description="Weekly farm summaries and government scheme updates">
                                <Toggle checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} />
                            </SettingRow>
                            <SettingRow label="Market Price Alerts" description="Alert when crop prices change by more than ₹50/quintal">
                                <Toggle checked={priceAlerts} onChange={() => setPriceAlerts(!priceAlerts)} />
                            </SettingRow>
                            <SettingRow label="Weather Warnings" description="Receive extreme weather and frost warnings">
                                <Toggle checked={weatherAlerts} onChange={() => setWeatherAlerts(!weatherAlerts)} />
                            </SettingRow>
                            <SettingRow label="New Scheme Announcements" description="Get notified when new government schemes are announced">
                                <Toggle checked={schemeAlerts} onChange={() => setSchemeAlerts(!schemeAlerts)} />
                            </SettingRow>
                            <div className="pt-4 flex justify-end">
                                <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all text-sm">
                                    <Save className="h-4 w-4" /> Save Preferences
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── SECURITY ── */}
                    {activeTab === 'Security' && (
                        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Security Settings</h2>
                            <div className="space-y-4">
                                <p className="text-sm font-semibold">Change Login PIN</p>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 relative">
                                        <label className="text-xs text-muted-foreground">Current PIN</label>
                                        <div className="relative">
                                            <input type={showPin ? 'text' : 'password'} value={currentPin} onChange={e => setCurrentPin(e.target.value)}
                                                placeholder="Enter current PIN" className="w-full p-2.5 rounded-xl border border-border bg-background text-sm pr-10 focus:ring-2 focus:ring-primary/20 outline-none" />
                                            <button type="button" aria-label={showPin ? 'Hide PIN' : 'Show PIN'} onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-muted-foreground">New PIN</label>
                                        <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)}
                                            placeholder="Enter new PIN" className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                                    </div>
                                </div>
                                <button onClick={() => { setCurrentPin(''); setNewPin(''); handleSave(); }}
                                    className="px-5 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-primary/90 transition-all">Update PIN</button>
                            </div>
                            <div className="border-t border-border pt-4">
                                <SettingRow label="Two-Factor Authentication" description="Require OTP on each new device login">
                                    <Toggle checked={twoFA} onChange={() => setTwoFA(!twoFA)} />
                                </SettingRow>
                                <SettingRow label="Login Activity Alerts" description="Get notified when your account is accessed from a new device">
                                    <Toggle checked={loginAlerts} onChange={() => setLoginAlerts(!loginAlerts)} />
                                </SettingRow>
                            </div>
                        </div>
                    )}

                    {/* ── LANGUAGE ── */}
                    {activeTab === 'Language' && (
                        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Languages className="h-5 w-5 text-primary" /> Language & Regional</h2>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">App Language</label>
                                    <select value={language} onChange={e => setLanguage(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                                        {['English', 'हिंदी (Hindi)', 'मराठी (Marathi)', 'ਪੰਜਾਬੀ (Punjabi)', 'தமிழ் (Tamil)', 'తెలుగు (Telugu)', 'ಕನ್ನಡ (Kannada)', 'বাংলা (Bengali)'].map(l => <option key={l}>{l}</option>)}
                                    </select>
                                    {language !== 'English' && <p className="text-xs text-amber-600 font-medium">⚠ Full translation coming soon. Some sections may still appear in English.</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Date Format</label>
                                    <select value={dateFormat} onChange={e => setDateFormat(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                                        {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].map(f => <option key={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Measurement Units</label>
                                    <div className="flex gap-3">
                                        {['Metric', 'Imperial'].map(u => (
                                            <button key={u} onClick={() => setUnits(u)}
                                                className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${units === u ? 'bg-primary text-white border-primary' : 'border-border hover:bg-muted'}`}>
                                                {u}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{units === 'Metric' ? 'Rainfall: mm, Temperature: °C, Area: hectares, Yield: kg/hectare' : 'Rainfall: inches, Temperature: °F, Area: acres, Yield: lb/acre'}</p>
                                </div>
                                <div className="pt-4 border-t border-border flex justify-end">
                                    <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all text-sm">
                                        <Save className="h-4 w-4" /> Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── APPEARANCE ── */}
                    {activeTab === 'Appearance' && (
                        <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Appearance</h2>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Theme</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[{ name: 'Light', icon: Sun }, { name: 'Dark', icon: Moon }, { name: 'System', icon: Monitor }].map(({ name, icon: Icon }) => (
                                        <button key={name} onClick={() => setTheme(name)}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === name ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                                            <Icon className={`h-5 w-5 ${theme === name ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <span className={`text-xs font-semibold ${theme === name ? 'text-primary' : 'text-muted-foreground'}`}>{name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Font Size</label>
                                <div className="flex gap-2">
                                    {['Small', 'Medium', 'Large'].map(s => (
                                        <button key={s} onClick={() => setFontSize(s)}
                                            className={`px-4 py-2 rounded-full text-sm border transition-all font-semibold ${fontSize === s ? 'bg-primary text-white border-primary' : 'border-border hover:bg-muted'}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <SettingRow label="Compact Mode" description="Reduce spacing and padding for a denser layout">
                                <Toggle checked={compactMode} onChange={() => setCompactMode(!compactMode)} />
                            </SettingRow>
                            <div className="pt-2 flex justify-end">
                                <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all text-sm">
                                    <Save className="h-4 w-4" /> Apply
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── HELP ── */}
                    {activeTab === 'Help' && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><HelpCircle className="h-5 w-5 text-primary" /> Frequently Asked Questions</h2>
                                <div className="space-y-2">
                                    {faqs.map((faq, i) => (
                                        <div key={i} className="border border-border rounded-xl overflow-hidden">
                                            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                                className="w-full flex items-center justify-between p-4 text-sm font-semibold hover:bg-muted/30 transition-colors text-left gap-4">
                                                <span>{faq.q}</span>
                                                {openFaq === i ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                                            </button>
                                            {openFaq === i && (
                                                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed bg-muted/10">{faq.a}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold mb-3">Contact Support</h2>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p>📧 <span className="font-medium text-foreground">support@smartagrisense.in</span></p>
                                    <p>📞 <span className="font-medium text-foreground">1800-123-4567</span> (Toll-free, Mon–Sat 9AM–6PM)</p>
                                    <p>💬 WhatsApp: <span className="font-medium text-foreground">+91 98000 12345</span></p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                                    <span>SmartAgriSense v2.1.0</span>
                                    <span>Last updated: March 2026</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
