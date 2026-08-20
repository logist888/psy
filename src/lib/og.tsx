import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SITE } from "./site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * ImageResponse рисует картинку собственным движком и системными шрифтами не
 * пользуется: без файла шрифта кириллица превращается в пустые прямоугольники.
 * Берём то же начертание, что и сайт, — карточка должна выглядеть его частью.
 */
/**
 * Движок картинок не понимает woff2 и вариативные оси, поэтому рядом с
 * вариативным файлом сайта лежат два статических начертания — они участвуют
 * только в сборке карточек и посетителю не отдаются.
 */
function font(weight: 400 | 700): Buffer {
  return fs.readFileSync(path.join(process.cwd(), "src", "fonts", `golos-${weight}.ttf`));
}

/**
 * Карточка для мессенджеров и соцсетей. Ссылку на результат человек отправляет
 * другу (journey J2), и без превью она выглядит как случайный адрес — это
 * единственное место, где оформление напрямую влияет на воронку.
 */
/** djb2 — как в Motif: рисунок карточки выводится из слага и не меняется между сборками. */
function bars(seed: string, count: number): number[] {
  let h = 5381;
  for (let i = 0; i < seed.length; i += 1) h = ((h << 5) + h + seed.charCodeAt(i)) >>> 0;
  let state = h || 1;
  return Array.from({ length: count }, () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return 0.3 + (state % 1000) / 1000 * 0.7;
  });
}

/**
 * Карточка для мессенджеров и соцсетей. Ссылку на результат человек отправляет
 * другу (journey J2), и без превью она выглядит как случайный адрес — это
 * единственное место, где оформление напрямую влияет на воронку.
 *
 * Рисунок — тот же профиль по шкалам, что в шапке разделов и на иконке сайта:
 * карточка должна узнаваться до того, как её прочитают.
 */
export function ogCard({ title, subtitle, seed = "psytests" }: { title: string; subtitle: string; seed?: string }) {
  const paper = "#fdfcfa";
  const ink = "#1c1a20";
  const muted = "#5a545f";
  const accent = "#6d2f5b";
  const rows = bars(seed, 6);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          background: paper,
          fontFamily: "Golos Text",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            padding: "64px 0 64px 72px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <div style={{ fontSize: 27, color: muted, letterSpacing: 3, fontWeight: 500 }}>
              {SITE.name.toUpperCase()}
            </div>
            <div
              style={{
                fontSize: title.length > 44 ? 60 : 72,
                fontWeight: 700,
                color: ink,
                lineHeight: 1.12,
                letterSpacing: -1.5,
                maxWidth: 740,
              }}
            >
              {title}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ height: 5, width: 132, background: accent, borderRadius: 3 }} />
            <div style={{ fontSize: 30, color: muted }}>{subtitle}</div>
          </div>
        </div>

        {/* Профиль по шкалам: полосы упираются в правый край, как в результате */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 18,
            width: 300,
            paddingRight: 72,
          }}
        >
          {rows.map((share, i) => (
            <div
              key={i}
              style={{
                height: 16,
                width: Math.round(228 * share),
                borderRadius: 8,
                background: accent,
                opacity: 0.92 - i * 0.11,
              }}
            />
          ))}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Golos Text", data: font(400), weight: 400, style: "normal" },
        { name: "Golos Text", data: font(700), weight: 700, style: "normal" },
      ],
    }
  );
}
