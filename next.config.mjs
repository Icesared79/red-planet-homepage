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
      { source: "/how-atlasland-works", destination: "/how-atlasland-works.html" },
      // LAND-5.3 (2026-10-23): the full coverage statement on its own route, built by the same script.
      { source: "/how-atlasland-works/coverage", destination: "/how-atlasland-works/coverage.html" },
      // LAND-6 (2026-10-23): the three other views, beside the company page and AtlasLand as tabs; same builder family.
      { source: "/how-atlascre-works", destination: "/how-atlascre-works.html" },
      { source: "/how-atlasprop-works", destination: "/how-atlasprop-works.html" },
      { source: "/how-atlastrade-works", destination: "/how-atlastrade-works.html" },
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
