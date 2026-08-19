"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, getCounterId, setConsent, track } from "@/lib/analytics";

/**
 * Счётчик подключается только после явного согласия: 152-ФЗ требует
 * информировать до начала обработки, а не после. Без согласия скрипт
 * не загружается вовсе — это не то же самое, что загрузить и не считать.
 */
export default function Analytics() {
  const [decided, setDecided] = useState<boolean | null>(null);
  const counterId = getCounterId();

  useEffect(() => {
    setDecided(getConsent());
  }, []);

  useEffect(() => {
    if (decided !== true || !counterId) return;
    if (window.ym) return;

    // Заглушка копит вызовы до загрузки tag.js — тот их разбирает при старте.
    const queue: unknown[][] = [];
    const stub = Object.assign(
      (...args: unknown[]) => {
        queue.push(args);
      },
      { a: queue, l: Date.now() }
    );
    window.ym = stub as unknown as NonNullable<Window["ym"]>;

    const script = document.createElement("script");
    script.src = "https://mc.yandex.ru/metrika/tag.js";
    script.async = true;
    document.head.appendChild(script);

    stub(counterId, "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      // webvisor намеренно выключен: запись экрана на страницах с ответами
      // о состоянии — это ровно те данные, которых мы не собираем.
      webvisor: false,
    });
  }, [decided, counterId]);

  function decide(granted: boolean) {
    setConsent(granted);
    setDecided(granted);
    if (granted) track({ name: "consent", granted: true });
  }

  // Баннер не показываем, если счётчика нет: спрашивать не о чем.
  if (!counterId || decided !== null) return null;

  return (
    <div className="consent" role="dialog" aria-label="Согласие на аналитику">
      <div className="wrap">
        <p className="small">
          Мы собираем обезличенную статистику посещений, чтобы понимать, какие тесты нужны. Ответы на тесты и
          результаты в статистику не попадают — мы их вообще не храним. Подробности в{" "}
          <Link href="/privacy">политике конфиденциальности</Link>.
        </p>
        <p className="actions">
          <button className="btn" onClick={() => decide(true)}>
            Согласен
          </button>
          <button className="btn secondary" onClick={() => decide(false)}>
            Только необходимое
          </button>
        </p>
      </div>
    </div>
  );
}
