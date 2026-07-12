import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Farming Voice Assistant | SmartAgriSense',
    description: 'Speak or type your farming questions in Hindi, Tamil, Telugu, or English. Get instant, expert advice on crops, weather, and market prices.',
    keywords: 'farming chatbot, agricultural voice assistant, krishi mitra, AI for farmers, farming questions in Hindi',
    openGraph: {
        title: 'Farming Voice Assistant | SmartAgriSense',
        description: 'Speak your farming questions and get instant expert advice in your language.',
    }
};

export default function VoiceAssistantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
