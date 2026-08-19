# Test Engine & AI Layer

Дата: 2026-08-19. Требования: deterministic, reproducible, versioned, testable, auditable. **Скоринг не зависит от LLM — никогда.**

## 1. Декларативный DSL (TestVersion.definition, jsonb)

```jsonc
{
  "meta": { "code": "phq9", "locale": "ru", "version": "1.0.0",
            "timing": null, "age": {"min": 18, "max": 99} },
  "sections": [{
    "id": "s1", "instruction": "Как часто за последние 2 недели…",
    "questions": [{
      "id": "q1", "type": "likert",             // single|multiple|likert|numeric|matrix|ranking
      "text": "…", "required": true,
      "options": [ {"id":"o0","text":"Совсем нет","value":0}, … ],
      "showIf": null                              //条件: {"q":"q2","op":">=","value":1}
    }]
  }],
  "scales": [{ "id": "total", "items": ["q1","…","q9"] },
             { "id": "e",  "items": ["q2","q7R"] }],       // R-суффикс = reverse
  "scoring": {
    "reverse": { "q7": {"max": 5} },              // reversed = max - value
    "weights": { "q3": 2 },                        // weighted scoring
    "formulas": { "total": "sum(items)" },        // sum|mean|custom-safe-expr
    "validity": [ {"type":"attention_check","q":"q10","expect":2} ]
  },
  "branching": [ {"if": {"q":"q1","op":"==","value":0}, "skipTo": "s3"} ],
  "crisis": [ {"q": "q9", "op": ">=", "value": 1, "action": "interstitial:crisis_ru"} ]
}
```

Поддержано в MVP: single/multiple choice, Likert, numeric; reverse и weighted scoring; несколько шкал; условные вопросы/ветвление; attention-checks; крайние-триггеры (crisis). Matrix/ranking/timed — по мере появления методик, DSL расширяем без миграции (jsonb + zod-схема с версией DSL).

## 2. Пайплайн скоринга (детерминированный)

```
answers + definition@v
  → validate (полнота, диапазоны, attention checks)
  → reverse/weights
  → raw scores по шкалам (formulas — safe-eval ограниченного словаря, без Function/eval)
  → NormTable@v lookup (пол/возраст) → std scores (T/стены/перцентили)
  → Interpretation@v диапазоны → структурированный результат
  → Result (иммутабелен; фиксирует тройку версий)
```

Свойства: чистая функция без времени/рандома; один и тот же вход ⇒ бит-в-бит одинаковый Result. Аудит: Result хранит версии всех входов.

## 3. Golden Test Cases (обязательны)

Для каждой методики в репозитории лежит `golden/{code}@{version}.json`: набор (answers → ожидаемые raw и std для всех полов/возрастных групп норм), включая краевые случаи (все min, все max, reverse-пункты, пропуски, attention-fail, кризисные триггеры). CI: изменение definition/rules/norms без bump версии — красный билд; bump версии требует нового golden-файла. Регрессия скоринга = релиз-блокер.

## 4. AI Layer (поверх, не вместо)

**Принцип:** `Validated inputs → Deterministic scoring → Structured result → AI explanation`. Запрещено: `Answers → LLM decides score`.

Пайплайн AI-черновика (для психолога):
```
Structured result (шкалы, std-баллы, диапазоны интерпретаций, БЕЗ ПДн — белый список полей)
  → deidentify (пол/возрастная группа вместо идентификаторов; псевдоним → «клиент»)
  → prompt template@version (жёсткая структура секций отчёта; правила Safety Policy
     из legal/compliance.md §3.1 зашиты в системный промпт)
  → RU LLM (YandexGPT/GigaChat через абстракцию провайдера; temperature низкая)
  → output filters: запрещённый словарь (диагнозы/гарантии/лекарства), обязательные
     формулы неопределённости, маркировка «Сгенерировано AI — требует правки специалиста»
  → редактор психолога (human-in-the-loop by design; неправленый черновик нельзя
     выгрузить в PDF без явного подтверждения)
```

Требования к выводу AI: ссылается только на числа из structured result (пост-проверка: все упомянутые шкалы/баллы существуют и совпадают); выражает неопределённость («результаты указывают на…», не «у клиента…»); не меняет и не пересчитывает баллы; воспроизводимость для QA — фиксированные prompt_version + модель в Report.
Кризисный контур: при CrisisEvent AI-генерация по этому результату отключается, используется только человеческий шаблон (R4 §3.3).
Стоимость: ~15–30k токенов/отчёт ≈ 10–60 ₽ (V8); кэширование системного промпта; fallback-модель второго провайдера; при недоступности LLM продукт полностью функционален (AI — enhancement, не зависимость).

Фаза 2 use cases (по матрице Value×Frequency×WTP×Feasibility×Safety×Cost из research): семантический подбор методики под запрос клиента («клиент с прокрастинацией и самокритикой» → рекомендованная батарея) — высокая ценность, низкий риск (рекомендация психологу, не клиенту); сравнение динамики замеров текстом. НЕ делаем: диалоговое «дообследование» клиента AI (граница clinical, R4), AI-ответы клиенту о его результатах без психолога.
