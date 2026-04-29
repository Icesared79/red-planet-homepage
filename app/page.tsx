import { Container } from "@/components/Container";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SwatchGrid } from "@/components/SwatchGrid";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="top" className="min-h-screen bg-bg-base">
        <Container className="py-16 md:py-24">
          <SwatchGrid />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
