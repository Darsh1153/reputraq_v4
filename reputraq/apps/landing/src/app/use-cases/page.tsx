import { Navbar } from "@/components/navbar";
import { UseCases } from "@/components/use-cases";
import { Footer } from "@/components/footer";
import { ScrollProgress } from "@/components/scroll-progress";
import { FloatingActionButton } from "@/components/floating-action-button";

export default function UseCasesPage() {
  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      <ScrollProgress />
      <Navbar />
      <UseCases standaloneLayout />
      <Footer />
      <FloatingActionButton />
    </div>
  );
}
