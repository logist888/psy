import type { NextConfig } from "next";

/**
 * Сайт домен-агностичен: цель — подпапка mainexperts.online/tests, но сборка
 * должна поддерживать и статический хостинг (GitHub Pages для превью).
 * BASE_PATH задаёт префикс пути, EXPORT=1 включает статический экспорт.
 */
const isExport = process.env.EXPORT === "1";
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  basePath,
  output: isExport ? "export" : undefined,
  // Статический хостинг отдаёт каталоги: /tests/burnout/ вместо /tests/burnout
  trailingSlash: isExport,
  images: { unoptimized: isExport },
  headers: isExport
    ? undefined
    : async () => [
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
