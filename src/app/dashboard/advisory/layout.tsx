import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Crop & Soil Advisory | SmartAgriSense',
    description: 'Get personalized, AI-driven crop and soil advisory. Detailed fertilizer recommendations, irrigation guidelines, and pest alerts tailored for Indian farmers.',
    keywords: 'farming advisory, soil health, crop management, Indian agriculture AI, fertilizer schedule, smart farming',
    openGraph: {
        title: 'Crop & Soil Advisory | SmartAgriSense',
        description: 'Get personalized, AI-driven crop and soil advisory tailored for Indian farmers.',
    }
};

export default function AdvisoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
