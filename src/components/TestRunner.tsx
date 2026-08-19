"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Test } from "@/lib/engine/schema";
import { encodeAnswers, type Answers } from "@/lib/engine/score";
import { track, trackTestStart } from "@/lib/analytics";

const BATCH = 5;

export default function TestRunner({ test }: { test: Test }) {
  const router = useRouter();
  const storageKey = `answers:${test.slug}:${test.version}`;
  const [answers, setAnswers] = useState<Answers>({});
  const [batch, setBatch] = useState(0);
  const [restored, setRestored] = useState(false);
  const [startTracked, setStartTracked] = useState(false);

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
    // Старт засчитывается по первому ответу, а не по открытию страницы:
    // иначе completion rate считается от случайных заходов.
    if (!startTracked) {
      trackTestStart(test.slug);
      setStartTracked(true);
    }
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function next() {
    if (!isLast) {
      setBatch((b) => b + 1);
      track({ name: "test_progress", test: test.slug, percent });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    track({ name: "test_complete", test: test.slug });
    const token = encodeAnswers(test, answers);
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    router.push(`/result/${test.slug}?r=${encodeURIComponent(token)}`);
  }

  return (
    <>
      <div className="progress">
        <div className="label">
          Вопрос {Math.min(batch * BATCH + 1, test.questions.length)}–
          {Math.min((batch + 1) * BATCH, test.questions.length)} из {test.questions.length}
        </div>
        <div className="bar">
          <i style={{ width: `${percent}%` }} />
        </div>
      </div>

      {current.map((question) => (
        <div className="q" key={question.id}>
          <p className="text">{question.text}</p>
          <div className="opts">
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
                  <span>{option.text}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <p style={{ marginTop: 24 }}>
        <button className="btn block" onClick={next} disabled={!answeredInBatch}>
          {isLast ? "Показать результат" : "Дальше"}
        </button>
      </p>
      {!answeredInBatch && (
        <p className="small muted" style={{ textAlign: "center" }}>
          Ответьте на все утверждения на этом экране
        </p>
      )}
      {batch > 0 && (
        <p style={{ textAlign: "center" }}>
          <button className="btn secondary" onClick={() => setBatch((b) => b - 1)}>
            Назад
          </button>
        </p>
      )}
    </>
  );
}
