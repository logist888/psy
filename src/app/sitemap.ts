export const dynamic = "force-static";

import type { MetadataRoute } from "next";
import { getAllTests, getAllConstructs, CATEGORY_PAGES, COLLECTIONS } from "@/lib/content";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const tests = getAllTests();
  const constructs = getAllConstructs();
  const staticPages = ["", "/tests", "/methods", "/constructs", "/psihologam", "/about", "/privacy", "/terms"];

  return [
    ...staticPages.map((path) => ({
      url: `${SITE.url}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.6,
    })),
    ...Object.values(CATEGORY_PAGES).map((page) => ({
      url: `${SITE.url}/kategorii/${page.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...COLLECTIONS.map((c) => ({
      url: `${SITE.url}/podborki/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...constructs.map((c) => ({
      url: `${SITE.url}/constructs/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...tests.flatMap((test) => [
      {
        url: `${SITE.url}/tests/${test.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.9,
      },
      {
        url: `${SITE.url}/methods/${test.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
    ]),
  ];
}
