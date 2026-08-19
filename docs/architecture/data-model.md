# Data Model

Дата: 2026-08-19. Принципы: версионирование всего, что влияет на результат; воспроизводимость любого результата; provenance прав; минимизация ПДн. Сущности добавляются только при необходимости — ниже минимальный набор MVP + помеченные «фаза 2».

## 1. Ядро контента (методики)

```
Method            — методика как научный объект: name, slug, constructs[], authors[],
                    origin (первоисточник), scientific_passport (jsonb: reliability,
                    validity, norms provenance, limitations), data_category (health|non_health)
Test              — публикуемая реализация Method: method_id, audience (pro|b2c|both),
                    status (draft|sci_review|rights_review|published|deprecated)
TestVersion       — иммутабельный снапшот: test_id, semver, definition (jsonb DSL:
                    sections, questions, options, branching), created_by, published_at.
                    Изменение текста вопроса = новая версия. Результаты ссылаются на версию.
Question / AnswerOption — нормализованы внутри definition (jsonb); отдельные таблицы не
                    заводим в MVP (нет запросов по ним); full-text по definition.
Scale             — шкала: method_id, code, name, description, direction
ScoringRuleSet    — версионированные правила: test_version_id, rules (jsonb: keys,
                    reverse items, weights, formulas), semver
NormTable         — версионированные нормы: scale_id, population (sex, age_min/max,
                    country, sample_n, source), mapping (raw→T/sten/percentile), semver
Interpretation    — версионированные текстовые диапазоны: scale_id, range, text_pro,
                    text_client, semver
Author            — ФИО, годы, био, slug (SEO-страница)
Source            — библиография: citation, url/doi, type
LicenseRecord     — provenance прав: method_id/test_id, basis (public_domain|license|
                    own_work|permission_letter), document_url/file, granted_by, scope
                    (commercial|noncommercial), territory, expires_at. БЕЗ LicenseRecord
                    Test не может стать published (DB-констрейнт + CMS-гейт).
Category / Tag / Topic (construct) — таксономия и SEO-хабы
```

## 2. Пользователи и практика

```
User              — психолог: email, pass_hash, role (pro|admin), profile, created_at
Organization      — фаза 2 (B2B-lite); в MVP отсутствует
Client            — клиент психолога: user_id (владелец), pseudonym/code, sex, birth_year
                    (для норм), notes (шифруется), status. Email опционален (для отправки
                    ссылок), шифруется.
Battery           — батарея: user_id, name, test_version_ids[], is_template
Assignment        — назначение батареи клиенту: battery_id, client_id, token (подписанный,
                    TTL), status (sent|in_progress|completed|expired), consent_id
Consent           — согласие клиента: assignment_id, version текста, scope (processing|
                    ai_processing), granted_at, ip_hash. Отдельные записи на каждый scope.
Session/Attempt   — прохождение: assignment_id (или b2c anonymous), test_version_id,
                    answers (jsonb, шифруется), started/completed_at, device
Result            — иммутабельный результат: attempt_id, test_version_id,
                    scoring_ruleset_version, norm_table_version, raw_scores (jsonb),
                    std_scores (jsonb), computed_at. Воспроизводимость: тройка версий
                    (test, scoring, norms) фиксируется в момент расчёта; пересчёт при
                    обновлении норм создаёт НОВЫЙ Result (ResultVersion-цепочка через
                    supersedes_id), старый не мутируется.
Report            — AI-черновик/финальный текст: result_ids[], ai_draft (text),
                    final_text, ai_model, prompt_version, edited_by_user
CrisisEvent       — срабатывание кризисного протокола: attempt_id, trigger (item, value),
                    shown_at (без хранения лишнего контента)
```

## 3. Коммерция и системное

```
Subscription      — user_id, plan (free|pro_m|pro_y), status, current_period_end,
                    provider_ref (ЮKassa)
Payment           — invoice/receipt, amount, status, provider_payload
CreditBalance / CreditTx — AI-кредиты
AuditLog          — actor, action, entity, entity_id, at, ip_hash — на каждый доступ
                    к Result/Client и админ-действия
AnalyticsEvent    — (в PostHog, не в основной БД)
ResearchProject / Respondent — фаза 2 (аналог «рабочего кабинета» psytests для
                    исследователей); в MVP — нет
```

## 4. Ключевые инварианты

1. **Result неизменяем** и всегда воспроизводим: `score(definition@v, answers, rules@v, norms@v) = const` — проверяется golden-тестами (test-engine.md).
2. **Published Test ⇒ существует LicenseRecord** с basis, покрывающим commercial scope.
3. **Health-методика (data_category=health) ⇒ доступ только через Assignment** (проф. контур), не через публичный каталог.
4. **Consent предшествует первому ответу**: Attempt не создаётся без consent (для Assignment-флоу); B2C non-health — публичная оферта + анонимность.
5. **Удаление клиента** каскадно удаляет answers/results/reports (или анонимизирует Result для норм — только при наличии соответствующего scope согласия).
6. **Локализация (фаза EN):** definition хранит locale; TestVersion привязана к locale — перевод = отдельная версия с собственной валидационной меткой в паспорте (не «тот же тест»).
```
