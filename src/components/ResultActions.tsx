"use client";

import { useState } from "react";

/** Шеринг результата: у клинических тем — приватная отправка близкому, у типологии — обычный шеринг. */
export default function ResultActions({ url, sensitive }: { url: string; sensitive: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <p>
      <button className="btn secondary" onClick={copy}>
        {copied ? "Ссылка скопирована" : sensitive ? "Скопировать ссылку, чтобы показать близкому" : "Скопировать ссылку на результат"}
      </button>
    </p>
  );
}
