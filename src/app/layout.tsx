import type { Metadata } from "next";
import Link from "next/link";
import { Golos_Text } from "next/font/google";
import { SITE, platformLink } from "@/lib/site";
import { Icon } from "@/components/icons";
import "./globals.css";

const golos = Golos_Text({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-golos",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s — ${SITE.name}` },
  description:
    "Психологические тесты с открытой методологией: что измеряет, откуда взято, чего не показывает. Бесплатно, анонимно, без регистрации.",
  robots: { index: true, follow: true },
};

const NAV = [
  { href: "/tests", label: "Все тесты" },
  { href: "/methods", label: "Разборы тем" },
  { href: "/about", label: "Наука" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const expertsHref = platformLink({ campaign: "nav", content: "experts" });
  return (
    <html lang="ru" className={golos.variable}>
      <body>
        <header className="site">
          <div className="wrap">
            <Link href="/" className="brand">
              <span className="mark"><Icon name="brand" size={22} /></span>
              <span className="word">Психотесты</span>
            </Link>
            <nav className="main">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href}>{n.label}</Link>
              ))}
              <a href={expertsHref}>Психологам</a>
            </nav>
            <div className="actions">
              <Link href="/tests" className="btn sm">Пройти тест</Link>
              <a className="avatar-btn" href={expertsHref} aria-label="Кабинет специалиста">
                <Icon name="user" size={20} />
              </a>
              <details className="m-nav">
                <summary className="avatar-btn burger" aria-label="Меню"><Icon name="menu" size={20} /></summary>
                <div className="m-panel">
                  {NAV.map((n) => (
                    <Link key={n.href} href={n.href}>{n.label}</Link>
                  ))}
                  <a href={expertsHref}>Психологам</a>
                </div>
              </details>
            </div>
          </div>
        </header>

        <main>
          <div className="wrap">{children}</div>
        </main>

        <footer className="site">
          <div className="wrap">
            <div className="f-links">
              <Link href="/tests">Все тесты</Link>
              <Link href="/privacy">Конфиденциальность</Link>
              <Link href="/terms">Условия</Link>
              <Link href="/about">Методология</Link>
              <a href={platformLink({ campaign: "footer", content: "expert" })}>Для специалистов</a>
            </div>
            <span className="faint small">© {SITE.name} · проект {SITE.platform.name}</span>
            <p className="f-note">
              Тесты на этом сайте — инструмент самонаблюдения и образования. Они не являются медицинской услугой,
              не ставят диагнозов и не заменяют консультацию специалиста.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
