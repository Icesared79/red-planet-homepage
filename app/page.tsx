import { BuiltOnAtlas } from "@/components/BuiltOnAtlas";
import { ContactDialog } from "@/components/ContactDialog";
import { Coverage } from "@/components/Coverage";
import { GetInTouch } from "@/components/GetInTouch";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { MissionControl } from "@/components/MissionControl";
import { WhyDifferent } from "@/components/WhyDifferent";
import { getAtlasLive } from "@/lib/atlas-live";

/** The design's static fallback when the live figure is unavailable. */
const FALLBACK_TOTAL = 502392645;

// The hero count and both "updated" timestamps read live Atlas data. Without a
// route-level revalidate, Next statically generates this page once at build
// time and never re-renders it, freezing whatever getAtlasLive() returned at
// that build. Matches the 300s revalidate on app/api/atlas-live/route.ts.
export const revalidate = 300;

export default async function HomePage() {
  const live = await getAtlasLive().catch(() => null);
  const total = live?.total_records ?? FALLBACK_TOTAL;
  const updatedIso = live?.last_updated ?? null;

  return (
    <div className="rph-page">
      <Header />
      <main>
        <Hero total={total} updatedIso={updatedIso} />
        <MissionControl updatedIso={updatedIso} />
        <WhyDifferent />
        <HowItWorks />
        <BuiltOnAtlas />
        <Coverage />
        <GetInTouch />
      </main>
      <ContactDialog />
    </div>
  );
}
