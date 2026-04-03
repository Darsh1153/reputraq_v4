import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { TheChallenge } from "@/components/the-challenge";
import { TheReputraqSolution } from "@/components/the-reputraq-solution";
import { Features } from "@/components/features";
import { HowReputraqWorks } from "@/components/how-reputraq-works";
import { UseCases } from "@/components/use-cases";
import { Pricing } from "@/components/pricing";
import { FAQ } from "@/components/faq";
import { FinalCTA } from "@/components/final-cta";
import { Footer } from "@/components/footer";
import { ScrollProgress } from "@/components/scroll-progress";
import { FloatingActionButton } from "@/components/floating-action-button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      <ScrollProgress />
      <Navbar />
      <HeroSection />
      <TheChallenge />
      <TheReputraqSolution />
      <Features />
      <HowReputraqWorks />
      <UseCases />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
      <FloatingActionButton />
    </div>
  );
}