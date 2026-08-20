import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllTests, getTest } from "@/lib/content";
import TestRunner from "@/components/TestRunner";
import { Icon } from "@/components/icons";

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
      <div className="crumbs">
        <Link href={`/tests/${test.slug}`}><Icon name="arrow-left" size={15} /> {test.title}</Link>
      </div>
      <h1 style={{ fontSize: 30, marginBottom: 12 }}>{test.title}</h1>
      <div className="note info" style={{ marginBottom: 22 }}>{test.instruction}</div>
      <TestRunner test={test} />
      <p className="small faint" style={{ marginTop: 26, textAlign: "center" }}>
        Ответы не отправляются на сервер и не сохраняются: результат посчитается и будет доступен только по вашей ссылке.
      </p>
    </>
  );
}
