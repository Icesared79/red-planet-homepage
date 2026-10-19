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
};

export default nextConfig;
