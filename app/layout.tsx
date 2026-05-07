import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://redplanetdata.com"),
  title: "Red Planet | The verified foundation for property intelligence",
  description:
    "The verified foundation for property intelligence. Continuously refreshed. Built by us, used by anyone serious about real estate data.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  openGraph: {
    title: "Red Planet | The verified foundation for property intelligence",
    description:
      "The verified foundation for property intelligence. Continuously refreshed.",
    url: "https://redplanetdata.com",
    siteName: "Red Planet",
    images: [{ url: "/og-image.png", width: 1280, height: 640, alt: "Red Planet" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Red Planet | The verified foundation for property intelligence",
    description:
      "The verified foundation for property intelligence. Continuously refreshed.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
