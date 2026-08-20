import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { SITE, platformLink } from "@/lib/site";
import Icon from "@/components/Icon";
import Analytics from "@/components/Analytics";
import "./globals.css";

/**
 * Golos Text — кириллическое лицо, а не латинское с дорисованной кириллицей.
 * next/font подставляет запасной шрифт с подогнанными метриками, поэтому при
 * подмене текст не прыгает.
 */
const golos = localFont({
  src: "../fonts/golos-text.woff2",
  display: "swap",
  weight: "400 900",
  variable: "--font-golos",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s — ${SITE.name}` },
  description:
    "Психологические тесты с открытой методологией: что измеряет, откуда взято, чего не показывает. Бесплатно, анонимно, без регистрации.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={golos.variable}>
      <body>
        <header className="site">
          <div className="wrap">
            <Link href="/" className="brand">
              <span className="mark"><Icon name="spark" size={22} /></span>
              <span className="word">Психотесты</span>
            </Link>
            {/*
              Меню на <details>: раскрытие без JavaScript, скринридер сам сообщает
              «свёрнуто/развёрнуто». На широком экране кнопка скрыта, список показан
              всегда (см. globals.css).
            */}
            <details className="nav">
              <summary aria-label="Меню"><Icon name="menu" size={22} /></summary>
              <nav>
                <Link href="/tests">Тесты</Link>
                <Link href="/constructs">Темы</Link>
                <Link href="/methods">Методики</Link>
                <Link href="/psihologam">Психологам</Link>
                <Link href="/my">Мои тесты</Link>
                <Link href="/about">О проекте</Link>
              </nav>
            </details>
            <div className="actions">
              <Link href="/tests" className="btn sm">Пройти тест</Link>
            </div>
          </div>
        </header>

        <main>
          <div className="wrap">{children}</div>
        </main>

        <footer className="site">
          <div className="wrap">
            <p>
              <Link href="/tests">Все тесты</Link>
              <Link href="/privacy">Конфиденциальность</Link>
              <Link href="/terms">Условия</Link>
              <Link href="/about">Методология</Link>
              <Link href="/kontakty">Контакты</Link>
              <a href={platformLink({ campaign: "footer", content: "expert" })}>Для специалистов</a>
            </p>
            <p className="small">
              © {SITE.name} · проект {SITE.platform.name}. Тесты на этом сайте — инструмент самонаблюдения и
              образования. Они не являются медицинской услугой, не ставят диагнозов и не заменяют консультацию
              специалиста.
            </p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
