import { AnswerSection } from "@/components/AnswerSection";
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
      </main>
      <SiteFooter />
    </>
  );
}
