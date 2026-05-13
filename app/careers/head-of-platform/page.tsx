import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactDialog } from "@/components/ContactDialog";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { RoleDetail } from "@/components/careers/RoleDetail";
import { getRole } from "@/components/careers/roles";

const SLUG = "head-of-platform" as const;

export const metadata: Metadata = {
  title: "Head of Platform — Red Planet Careers",
  description:
    "Own Atlas and everything built on top of it. 2–3.5% equity, cash compensation at funding close.",
  alternates: { canonical: `/careers/${SLUG}` },
  openGraph: {
    title: "Head of Platform — Red Planet Careers",
    description:
      "Own Atlas and everything built on top of it. 2–3.5% equity, cash compensation at funding close.",
    url: `https://redplanetdata.com/careers/${SLUG}`,
    siteName: "Red Planet",
    images: [{ url: "/og-image.png", width: 1280, height: 640, alt: "Red Planet" }],
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Head of Platform — Red Planet Careers",
    description:
      "Own Atlas and everything built on top of it. 2–3.5% equity, cash compensation at funding close.",
    images: ["/og-image.png"],
  },
};

export default function Page() {
  const role = getRole(SLUG);
  if (!role) notFound();
  return (
    <>
      <Header />
      <RoleDetail role={role} />
      <Footer />
      <ContactDialog />
    </>
  );
}
