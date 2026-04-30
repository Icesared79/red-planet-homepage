import { Approach } from "@/components/Approach";
import { BuiltFor } from "@/components/BuiltFor";
import { FinalCTA } from "@/components/FinalCTA";
import { Hero } from "@/components/Hero";
import { PullQuote } from "@/components/PullQuote";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ThesisBar } from "@/components/ThesisBar";
import { WhatWeSee } from "@/components/WhatWeSee";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <Hero />
        <ThesisBar />
        <WhatWeSee />
        <PullQuote />
        <BuiltFor />
        <Approach />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}
