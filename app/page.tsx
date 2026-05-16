"use client";
import LandingNavbar from "@/src/components/landing/LandingNavbar";
import HeroSection from "@/src/components/landing/HeroSection";
import FeaturesSection from "@/src/components/landing/FeaturesSection";
import HowItWorks from "@/src/components/landing/HowItWorks";
import StatsBanner from "@/src/components/landing/StatsBanner";
import Testimonials from "@/src/components/landing/Testimonials";
import Pricing from "@/src/components/landing/Pricing";
import CtaBanner from "@/src/components/landing/CtaBanner";
import LandingFooter from "@/src/components/landing/LandingFooter";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 scroll-smooth">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <StatsBanner />
      <Testimonials />
      <Pricing />
      <CtaBanner />
      <LandingFooter />
    </main>
  );
}
