import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';
import AdvancedTech from '@/components/AdvancedTech';
import ImpactStats from '@/components/ImpactStats';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <ImpactStats />
      <Features />
      <AdvancedTech />
      <HowItWorks />
      <Footer />
    </main>
  );
}
