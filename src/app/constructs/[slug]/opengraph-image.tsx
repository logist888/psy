import { getAllConstructs, getConstruct } from "@/lib/content";
import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Разбор темы";

export function generateStaticParams() {
  return getAllConstructs().map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const construct = getConstruct(slug);
  if (!construct) return ogCard({ title: "Разборы тем", subtitle: "Психологические тесты с открытой методологией" });
  return ogCard({
    title: construct.title,
    subtitle: `разбор темы · ${construct.tests.length} теста по теме`,
    seed: construct.slug,
  });
}
