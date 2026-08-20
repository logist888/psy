// Статическому экспорту нужен явный признак: у маршрута без параметров
// его неоткуда взять, как и у robots.ts с sitemap.ts
export const dynamic = "force-static";

import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { SITE } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = SITE.tagline;

export default function Image() {
  return ogCard({
    title: "Психологические тесты с открытой методологией",
    subtitle: "бесплатно, анонимно, без регистрации",
  });
}
