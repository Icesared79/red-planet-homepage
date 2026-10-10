import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/jobs/ApplicationForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  blocksToText,
  getPosting,
  renderDescription,
  JOBS_REVALIDATE,
  type Block,
  type Posting,
} from "@/lib/jobs";

export const revalidate = JOBS_REVALIDATE;

const SITE = "https://redplanetdata.com";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const posting = await getPosting(params.slug);
  if (!posting) return { title: "Jobs | Red Planet Data" };
  const title = `${posting.title} | Red Planet Data`;
  const description = `${posting.title} at Red Planet Data. ${posting.employmentType}, ${posting.locationText}.`;
  return {
    title,
    description,
    alternates: { canonical: `/jobs/${posting.slug}` },
    robots: posting.status === "open" ? undefined : { index: false },
    openGraph: {
      title,
      description,
      url: `${SITE}/jobs/${posting.slug}`,
      siteName: "Red Planet",
      images: [{ url: "/og-image.png", width: 1280, height: 640, alt: "Red Planet" }],
      type: "website",
    },
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** The description as the HTML string Google expects in JobPosting. */
function descriptionHtml(blocks: Block[]): string {
  return blocks
    .map((b) =>
      b.kind === "p"
        ? `<p>${escapeHtml(b.runs.map((r) => r.text).join(""))}</p>`
        : `<ul>${b.items
            .map((i) => `<li>${escapeHtml(i.map((r) => r.text).join(""))}</li>`)
            .join("")}</ul>`
    )
    .join("");
}

/**
 * schema.org JobPosting, so an open role is eligible for Google Jobs.
 *
 * Remote, United States applicants only, no salary. A CLOSED posting emits
 * nothing at all: structured data for a role nobody can apply to is exactly
 * what Google asks publishers to remove, so closing a posting in the database
 * removes it from here too, with no deploy.
 */
function jobPostingJsonLd(posting: Posting, blocks: Block[]) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: posting.title,
    description: descriptionHtml(blocks),
    datePosted: posting.postedAt.slice(0, 10),
    employmentType: posting.employmentType
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_"),
    hiringOrganization: {
      "@type": "Organization",
      name: "Red Planet Data",
      sameAs: SITE,
      logo: `${SITE}/og-image.png`,
    },
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: {
      "@type": "Country",
      name: "United States",
    },
    directApply: true,
    url: `${SITE}/jobs/${posting.slug}`,
    identifier: {
      "@type": "PropertyValue",
      name: "Red Planet Data",
      value: posting.slug,
    },
  };
}

function Runs({ runs }: { runs: { text: string; href?: string }[] }) {
  return (
    <>
      {runs.map((r, i) =>
        r.href ? (
          <a key={i} href={r.href} target="_blank" rel="noopener">
            {r.text}
          </a>
        ) : (
          <span key={i}>{r.text}</span>
        )
      )}
    </>
  );
}

export default async function PostingPage({ params }: Props) {
  const posting = await getPosting(params.slug);
  if (!posting) notFound();

  const { blocks } = await renderDescription(posting.description);
  const isOpen = posting.status === "open";

  return (
    <div className="rph-page">
      <Header variant="page" />
      <main className="rph-doc">
        <div className="rph-doc__inner">
          <p className="rph-jobs__back">
            <Link href="/jobs">&larr; All jobs</Link>
          </p>
          <h1>{posting.title}</h1>
          <p className="rph-jobs__facts">
            <span>{posting.locationText}</span>
            <span aria-hidden="true">&middot;</span>
            <span>{posting.employmentType}</span>
          </p>
          <p className="rph-doc__updated">
            {isOpen ? "Open position" : "This position is closed"}
          </p>

          {!isOpen ? (
            <div className="rph-jobs__closed">
              <p>
                This role has been filled or withdrawn and is no longer taking
                applications. Current openings are on the{" "}
                <Link href="/jobs">jobs page</Link>.
              </p>
            </div>
          ) : null}

          {blocks.map((b, i) =>
            b.kind === "p" ? (
              <p key={i}>
                <Runs runs={b.runs} />
              </p>
            ) : (
              <ul key={i}>
                {b.items.map((item, j) => (
                  <li key={j}>
                    <Runs runs={item} />
                  </li>
                ))}
              </ul>
            )
          )}

          {isOpen ? (
            <>
              <h2 id="apply">Apply</h2>
              <ApplicationForm
                slug={posting.slug}
                title={posting.title}
                questions={posting.questions}
              />
            </>
          ) : null}
        </div>
      </main>
      <Footer />

      {isOpen ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jobPostingJsonLd(posting, blocks)),
          }}
        />
      ) : null}
    </div>
  );
}
