import Link from "next/link";
import type { Metadata } from "next";
import { getAllConstructs } from "@/lib/content";
import { SITE } from "@/lib/site";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Темы: разборы состояний и черт",
  description: "Что стоит за выгоранием, тревогой и самооценкой: как это устроено, чем отличается от похожего и что помогает.",
  alternates: { canonical: `${SITE.url}/constructs` },
};

export default function ConstructsPage() {
  const constructs = getAllConstructs();
  return (
    <>
      <Breadcrumbs items={[{ name: "Главная", href: "/" }, { name: "Темы", href: "/constructs" }]} />
      <h1>Темы</h1>
      <p className="lead">
        Разборы состояний, с которыми чаще всего приходят: как устроено, чем отличается от похожего, что помогает и
        когда пора к специалисту.
      </p>
      <div className="grid">
        {constructs.map((c) => (
          <Link key={c.slug} href={`/constructs/${c.slug}`} className="card">
            <h3>{c.title}</h3>
            <p className="small muted" style={{ margin: 0 }}>
              {c.tests.length} теста по теме
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
