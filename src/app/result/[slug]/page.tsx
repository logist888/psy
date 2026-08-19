import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllTests, getTest, getRelatedTests } from "@/lib/content";
import ResultView from "@/components/ResultView";

export function generateStaticParams() {
  return getAllTests().map((t) => ({ slug: t.slug }));
}

export const metadata: Metadata = {
  // Результаты персональные — в индексе им нечего делать.
  robots: { index: false, follow: false },
  title: "Ваш результат",
};

export default async function ResultPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const test = getTest(slug);
  if (!test) notFound();

  return (
    <Suspense fallback={<p className="muted">Считаем результат…</p>}>
      <ResultView test={test} related={getRelatedTests(test.slug)} />
    </Suspense>
  );
}
