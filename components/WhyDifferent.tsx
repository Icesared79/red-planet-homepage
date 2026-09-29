"use client";

import { useSharedTick } from "@/lib/tick";

/** One parcel in Hartford, CT and the five filings the county site no longer shows. */
const FILINGS: Array<[string, string]> = [
  ["May 2025", "Tax lien filed"],
  ["Oct 2025", "Tax lien released"],
  ["Jan 2026", "Lis pendens filed"],
  ["Jun 2026", "Foreclosure case withdrawn"],
  ["Sep 2026", "Deed transfer to new owner"],
];

export function WhyDifferent() {
  const { tick, motion } = useSharedTick();
  // A 7-tick cycle showing 1, 2, 3, 4, 5, 5, 5 rows.
  const visible = motion ? Math.min((tick % 7) + 1, FILINGS.length) : FILINGS.length;

  return (
    <section id="different" className="rph-band rph-band--sage">
      <div className="rph-split">
        <div>
          <div className="rph-kicker rph-kicker--sage">
            &sect; 03 &mdash; Why it&rsquo;s different
          </div>
          <h2 className="rph-h2 rph-split__h2">
            Much of what Atlas captures cannot be collected again.
          </h2>
          <p className="rph-intro rph-intro--sage rph-split__body">
            Most county and city sources show only the current version of a
            record and overwrite or remove older ones. Atlas captures them every
            night and keeps each version, so a company that starts collecting
            today cannot recover the history Atlas already holds.
          </p>
        </div>

        <div className="rph-parcel">
          <div className="rph-parcel__head">
            <span className="rph-parcel__title">
              One parcel, five county filings
            </span>
            <span className="rph-parcel__where">Example &middot; Hartford, CT</span>
          </div>
          <div className="rph-parcel__note">
            Each filing was published on the county site and captured by Atlas
            the night it appeared.
          </div>

          <div className="rph-parcel__row rph-parcel__row--head">
            <span>Filed</span>
            <span>County filing</span>
            <span>County site</span>
            <span>Atlas</span>
          </div>

          {FILINGS.map(([date, text], i) => {
            const shown = i < visible;
            const current = i === visible - 1;
            return (
              <div
                key={date}
                className={`rph-parcel__row rph-parcel__row--body${
                  i === FILINGS.length - 1 ? " rph-parcel__row--last" : ""
                }`}
                style={{
                  opacity: shown ? 1 : 0,
                  transform: shown ? "translateY(0)" : "translateY(6px)",
                }}
              >
                <span className="rph-parcel__date">{date}</span>
                <span className="rph-parcel__text">{text}</span>
                <span
                  className={`rph-parcel__county${
                    current ? "" : " rph-parcel__county--gone"
                  }`}
                >
                  {current ? "Showing" : "Removed"}
                </span>
                <span
                  className="rph-parcel__atlas"
                  style={{ opacity: shown ? 1 : 0 }}
                >
                  Stored
                </span>
              </div>
            );
          })}

          <div className="rph-parcel__foot">
            The county site now shows only the latest filing. Atlas still holds
            all five.
          </div>
        </div>
      </div>
    </section>
  );
}
