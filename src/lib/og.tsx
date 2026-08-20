import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SITE } from "./site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * ImageResponse рисует картинку собственным движком и системными шрифтами не
 * пользуется: без файла шрифта кириллица превращается в пустые прямоугольники.
 * Файлы лежат в assets/fonts — см. README рядом с ними.
 */
function font(name: string): Buffer {
  return fs.readFileSync(path.join(process.cwd(), "assets", "fonts", name));
}

/**
 * Карточка для мессенджеров и соцсетей. Ссылку на результат человек отправляет
 * другу (journey J2), и без превью она выглядит как случайный адрес — это
 * единственное место, где оформление напрямую влияет на воронку.
 */
export function ogCard({ title, subtitle }: { title: string; subtitle: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "64px 72px",
          fontFamily: "Liberation Sans",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 30, color: "#5b6472", letterSpacing: 1 }}>{SITE.name.toUpperCase()}</div>
          <div style={{ fontSize: title.length > 46 ? 62 : 74, fontWeight: 700, color: "#12151a", lineHeight: 1.15 }}>
            {title}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ height: 6, width: 160, background: "#2f6f4f" }} />
          <div style={{ fontSize: 32, color: "#5b6472" }}>{subtitle}</div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Liberation Sans", data: font("LiberationSans-Regular.ttf"), weight: 400, style: "normal" },
        { name: "Liberation Sans", data: font("LiberationSans-Bold.ttf"), weight: 700, style: "normal" },
      ],
    }
  );
}
