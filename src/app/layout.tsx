import type { Metadata } from "next";
import Link from "next/link";
import { SITE, platformLink } from "@/lib/site";
import Analytics from "@/components/Analytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s — ${SITE.name}` },
  description:
    "Психологические тесты с открытой методологией: что измеряет, откуда взято, чего не показывает. Бесплатно, анонимно, без регистрации.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <header className="site">
          <div className="wrap">
            <Link href="/" className="logo">
              {SITE.name}
            </Link>
            <nav>
              <Link href="/constructs">Темы</Link>
              <Link href="/methods">Методики</Link>
              <Link href="/my">Мои тесты</Link>
              <Link href="/about">О проекте</Link>
            </nav>
          </div>
        </header>
        <main>
          <div className="wrap">{children}</div>
        </main>
        <footer className="site">
          <div className="wrap">
            <p>
              <Link href="/privacy">Конфиденциальность</Link>
              <Link href="/terms">Условия</Link>
              <Link href="/about">Методология</Link>
              <a href={platformLink({ campaign: "footer", content: "expert" })}>Для специалистов</a>
            </p>
            <p className="small">
              Тесты на этом сайте — инструмент самонаблюдения и образования. Они не являются медицинской услугой,
              не ставят диагнозов и не заменяют консультацию специалиста.
            </p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
