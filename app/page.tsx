import { CTA } from "@/components/CTA";
import { ContactDialog } from "@/components/ContactDialog";
import { Coverage } from "@/components/Coverage";
import { Footer } from "@/components/Footer";
import { Foundation } from "@/components/Foundation";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { LiveStatus } from "@/components/LiveStatus";
import { RecentFindings } from "@/components/RecentFindings";
import { Thesis } from "@/components/Thesis";
import { UseCases } from "@/components/UseCases";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <LiveStatus />
        <Thesis />
        <UseCases />
        <Foundation />
        <RecentFindings />
        <Coverage />
        <CTA />
      </main>
      <Footer />
      <ContactDialog />
    </>
  );
}
