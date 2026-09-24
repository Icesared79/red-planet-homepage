import { CTA } from "@/components/CTA";
import { ContactDialog } from "@/components/ContactDialog";
import { Coverage } from "@/components/Coverage";
import { Footer } from "@/components/Footer";
import { Foundation } from "@/components/Foundation";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { RecentFindings } from "@/components/RecentFindings";
import { Thesis } from "@/components/Thesis";
import { UseCases } from "@/components/UseCases";

// Hero, Foundation, and RecentFindings all read live Atlas data via
// getAtlasLive(). Without a route-level revalidate, Next statically
// generates this page once at build time and never re-renders it, freezing
// whatever getAtlasLive() returned at that build forever regardless of how
// the live data changes underneath it. Matches the 300s revalidate already
// on app/api/atlas-live/route.ts.
export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
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
