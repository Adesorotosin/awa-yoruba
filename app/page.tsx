import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/layout/HeroSection";
import HowItWorksSection from "@/components/layout/HowItWorksSection";
import ProgramsSection from "@/components/layout/ProgramsSection";
import ParentPartnershipSection from "@/components/layout/ParentPartnershipSection";
import TestimonialsSection from "@/components/layout/TestimonialsSection";
import TrialBookingSection from "@/components/layout/TrialBookingSection";
import FinalCtaSection from "@/components/layout/FinalCtaSection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <ProgramsSection />
      <ParentPartnershipSection />
      <TestimonialsSection />
      <TrialBookingSection />
      <FinalCtaSection />
      <Footer />
    </main>
  );
}