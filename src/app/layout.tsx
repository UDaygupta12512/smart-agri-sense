import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import VoiceAssistant from "@/components/voice/VoiceAssistant";
import GoogleTranslate from "@/components/GoogleTranslate";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartAgriSense - AI Farming Assistant",
  description: "Empowering farmers with real-time AI advisory, weather updates, and market insights.",
  openGraph: {
    title: "SmartAgriSense - AI Farming Assistant",
    description: "Empowering farmers with real-time AI advisory, weather updates, and market insights.",
    url: "https://smart-agri-sense.vercel.app",
    siteName: "SmartAgriSense",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartAgriSense - AI Farming Assistant",
    description: "Empowering farmers with real-time AI advisory, weather updates, and market insights.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2E7D32" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AgriSense" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* Theme & language detection */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=JSON.parse(localStorage.getItem('appSettings'));var t=s&&s.theme;var l=(localStorage.getItem('appLanguage')||((s&&s.language)||'')).toLowerCase();if(l.startsWith('hi')||l.indexOf('हिंदी')>=0){document.documentElement.lang='hi'}else if(l.startsWith('mr')||l.indexOf('मराठी')>=0){document.documentElement.lang='mr'}else if(l.startsWith('ta')||l.indexOf('தமிழ்')>=0){document.documentElement.lang='ta'}else if(l.startsWith('te')||l.indexOf('తెలుగు')>=0){document.documentElement.lang='te'}else if(l.startsWith('kn')||l.indexOf('ಕನ್ನಡ')>=0){document.documentElement.lang='kn'}else if(l.startsWith('bn')||l.indexOf('বাংলা')>=0){document.documentElement.lang='bn'}else if(l.startsWith('pa')||l.indexOf('ਪੰਜਾਬੀ')>=0){document.documentElement.lang='pa'}else{document.documentElement.lang='en'}if(t==='Dark'){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark')}else if(t==='Light'){document.documentElement.setAttribute('data-theme','light')}else{if(window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark')}else{document.documentElement.setAttribute('data-theme','light')}}}catch(e){document.documentElement.setAttribute('data-theme','light');document.documentElement.lang='en'}})();`,
          }}
        />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').then(function(reg){console.log('[App] Service Worker registered, scope:',reg.scope)}).catch(function(err){console.warn('[App] Service Worker registration failed:',err)})})}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <VoiceAssistant />
        <GoogleTranslate />
      </body>
    </html>
  );
}
