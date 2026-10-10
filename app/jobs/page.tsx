import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getOpenPostings, JOBS_REVALIDATE } from "@/lib/jobs";

// The permanent careers page. Postings are rows in public.job_postings, read at
// request time and re-read every JOBS_REVALIDATE seconds, so opening or closing
// a role is a database change and never a deploy.
export const revalidate = JOBS_REVALIDATE;

export const metadata: Metadata = {
  title: "Jobs | Red Planet Data",
  description:
    "Open positions at Red Planet Data, the company behind Atlas and the platforms built on it.",
  alternates: { canonical: "/jobs" },
  openGraph: {
    title: "Jobs | Red Planet Data",
    description:
      "Open positions at Red Planet Data, the company behind Atlas and the platforms built on it.",
    url: "https://redplanetdata.com/jobs",
    siteName: "Red Planet",
    images: [{ url: "/og-image.png", width: 1280, height: 640, alt: "Red Planet" }],
    type: "website",
  },
};

export default async function JobsPage() {
  const postings = await getOpenPostings();

  return (
    <div className="rph-page">
      <Header variant="page" />
      <main className="rph-doc">
        <div className="rph-doc__inner">
          <h1>Jobs</h1>
          <p className="rph-doc__lede">
            Red Planet Data builds and operates Atlas, a data engine that finds
            its own sources and checks every record against the original
            document, and the platforms built on it. Open positions are listed
            below.
          </p>
          <p className="rph-doc__updated">
            {postings.length === 1
              ? "1 open position"
              : `${postings.length} open positions`}
          </p>

          {postings.length === 0 ? (
            <div className="rph-jobs__empty">
              <p>
                There are no open positions right now. When a role opens it is
                posted on this page.
              </p>
              <p>
                If you think you should be working here anyway, write to{" "}
                <a href="mailto:hello@redplanetdata.com">
                  hello@redplanetdata.com
                </a>
                .
              </p>
            </div>
          ) : (
            <ul className="rph-jobs__list">
              {postings.map((p) => (
                <li key={p.slug} className="rph-jobs__item">
                  <Link href={`/jobs/${p.slug}`} className="rph-jobs__link">
                    <span className="rph-jobs__title">{p.title}</span>
                    <span className="rph-jobs__meta">
                      {p.locationText}
                      <span aria-hidden="true"> &middot; </span>
                      {p.employmentType}
                    </span>
                    <span className="rph-jobs__go">
                      Read the role and apply
                      <svg
                        width="14"
                        height="10"
                        viewBox="0 0 14 10"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M9 1L13 5L9 9M13 5H1"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
