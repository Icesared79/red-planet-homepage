import type { Metadata } from "next";
// The shared Red Planet design layer: tokens, type scale, spacing, components.
// See design-system/red-planet/readme.md. Loaded before the site layer so
// app/globals.css can override its tokens.
import "@/design-system/red-planet/styles.css";
import "./globals.css";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        {/* Manrope (--font-sans) and Familjen Grotesk (the TeleAcre wordmark).
            The design system loads Geist and Fragment Mono itself. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&family=Familjen+Grotesk:wght@700&display=swap"
        />
        {/* Review-only motion override, read before first paint so there is no
            flash. A browser in a Remote Desktop session reports
            prefers-reduced-motion: reduce whatever the host is set to, so an
            animated page looks frozen to anyone reviewing it that way.
            ?motion=1 forces motion on for that page load, ?motion=0 forces it
            off. Without the parameter nothing is set and the page behaves
            exactly as it does for every visitor. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var m=new URL(location.href).searchParams.get("motion");' +
              'if(m==="1"){document.documentElement.setAttribute("data-motion","force");}' +
              'else if(m==="0"){document.documentElement.setAttribute("data-motion","reduce");}' +
              "}catch(e){}})();",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
