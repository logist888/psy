import { getAllTests, getTest } from "@/lib/content";
import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Психологический тест с открытой методологией";

export function generateStaticParams() {
  return getAllTests().map((t) => ({ slug: t.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const test = getTest(slug);
  if (!test) return ogCard({ title: "Психологические тесты", subtitle: "бесплатно, без регистрации" });
  return ogCard({
    title: test.title,
    subtitle: `${test.questions.length} утверждений · ${test.minutes} мин · бесплатно, без регистрации`,
  });
}
