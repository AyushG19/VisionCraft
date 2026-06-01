/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/common"],

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    optimizePackageImports: ["@repo/ui", "@repo/common"], // Automatically "tree-shakes" your UI library
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_HTTP_BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
