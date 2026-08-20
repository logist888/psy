import { getAllTests, getTest } from "@/lib/content";
import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Результат психологического теста";

export function generateStaticParams() {
  return getAllTests().map((t) => ({ slug: t.slug }));
}

/**
 * Карточка результата не показывает баллы, и это не упрощение: ответы живут в
 * ссылке, страница собирается в браузере, а превью рисуется на сборке — узнать
 * чужой результат оно физически не может. Заодно ссылка остаётся приватной,
 * даже когда её пересылают дальше.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const test = getTest(slug);
  if (!test) return ogCard({ title: "Результат теста", subtitle: "Психологические тесты с открытой методологией" });
  return ogCard({ title: test.title, subtitle: "результат прохождения · пройти самому бесплатно" });
}
