"use client";
import LandingNavbar from "@/src/components/landing/LandingNavbar";
import HeroSection from "@/src/components/landing/HeroSection";
import FeaturesSection from "@/src/components/landing/FeaturesSection";
import HowItWorks from "@/src/components/landing/HowItWorks";
import Testimonials from "@/src/components/landing/Testimonials";
import Pricing from "@/src/components/landing/Pricing";
import LandingFooter from "@/src/components/landing/LandingFooter";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 scroll-smooth">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <LandingFooter />
    </main>
  );
}
