import type { Metadata } from "next";
import Link from "next/link";
import { ContactDialog } from "@/components/ContactDialog";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Application received — Red Planet Careers",
  description: "Thanks for applying to Red Planet.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/careers/thanks" },
};

export default function ThanksPage() {
  return (
    <>
      <Header />
      <main className="careers-page">
        <div className="careers-wrap">
          <div className="careers-eyebrow">Red Planet · Careers</div>
          <div className="careers-thanks">
            <h1>Application received.</h1>
            <p>
              We read every one and reply personally. Expect a response within
              a few days — sooner if it&apos;s a strong fit.
            </p>
            <Link href="/careers">
              <svg width="12" height="10" viewBox="0 0 14 10" fill="none">
                <path
                  d="M5 1L1 5L5 9M1 5H13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Back to careers
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <ContactDialog />
    </>
  );
}
