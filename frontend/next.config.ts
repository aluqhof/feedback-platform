import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Proxy same-origin: /api/backend/* → http://localhost:8080/*
   *
   * ADR-011: The frontend never calls the backend by absolute URL.
   * All API requests go through this proxy, keeping cookies same-origin
   * and avoiding CORS complexity for the dashboard.
   */
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "http://localhost:8080/:path*",
      },
    ];
  },
};

export default nextConfig;
