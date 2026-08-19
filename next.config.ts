import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Сайт домен-агностичен: подпапка mainexperts.online/tests, поддомен или
  // отдельный домен — задаётся при деплое через BASE_PATH / SITE_URL.
  basePath: process.env.BASE_PATH || "",
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
  ],
};

export default nextConfig;
