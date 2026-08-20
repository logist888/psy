"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import type { Test } from "@/lib/engine/schema";
import { encodeAnswers, type Answers } from "@/lib/engine/score";
import { Icon } from "@/components/icons";

const BATCH = 5;

export default function TestRunner({ test }: { test: Test }) {
  const router = useRouter();
  const storageKey = `answers:${test.slug}:${test.version}`;
  const [answers, setAnswers] = useState<Answers>({});
  const [batch, setBatch] = useState(0);
  const [restored, setRestored] = useState(false);

  // Автосохранение прогресса в sessionStorage: ничего не уходит на сервер.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { answers: Answers; batch: number };
        setAnswers(parsed.answers ?? {});
        setBatch(parsed.batch ?? 0);
      }
    } catch {
      /* приватный режим браузера — просто начинаем заново */
    }
    setRestored(true);
  }, [storageKey]);

  useEffect(() => {
    if (!restored) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ answers, batch }));
    } catch {
      /* переполнение или запрет хранилища — прогресс не сохраняем */
    }
  }, [answers, batch, restored, storageKey]);

  const batches = useMemo(() => {
    const chunks: Test["questions"][] = [];
    for (let i = 0; i < test.questions.length; i += BATCH) {
      chunks.push(test.questions.slice(i, i + BATCH));
    }
    return chunks;
  }, [test.questions]);

  const current = batches[batch] ?? [];
  const answeredInBatch = current.every((q) => answers[q.id] !== undefined);
  const answeredTotal = Object.keys(answers).length;
  const percent = Math.round((answeredTotal / test.questions.length) * 100);
  const isLast = batch === batches.length - 1;

  function choose(questionId: string, value: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function next() {
    if (!isLast) {
      setBatch((b) => b + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const token = encodeAnswers(test, answers);
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    router.push(`/result/${test.slug}?r=${encodeURIComponent(token)}`);
  }

  const from = Math.min(batch * BATCH + 1, test.questions.length);
  const to = Math.min((batch + 1) * BATCH, test.questions.length);

  return (
    <>
      <div className="run-progress">
        <div className="label">
          <span>Утверждения {from}–{to} из {test.questions.length}</span>
          <b>{percent}% пройдено</b>
        </div>
        <div className="bar">
          <i style={{ width: `${percent}%` }} />
        </div>
      </div>

      {current.map((question, i) => (
        <div className="q" key={question.id}>
          <div className="q-num">{String(from + i).padStart(2, "0")}</div>
          <p className="text">{question.text}</p>
          <div className="opts" style={{ "--n": test.options.length } as CSSProperties}>
            {test.options.map((option) => {
              const checked = answers[question.id] === option.value;
              return (
                <label key={option.value} className={`opt${checked ? " checked" : ""}`}>
                  <input
                    type="radio"
                    name={question.id}
                    checked={checked}
                    onChange={() => choose(question.id, option.value)}
                  />
                  <span className="radio" aria-hidden="true" />
                  <span>{option.text}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <div className="run-nav">
        <button className="btn secondary" onClick={() => setBatch((b) => b - 1)} disabled={batch === 0}>
          <Icon name="arrow-left" size={17} /> Назад
        </button>
        {!answeredInBatch && <p className="hint">Ответьте на все утверждения на этом экране</p>}
        <button className="btn" onClick={next} disabled={!answeredInBatch}>
          {isLast ? "Показать результат" : "Дальше"} <Icon name="arrow" size={17} />
        </button>
      </div>
    </>
  );
}
