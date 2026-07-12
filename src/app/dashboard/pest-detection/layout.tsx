import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pest & Disease Detection | SmartAgriSense',
    description: 'Use our AI to instantly identify plant diseases and pests like Tomato Blight or Fall Armyworm. Get chemical and organic treatment plans in Hindi, Tamil, Telugu, and English.',
    keywords: 'Tomato blight treatment in Hindi, plant disease scanner, crop pest detection, farming AI, agricultural advisory, fall armyworm treatment',
    openGraph: {
        title: 'Pest & Disease Detection | SmartAgriSense',
        description: 'Upload a picture of your crop to instantly identify diseases and get expert treatment plans.',
    }
};

export default function PestDetectionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
