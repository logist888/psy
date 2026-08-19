import Link from "next/link";
import type { Test } from "@/lib/engine/schema";

export default function RelatedTests({ tests, title = "Похожие тесты" }: { tests: Test[]; title?: string }) {
  if (!tests.length) return null;
  return (
    <section>
      <h2>{title}</h2>
      <div className="grid">
        {tests.map((test) => (
          <Link key={test.slug} href={`/tests/${test.slug}`} className="card">
            <h3>{test.title}</h3>
            <p className="small muted" style={{ margin: 0 }}>
              {test.questions.length} утверждений · {test.minutes} мин
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
