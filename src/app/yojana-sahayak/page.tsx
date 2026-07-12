"use client";

import Link from "next/link";
import {
  MapPinned,
  Landmark,
  Percent,
  Tractor,
  ShieldCheck,
  LineChart,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import YojanaInteractive from "@/components/yojana/YojanaInteractive";
import { useSiteLanguage } from "@/lib/siteLanguage";

const featureCards = [
  {
    title: "Personalized Scheme Recommender",
    description:
      "Matches schemes to age, occupation, income, and household needs with a clear benefit score.",
    icon: Landmark,
    accent: "from-amber-500/20 via-orange-400/10 to-transparent",
  },
  {
    title: "Region-Specific Recommendations",
    description:
      "Blends demography, seasonal cycles, and administrative targets to surface the most relevant schemes.",
    icon: MapPinned,
    accent: "from-emerald-500/20 via-green-400/10 to-transparent",
  },
  {
    title: "Loan Viability Prediction",
    description:
      "Estimates loan eligibility using income, land size, and rainfall patterns for farmers.",
    icon: Tractor,
    accent: "from-sky-500/20 via-cyan-400/10 to-transparent",
  },
  {
    title: "Hierarchical Administrative Dashboards",
    description:
      "National, State, and District officers can set targets and monitor scheme impact.",
    icon: ShieldCheck,
    accent: "from-violet-500/20 via-fuchsia-400/10 to-transparent",
  },
  {
    title: "Interactive Visualizations",
    description:
      "Forecasts scheme success and shows future trends based on historical impact data.",
    icon: LineChart,
    accent: "from-rose-500/20 via-pink-400/10 to-transparent",
  },
];

const signalPills = [
  "Demography",
  "Farming cycles",
  "Income profile",
  "Land size",
  "Rainfall",
  "Administrative targets",
];

export default function YojanaSahayakPage() {
  const { language } = useSiteLanguage();
  const text = language === 'hi'
    ? {
      heroTitle1: 'India Post के लिए वित्तीय मार्गदर्शन,',
      heroTitle2: 'हर समुदाय के लिए व्यक्तिगत।',
      heroDesc: 'Yojana Sahayak जनसांख्यिकी, कृषि चक्र और स्थानीय आर्थिक संकेतों के आधार पर सही योजनाएं सुझाता है।',
      requestDemo: 'डेमो अनुरोध करें',
      exploreMission: 'मिशन देखें',
      jumpTo: 'यहां जाएं',
      keyFeatures: 'मुख्य विशेषताएं',
      builtFor: 'व्यक्तियों और प्रशासकों दोनों के लिए बनाया गया।',
      impactFocus: 'प्रभाव फोकस',
      measurable: 'खोज से डिलीवरी तक, मापने योग्य परिणामों के साथ।',
      whoServes: 'किसके लिए उपयोगी',
      earlyAccess: 'अर्ली एक्सेस पाएं',
    }
    : language === 'ta'
      ? {
        heroTitle1: 'India Post க்கு நிதி வழிகாட்டல்,',
        heroTitle2: 'ஒவ்வொரு சமூகத்துக்கும் தனிப்பயன்.',
        heroDesc: 'Yojana Sahayak மக்கள் தொகை, விவசாய சுழற்சி, உள்ளூர் காரணிகளை வைத்து சரியான திட்டங்களை பரிந்துரைக்கிறது.',
        requestDemo: 'டெமோ கோரிக்கை',
        exploreMission: 'பணியை அறிக',
        jumpTo: 'செல்லவும்',
        keyFeatures: 'முக்கிய அம்சங்கள்',
        builtFor: 'தனிநபர்களுக்கும் நிர்வாகிகளுக்கும் வடிவமைக்கப்பட்டது.',
        impactFocus: 'தாக்கம் கவனம்',
        measurable: 'தேடுதல் முதல் நிறைவேற்றம் வரை அளவிடக்கூடிய முடிவுகள்.',
        whoServes: 'யாருக்கு பயன்படும்',
        earlyAccess: 'முன்கூட்டியே அணுகல் பெறுங்கள்',
      }
      : language === 'te'
        ? {
          heroTitle1: 'India Post కోసం ఆర్థిక మార్గదర్శకం,',
          heroTitle2: 'ప్రతి సముదాయానికి వ్యక్తిగతీకరించి.',
          heroDesc: 'Yojana Sahayak జనసాంఖ్యికం, వ్యవసాయ చక్రాలు, స్థానిక అంశాల ఆధారంగా సరైన పథకాలను సూచిస్తుంది.',
          requestDemo: 'డెమో కోరండి',
          exploreMission: 'మిషన్ తెలుసుకోండి',
          jumpTo: 'ఇక్కడికి వెళ్లండి',
          keyFeatures: 'ప్రధాన లక్షణాలు',
          builtFor: 'వ్యక్తులు మరియు పరిపాలకుల కోసం రూపొందించబడింది.',
          impactFocus: 'ప్రభావ దృష్టి',
          measurable: 'గుర్తింపు నుంచి అమలు వరకు కొలిచే ఫలితాలు.',
          whoServes: 'ఎవరికి ఉపయోగం',
          earlyAccess: 'ముందస్తు యాక్సెస్ పొందండి',
        }
    : {
      heroTitle1: 'Financial guidance for India Post,',
      heroTitle2: 'personalized to every community.',
      heroDesc: 'Yojana Sahayak identifies financial needs using demographic signals, farming cycles, and local economic factors so citizens and administrators can act with confidence.',
      requestDemo: 'Request a demo',
      exploreMission: 'Explore the mission',
      jumpTo: 'Jump to',
      keyFeatures: 'Key Features',
      builtFor: 'Built to serve individuals and administrators alike.',
      impactFocus: 'Impact Focus',
      measurable: 'From discovery to delivery, with measurable outcomes.',
      whoServes: 'Who it serves',
      earlyAccess: 'Get early access',
    };

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <section className="relative overflow-hidden pt-28 pb-20" id="overview">
        <div className="absolute inset-0 bg-linear-to-br from-amber-50 via-white to-emerald-50 dark:from-amber-950/30 dark:via-background dark:to-emerald-950/30" />
        <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="container relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 shadow-sm dark:border-amber-500/30 dark:bg-background/60 dark:text-amber-300">
              <Percent className="h-3.5 w-3.5" />
              Yojana Sahayak
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              {text.heroTitle1}
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-amber-600 via-orange-500 to-emerald-600">
                {text.heroTitle2}
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              {text.heroDesc}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {signalPills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-border/60 bg-card/70 px-4 py-1 text-sm font-medium text-foreground/80 shadow-sm"
                >
                  {pill}
                </span>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5"
              >
                {text.requestDemo}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/70 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-white"
              >
                {text.exploreMission}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              <span className="rounded-full border border-border/60 bg-card/80 px-4 py-2">
                {text.jumpTo}
              </span>
              {[
                { href: "/yojana-sahayak#recommender", label: "Recommender" },
                { href: "/yojana-sahayak#region", label: "Region" },
                { href: "/yojana-sahayak#loan", label: "Loan" },
                { href: "/yojana-sahayak#admin", label: "Admin" },
                { href: "/yojana-sahayak#visuals", label: "Visuals" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-border/60 bg-white/70 px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20" id="recommender">
        <div className="container">
          <YojanaInteractive />
        </div>
      </section>

      <section className="relative py-20" id="features">
        <div className="container">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                {text.keyFeatures}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                {text.builtFor}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Every recommendation is transparent, measurable, and aligned to
                regional priorities.
              </p>
            </div>
            <div className="rounded-3xl border border-border/60 bg-card/80 px-6 py-4 text-sm text-muted-foreground shadow-sm">
              Designed for National, State, and District workflows.
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-4xl border border-border/60 bg-card p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className={`absolute inset-0 bg-linear-to-br ${feature.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="relative mt-6 text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="relative mt-3 text-base text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 bg-secondary/5" id="impact">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
                {text.impactFocus}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
                {text.measurable}
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Yojana Sahayak brings predictive analytics to scheme planning,
                making targets easier to set and progress simpler to explain.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "Benefit prediction by household profile",
                  "Regional prioritization based on seasonal cycles",
                  "Loan readiness scoring for farmers",
                  "Success-rate projections for every scheme",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-border/60 bg-white/70 p-4 text-sm text-foreground shadow-sm"
                  >
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2.5rem] border border-border/60 bg-linear-to-br from-emerald-500/10 via-white to-amber-500/10 p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-foreground">{text.whoServes}</h3>
              <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground">Individuals</p>
                  <p>
                    Clear scheme matches, benefit percentages, and loan
                    eligibility guidance.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Administrators</p>
                  <p>
                    Target tracking, regional insights, and impact
                    visualization for policy planning.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Field Officers</p>
                  <p>
                    Actionable briefs for outreach based on local priorities.
                  </p>
                </div>
              </div>
              <Link
                href="/signup"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
              >
                {text.earlyAccess}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
