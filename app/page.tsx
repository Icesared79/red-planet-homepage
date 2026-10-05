import { BuiltOnAtlas } from "@/components/BuiltOnAtlas";
import { ContactDialog } from "@/components/ContactDialog";
import { Coverage } from "@/components/Coverage";
import { GetInTouch } from "@/components/GetInTouch";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { LegalFooter } from "@/components/LegalFooter";
import { MissionControl } from "@/components/MissionControl";
import { WhyDifferent } from "@/components/WhyDifferent";
import { formatRelative } from "@/lib/relative-format";
import {
  getRecordHistory,
  getRecordStats,
  RECORD_STATS_REVALIDATE,
} from "@/lib/record-stats";

/**
 * NO STATIC FALLBACK, deliberately. The old page carried
 * `FALLBACK_TOTAL = 502392645` and showed it whenever the live read failed,
 * which means a public page could publish a number nobody had measured, with
 * nothing on screen to say so.
 *
 * Instead the render THROWS when the figures are unavailable. Next then keeps
 * serving the last successfully generated page -- real numbers, honestly
 * stale, with the card's own "N ago" label growing to say exactly how stale --
 * rather than replacing them with an invented pair. A build with no previous
 * page to fall back on fails loudly, which is the correct signal.
 */

// Without a route-level revalidate Next statically generates this page once at
// build time and never re-renders it, freezing whatever the first render read.
// 300s matches lib/record-stats.ts, so the card picks up each nightly ingest
// within five minutes of the counts being recomputed.
export const revalidate = RECORD_STATS_REVALIDATE;

export default async function HomePage() {
  const [stats, history] = await Promise.all([
    getRecordStats(),
    getRecordHistory(),
  ]);

  if (!stats) {
    throw new Error(
      "atlas_public_record_stats unavailable - keeping the last good render " +
        "rather than publishing placeholder record counts"
    );
  }

  // Computed on the server from the real data timestamp so the first paint
  // shows the true freshness instead of a hard-coded placeholder.
  const relInitial = formatRelative(stats.dataAsOf);
  const runRel = formatRelative(stats.latestIngestAt ?? stats.dataAsOf);

  return (
    <>
      <div className="rph-page">
        <Header />
        <main>
          <Hero
            total={stats.verifiedRecords}
            stored={stats.storedRecords}
            allTime={stats.totalRecords}
            latestIngest={stats.latestIngest}
            dataAsOf={stats.dataAsOf}
            relInitial={relInitial}
            history={history}
          />
          <MissionControl
            updatedIso={stats.latestIngestAt ?? stats.dataAsOf}
            relInitial={runRel}
          />
          <WhyDifferent />
          <HowItWorks />
          <BuiltOnAtlas />
          <Coverage />
        </main>
      </div>
      {/* Both are outside .rph-page so they run to the edges of the window
          instead of stopping at the 1560px column. Their content keeps the
          same column and gutters as every section above. */}
      <GetInTouch />
      <LegalFooter />
      <ContactDialog />
    </>
  );
}
