import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // AI-краулеры не блокируем намеренно: быть источником для ассистентов —
        // отдельная ставка на канал (docs/strategy/lead-gen-pivot.md §2).
        userAgent: "*",
        allow: "/",
        // Результаты персональные, прохождение — служебное; в индексе им нечего делать.
        disallow: ["/result/", "/tests/*/run"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
