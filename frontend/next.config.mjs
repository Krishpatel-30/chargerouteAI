/** @type {import('next').NextConfig} */
const backendUrl =
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000" : null);

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com"],
  },
  async rewrites() {
    if (!backendUrl) {
      return [];
    }
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: "/auth/:path*",
        destination: `${backendUrl}/api/v1/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
