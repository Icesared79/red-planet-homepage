/** One parcel in Hartford, CT and the five filings the county site no longer shows. */
const FILINGS: Array<[string, string]> = [
  ["May 2025", "Tax lien filed"],
  ["Oct 2025", "Tax lien released"],
  ["Jan 2026", "Lis pendens filed"],
  ["Jun 2026", "Foreclosure case withdrawn"],
  ["Sep 2026", "Deed transfer to new owner"],
];

/**
 * RECORDS-6: all five filings are on screen from the first paint.
 *
 * This card used to reveal its rows on the shared 2.8s tick, one more each
 * tick in a 7-tick cycle (1, 2, 3, 4, 5, 5, 5). The rows it had not reached
 * were held in the layout at opacity 0, so for most of the cycle the card was
 * a titled panel headed "One parcel, five county filings" showing one or two
 * of them above a block of empty space -- and the card's own footer, "The
 * county site now shows only the latest filing. Atlas still holds all five",
 * described something the reader could not yet see.
 *
 * The resting state the cycle ended on is the honest one and is now the only
 * one: five filings, the latest marked Showing on the county site, the four
 * before it Removed, and every one of them Stored by Atlas. That is exactly
 * what the component already rendered for a reader who prefers reduced
 * motion, so nothing here is new -- it is the same frame, shown to everyone.
 * With no tick left to read this is a server component again.
 */
export function WhyDifferent() {
  const last = FILINGS.length - 1;

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
            const current = i === last;
            return (
              <div
                key={date}
                className={`rph-parcel__row rph-parcel__row--body${
                  current ? " rph-parcel__row--last" : ""
                }`}
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
                <span className="rph-parcel__atlas">Stored</span>
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
