import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Terms of Use | Red Planet Data",
  description:
    "The terms on which Red Planet Data makes redplanetdata.com available.",
};

export default function TermsPage() {
  return (
    <>
      <div className="rph-page">
        <Header variant="page" />
        <main className="rph-doc">
          <div className="rph-doc__inner">
            <h1>Terms of Use</h1>
            <p className="rph-doc__lede">
              These terms govern your use of redplanetdata.com. Using the site
              means you accept them.
            </p>
            <p className="rph-doc__updated">Last updated September 2026</p>

            <h2>What this site is</h2>
            <p>
              This site describes Red Planet Data, Atlas and the platforms built
              on Atlas. It is informational. Nothing on it is an offer, and
              nothing on it creates an agreement to supply records, access or
              services.
            </p>

            <h2>Access to the platforms</h2>
            <p>
              Access to Atlas, TeleAcre or Signal is granted under a separate
              written agreement. Where these terms and that agreement differ,
              that agreement governs the access it grants.
            </p>

            <h2>The figures shown here</h2>
            <p>
              Counts, coverage and timings on this site are drawn from our own
              systems and change as the engine runs. They describe the state of
              those systems at the time the page was generated. They are given
              for information, are not a warranty of any particular coverage,
              completeness or currency, and should not be relied on as the sole
              basis for a decision.
            </p>

            <h2>Not advice</h2>
            <p>
              Records and analysis described here and supplied through our
              platforms are business information. They are not legal, financial,
              title, appraisal, tax or investment advice, and they are not a
              title search, a title report or a consumer report. Nothing here is
              intended to be used to establish anyone&rsquo;s eligibility for
              credit, insurance, employment, housing or any other purpose
              governed by consumer reporting law.
            </p>

            <h2>Ownership</h2>
            <p>
              The site, its text, design, code and arrangement are owned by Red
              Planet Data or its licensors and are protected by copyright and
              other laws. Red Planet, Red Planet Data, Atlas, TeleAcre and
              Signal are our trademarks. Nothing here grants you a licence to
              use them.
            </p>

            <h2>What you may not do</h2>
            <ul>
              <li>
                Scrape, crawl, harvest or otherwise extract this site by
                automated means, or attempt to reconstruct any dataset behind
                it.
              </li>
              <li>
                Copy, republish or redistribute substantial parts of the site
                without our written permission.
              </li>
              <li>
                Interfere with the site&rsquo;s operation or security, probe it
                for vulnerabilities without our written permission, or place an
                unreasonable load on it.
              </li>
              <li>
                Use the site or anything obtained from it in a way that breaks
                the law or infringes anyone&rsquo;s rights.
              </li>
            </ul>
            <p>
              Ordinary indexing by a search engine that respects our robots
              directives is permitted.
            </p>

            <h2>What you send us</h2>
            <p>
              Send us only information you are entitled to share. You keep
              ownership of what you send through the contact form, and you give
              us permission to read it, store it and reply to it. How we handle
              it is set out in our{" "}
              <a href="/privacy">Privacy Policy</a>.
            </p>

            <h2>Other sites</h2>
            <p>
              This site links to sites we do not control, including our
              documentation and our platforms. We are not responsible for their
              content or their practices, and a link is not an endorsement.
            </p>

            <h2>Availability</h2>
            <p>
              We may change, suspend or withdraw any part of this site at any
              time, and we do not promise it will be available without
              interruption.
            </p>

            <h2>No warranty</h2>
            <p>
              The site is provided as it is and as available. To the fullest
              extent the law allows, we make no warranties of any kind about it,
              express or implied, including any implied warranty of
              merchantability, fitness for a particular purpose, accuracy or
              non-infringement.
            </p>

            <h2>Limitation of liability</h2>
            <p>
              To the fullest extent the law allows, Red Planet Data is not
              liable for any indirect, incidental, special, consequential or
              punitive damages, or for any lost profits, revenue, data or
              business, arising out of your use of this site, even if we have
              been told such damages are possible. Nothing in these terms limits
              liability that cannot be limited by law.
            </p>

            <h2>Changes</h2>
            <p>
              We may revise these terms. The date above shows when they were
              last revised, and using the site after a revision means you accept
              it.
            </p>

            <h2>Contact</h2>
            <p>
              Questions about these terms go to{" "}
              <a href="mailto:hello@redplanetdata.com">
                hello@redplanetdata.com
              </a>
              .
            </p>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
