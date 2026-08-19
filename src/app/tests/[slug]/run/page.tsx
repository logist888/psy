import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllTests, getTest } from "@/lib/content";
import TestRunner from "@/components/TestRunner";

export function generateStaticParams() {
  return getAllTests().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const test = getTest(slug);
  // Страницы прохождения не индексируются: в выдаче должна быть карточка теста.
  return { title: test ? `${test.title} — прохождение` : undefined, robots: { index: false, follow: true } };
}

export default async function RunPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const test = getTest(slug);
  if (!test) notFound();

  return (
    <>
      <h1 style={{ fontSize: 22 }}>{test.title}</h1>
      <p className="muted">{test.instruction}</p>
      <TestRunner test={test} />
      <p className="small muted" style={{ marginTop: 28 }}>
        Ответы не отправляются на сервер и не сохраняются: результат посчитается и будет доступен только по вашей ссылке.
      </p>
    </>
  );
}
