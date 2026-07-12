'use client';

import { Mic, Volume2, Languages, Sparkles, MessageSquare } from 'lucide-react';
import { useSiteLanguage } from '@/lib/siteLanguage';
import VoiceAssistant from '@/components/voice/VoiceAssistant';

export default function VoiceAssistantPage() {
    const { t } = useSiteLanguage();

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6">
            <div className="rounded-3xl border border-border bg-linear-to-br from-primary/10 via-background to-emerald-500/10 p-8">
                <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-primary/20 p-3 text-primary">
                        <Sparkles className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('voiceAssistant')}</h1>
                        <p className="mt-2 text-muted-foreground">
                            Type or speak any farming question in your own words. You get a real answer for your exact
                            crop, problem, and location — not a generic template.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-card p-5">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h3 className="mt-3 font-semibold text-foreground">Any question</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Describe your issue in detail — e.g. crop, symptoms, district, and season.
                    </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                    <Languages className="h-5 w-5 text-primary" />
                    <h3 className="mt-3 font-semibold text-foreground">Multilingual</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        English, Hindi, Bengali, Kannada, Malayalam, Tamil, and Telugu.
                    </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                    <Volume2 className="h-5 w-5 text-primary" />
                    <h3 className="mt-3 font-semibold text-foreground">Voice + text</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Use the mic or type in the box below; answers can be read aloud.
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 md:p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-primary">
                    <Mic className="h-4 w-4" />
                    Ask Kisan Sahayak
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                    Example: &ldquo;My 45-day paddy has brown leaf spots after rain in Assam — what spray and dose should
                    I use?&rdquo;
                </p>
                <VoiceAssistant variant="embedded" defaultOpen />
            </div>
        </div>
    );
}
