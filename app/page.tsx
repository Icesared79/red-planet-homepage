import { AnswerSection } from "@/components/AnswerSection";
import { ApiArtifactSection } from "@/components/ApiArtifactSection";
import { ApplySection } from "@/components/ApplySection";
import { EngineSection } from "@/components/EngineSection";
import { Hero } from "@/components/Hero";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <Hero />
        <AnswerSection />
        <ApiArtifactSection />
        <EngineSection />
        <ApplySection />
      </main>
      <SiteFooter />
    </>
  );
}
