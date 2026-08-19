import type { MetadataRoute } from "next";
import { getAllTests } from "@/lib/content";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const tests = getAllTests();
  const staticPages = ["", "/methods", "/about", "/privacy", "/terms"];

  return [
    ...staticPages.map((path) => ({
      url: `${SITE.url}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.6,
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
