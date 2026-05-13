import type { Metadata } from "next";
import Link from "next/link";
import { ContactDialog } from "@/components/ContactDialog";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ROLES } from "@/components/careers/roles";

export const metadata: Metadata = {
  title: "Careers — Red Planet",
  description:
    "Red Planet is hiring a Head of Operations & Strategy and a Head of Platform. Equity-only pre-raise; cash compensation activates at funding close.",
  alternates: { canonical: "/careers" },
  openGraph: {
    title: "Careers — Red Planet",
    description:
      "Red Planet is hiring a Head of Operations & Strategy and a Head of Platform.",
    url: "https://redplanetdata.com/careers",
    siteName: "Red Planet",
    images: [{ url: "/og-image.png", width: 1280, height: 640, alt: "Red Planet" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers — Red Planet",
    description:
      "Red Planet is hiring a Head of Operations & Strategy and a Head of Platform.",
    images: ["/og-image.png"],
  },
};

export default function CareersIndexPage() {
  return (
    <>
      <Header />
      <main className="careers-page">
        <div className="careers-wrap">
          <div className="careers-eyebrow">Red Planet · Careers</div>
          <h1 className="careers-h1">Careers at Red Planet</h1>
          <p className="careers-intro">
            Red Planet builds Atlas — an autonomous data engine for real
            estate, finance, energy, and the industries connected to them — and
            the products built on top of it. We&apos;re a one-person team
            today, with a working platform in production, and we&apos;re hiring
            two senior people to help us turn it into a company. If you want
            context on what we actually do, that&apos;s on{" "}
            <a
              href="https://redplanetdata.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              redplanetdata.com
            </a>
            .
          </p>

          <div className="careers-section-label">Open roles</div>
          <div className="careers-roles">
            {ROLES.map((r) => (
              <Link
                key={r.slug}
                href={`/careers/${r.slug}`}
                className="careers-role-card"
              >
                <div className="careers-role-row">
                  <span className="careers-role-title">{r.title}</span>
                  <span className="careers-role-equity">
                    {r.equityRange} equity
                  </span>
                </div>
                <p className="careers-role-summary">{r.summary}</p>
                <span className="careers-role-link">
                  View role
                  <svg width="12" height="10" viewBox="0 0 14 10" fill="none">
                    <path
                      d="M9 1L13 5L9 9M13 5H1"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <ContactDialog />
    </>
  );
}
