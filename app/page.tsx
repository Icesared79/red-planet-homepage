import { AnswerSection } from "@/components/AnswerSection";
import { ApiArtifactSection } from "@/components/ApiArtifactSection";
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
      </main>
      <SiteFooter />
    </>
  );
}
