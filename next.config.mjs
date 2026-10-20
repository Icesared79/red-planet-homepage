/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  // Unlisted standalone documents: served raw from public/ (no site layout),
  // linked from nowhere, noindex in the file itself.
  async rewrites() {
    return [
      { source: "/how-red-planet-works", destination: "/how-red-planet-works.html" },
    ];
  },
  // COUNTY-10 (2026-10-20): /licensing is gone. Licenses are custom agreements built with each customer, not a
  // self-serve store, so the old address and anything under it go permanently to the homepage.
  async redirects() {
    return [
      { source: "/licensing", destination: "/", permanent: true },
      { source: "/licensing/:path*", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
