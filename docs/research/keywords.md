# R5 — SEO / SERP / AI-Search Opportunity (2026)

Дата исследования: 2026-08-19. Reference-модель: psytests.org.
Статус: полевой отчёт трека R5 (исследовательский агент). Синтез и решения — в `/docs/strategy/`.

**Методологические оговорки:**
- [OBSERVED] = реально проверенная выдача через поисковый инструмент 19.08.2026. Инструмент работает из **US-локации** и отражает Google-подобный индекс: RU-запросы показывают композицию, близкую к Google, **но не Яндекс**. Выдача Яндекса (74% рынка РФ) не наблюдалась напрямую — везде помечено [INFERRED]/[UNKNOWN].
- Инструмент **не показывает, рендерится ли AI Overview** на конкретном запросе. Колонка «AI-ответ» — вывод из исследований частоты триггеров AIO по категориям (Ahrefs, Semrush, BrightEdge), помечено [INFERRED], если не указано иное.
- Similarweb-цифры — панельные оценки, не факты. Везде [ESTIMATE].

---

## 1. Таблица query clusters

### 1a. RU-запросы

| # | Запрос | Группа | Intent | SERP-композиция | Топ-домены | AI-ответ | Zero-click риск | Difficulty | Opportunity |
|---|--------|--------|--------|-----------------|------------|----------|-----------------|------------|-------------|
| 1 | тест кеттелла онлайн | test name | транзакц. (пройти тест) | [OBSERVED] страницы прохождения тестов, psytests.org #1 (страница «-run»); профильные сайты психотестов | psytests.org, profi.ru, onlinetestpad.com, experimental-psychic.ru, clinli.ru | [INFERRED] низкая вероятность (do-интент) | Низкий — ответ нельзя «пересказать», нужно пройти тест | Средняя | **Высокая** — классический кластер psytests, но занят им же |
| 2 | тест люшера онлайн | test name | транзакц. | [OBSERVED] psytests.org занимает 3 позиции из топ-8 (8color, fullcolor, fullcolor-run) | psytests.org ×3, onlinetestpad.com, findh.org, sem-praktika.ru | [INFERRED] низкая | Низкий | Средняя (доминирование psytests) | Средняя |
| 3 | тест айзенка на темперамент | test name | транзакц. | [INFERRED] аналогично #1–2: сайты-каталоги тестов | [INFERRED] psytests, onlinetestpad | [INFERRED] низкая | Низкий | Средняя | Высокая |
| 4 | опросник шмишека акцентуации | test name | транзакц. | [INFERRED] как #1 | [UNKNOWN] | [INFERRED] низкая | Низкий | Низкая-средняя | Высокая (длинный хвост методик) |
| 5 | соционика тест | test name | транзакц. | [INFERRED] типологические сайты | [UNKNOWN] | [INFERRED] низкая | Низкий | Средняя | Средняя |
| 6 | тест на тревожность | construct | смешанный (инфо+do) | [OBSERVED] **клиники и терапевтические сервисы**, не каталоги тестов | onlinetestpad, mozok.ua, isaevclinic.ru, slozhno.live (Ясно), psi-praktika.ru | [INFERRED] высокая (health/инфо) | Средний | Высокая (медицинские домены) | Средняя |
| 7 | тест на депрессию бека | test name + construct | транзакц. | [OBSERVED] клиники, платформы терапии (Ясно/yasno.live), медцентры; psytests.org отсутствует в топе | bemeta.co, isaevclinic.ru, yasno.live, mipz.ru, centrsna.by | [INFERRED] средняя-высокая | Средний | Высокая | Средняя — YMYL-кластер уже «медикализирован» |
| 8 | тест на выгорание | construct | транзакц.+инфо | [INFERRED] HR/медиа + клиники | [UNKNOWN] | [INFERRED] средняя | Средний | Средняя | Высокая (растущий спрос) |
| 9 | тест на самооценку | construct | транзакц. | [INFERRED] каталоги тестов + медиа | [UNKNOWN] | [INFERRED] средняя | Средний | Низкая-средняя | Высокая |
| 10 | как понять кто я по профессии | problem/need | инфо | [INFERRED] статьи + профтесты EdTech | [INFERRED] skillbox, hh, медиа | [INFERRED] **высокая** (вопросный инфозапрос) | **Высокий** | Средняя | Низкая — съедается AI-ответами |
| 11 | почему я всё время тревожусь | problem/need | инфо (health) | [INFERRED] медиа клиник, статьи психологов | [UNKNOWN] | [INFERRED] **высокая** | **Высокий** | Высокая | Низкая |
| 12 | тест на тип личности | personality | транзакц. | [OBSERVED] psytests.org #1 (тег-страница «typology»), далее институты, сервисы | psytests.org, mip.institute, careerpath.pro, slozhno.live | [INFERRED] низкая-средняя | Низкий-средний | Средняя | **Высокая** — ядро ниши |
| 13 | 16 типов личности тест | personality | транзакц.+навигац. (16personalities) | [INFERRED] 16personalities.com + клоны | [INFERRED] 16personalities | [INFERRED] низкая (навигационный) | Низкий | Высокая (бренд) | Низкая (брендовый спрос чужой) |
| 14 | кто ты из... тест | personality (развлек.) | развлекательный | [INFERRED] медиа-квизы (kudago, eksmo) | [UNKNOWN] | [INFERRED] низкая | Низкий | Низкая | Средняя (трафик есть, монетизация слабая) |
| 15 | профориентация тест | career | транзакц. | [OBSERVED] **полностью занят EdTech лид-геном**: Яндекс Практикум, Skillbox, Нетология, GeekBrains, Foxford | practicum.yandex.ru, skillbox.ru, netology.ru, proforientator.ru, profguide.io | [INFERRED] низкая | Низкий | **Очень высокая** (коммерческие бюджеты EdTech) | Низкая для нового сайта |
| 16 | какая профессия мне подходит тест | career | транзакц. | [OBSERVED] EdTech + testometrika.com в топе + медиа | moeobrazovanie.ru, **testometrika.com**, skillbox.ru, skysmart.ru | [INFERRED] средняя | Средний | Высокая | Средняя |
| 17 | тест на СДВГ у ребёнка | age/parents | транзакц. (health) | [OBSERVED] специализированные клиники и центры коррекции; каталоги тестов отсутствуют | neyropsiholog.ru, psychiatry-test.ru, neurro.ru, dyslexia-center.ru | [INFERRED] средняя-высокая | Средний | Высокая (YMYL + клиники) | Средняя |
| 18 | тест на тревожность у подростка | age/parents | транзакц. (health) | [INFERRED] клиники + школы | [UNKNOWN] | [INFERRED] высокая | Средний | Высокая | Средняя |
| 19 | методика диагностики тревожности Спилбергера для психолога | professional | инфо/скачать | [OBSERVED] Википедия, consultant.ru, PDF/DOC методичек, dip-psi.ru; интент «стимульный материал + ключи» | ru.wikipedia.org, consultant.ru, cmrvsm.ru, dip-psi.ru | [INFERRED] средняя | Средний | Низкая-средняя | **Высокая** — B2B-хвост (психологи, HR, студенты), плохо обслужен |
| 20 | опросник басса-дарки ключи интерпретация | professional | инфо | [INFERRED] методички, рефераты | [UNKNOWN] | [INFERRED] средняя | Средний | Низкая | Высокая |

### 1b. EN-запросы

| # | Запрос | Группа | Intent | SERP-композиция | Топ-домены | AI-ответ | Zero-click риск | Difficulty | Opportunity |
|---|--------|--------|--------|-----------------|------------|----------|-----------------|------------|-------------|
| 21 | MBTI test free | test name | транзакц. | [OBSERVED] тестовые платформы + приложения; много «инди»-сайтов в топе | 123test.com, truity.com, clearerthinking.org, jobcannon.io, seemypersonality.com | [INFERRED] низкая | Низкий | Высокая | Средняя — конкуренция плотная, но не закрытая |
| 22 | 16 personalities test | test name | **навигационный** | [OBSERVED] 16personalities.com (4 URL в топе), Wikipedia, Harvard career services | 16personalities.com, wikipedia.org, truity.com | [OBSERVED-INFERRED] почти нулевая (навигац. — 0,1% триггеров AIO) | Низкий | Недостижимая (бренд) | Нулевая |
| 23 | big five personality test free | test name | транзакц. | [OBSERVED] научно-ориентированные и open-source проекты | outofservice.com, truity.com, bigfive-test.com, personalityassessor.com | [INFERRED] низкая | Низкий | Средняя-высокая | **Высокая** — научная легитимность = E-E-A-T-совместимый кластер |
| 24 | enneagram test free | test name | транзакц. | [INFERRED] truity, idrlabs, крупные квиз-платформы | [INFERRED] truity.com, idrlabs.com | [INFERRED] низкая | Низкий | Высокая | Средняя |
| 25 | depression test | construct (health) | транзакц. (health) | [OBSERVED] **авторитетные организации и телемедицина**: Psychology Today, MHA, Talkspace, Child Mind, Priory | psychologytoday.com, screening.mhanational.org, talkspace.com, priorygroup.com | [INFERRED] **высокая** (health-запросы: AIO до ~89% healthcare-запросов по BrightEdge) | **Высокий** | **Очень высокая** (YMYL) | Низкая для нового сайта |
| 26 | am I depressed quiz | problem/need (health) | транзакц.+инфо | [OBSERVED] Priory, smokefree.gov (гос.), Psychology Today | priorygroup.com, smokefree.gov, psychologytoday.com | [INFERRED] высокая | Высокий | Очень высокая | Низкая |
| 27 | anxiety test online free | construct (health) | транзакц. | [OBSERVED] **телемедицинские компании доминируют**: SonderMind, Talkiatry, Talkspace, Brightside, Cerebral + один инди (freeanxietyquiz.com) | sondermind.com, talkiatry.com, talkspace.com, mhanational.org | [INFERRED] высокая | Высокий | Очень высокая (VC-funded телемед) | Низкая |
| 28 | ADHD test for child | age/parents (health) | транзакц. | [OBSERVED] клиники и профильные центры | childmind.org, autism360.com, adhdcentre.co.uk, sachscenter.com | [INFERRED] высокая | Средний-высокий | Высокая | Низкая-средняя |
| 29 | career aptitude test free | career | транзакц. | [OBSERVED] .edu-ресурсы (MIT, TSU) + truity | cpc.tsu.edu, capd.mit.edu, truity.com | [INFERRED] средняя | Средний | Высокая | Средняя |
| 30 | what career is right for me quiz | problem/need | транзакц.+инфо | [INFERRED] truity, princeton review, EdTech | [UNKNOWN] | [INFERRED] средняя-высокая | Средний | Высокая | Низкая-средняя |
| 31 | attachment style quiz | construct | транзакц. | [INFERRED] терапевтические платформы, Attachment Project | [UNKNOWN] | [INFERRED] средняя | Средний | Средняя | **Высокая** — растущий tiktok-драйв спрос |
| 32 | love language test | personality | транзакц. | [INFERRED] 5lovelanguages.com (бренд) + клоны | [INFERRED] 5lovelanguages.com | [INFERRED] низкая | Низкий | Высокая (бренд) | Низкая |
| 33 | dark triad test | test name (нишевый) | транзакц. | [INFERRED] idrlabs.com и академические | [INFERRED] idrlabs.com | [INFERRED] низкая | Низкий | Низкая-средняя | **Высокая** — модель IDRlabs: длинный хвост нишевых конструктов |
| 34 | burnout test | construct | транзакц. | [INFERRED] HR-платформы, Mind Tools | [UNKNOWN] | [INFERRED] средняя | Средний | Средняя | Высокая |
| 35 | STAI state trait anxiety inventory scoring | professional | инфо | [INFERRED] академические, APA, публикации | [UNKNOWN] | [INFERRED] средняя | Средний | Средняя | Средняя (EN professional хвост занят академией) |
| 36 | free printable psychological assessment tools for therapists | professional | инфо/скачать | [INFERRED] Therapist Aid, PositivePsychology.com | [INFERRED] therapistaid.com | [INFERRED] средняя | Средний | Средняя-высокая | Средняя |

**Ключевой паттерн из наблюдений [OBSERVED]:** выдача чётко расслоилась на три режима. (1) Запросы «имя методики + пройти» — ранжируются каталоги тестов (psytests-модель жива). (2) Запросы «конструкт/симптом» (тревожность, депрессия, СДВГ) — **захвачены клиниками и телемедициной** в обеих языковых зонах; каталоги тестов вытеснены. (3) Career-запросы в RU — захвачены EdTech лид-геном (Skillbox, Практикум, Нетология). psytests.org наблюдался в топе только в режиме (1) и на «тест на тип личности».

---

## 2. Findings: AI Overviews и zero-click (2024–2026)

**Частота и охват AIO:**
- [FACT] Pew Research (панель 900 взрослых США, март 2025): AI-сводка появлялась в **18%** всех Google-запросов; у 58% участников — хотя бы раз за месяц. (pewresearch.org, 22.07.2025)
- [FACT] Semrush: доля запросов с AIO выросла с 6,49% (янв 2025) до 13,14% (март 2025), **+102% за два месяца**; 88,1% запросов, триггерящих AIO, — информационные; категория health — в лидерах роста (+20,33% за квартал).
- [FACT] BrightEdge: присутствие AIO в healthcare-запросах выросло с 59% до **~89%** (2023→2025).

**Влияние на клики:**
- [FACT] Pew: при наличии AI-сводки CTR по обычным результатам падает с **15% до 8%**; ссылки внутри самой сводки кликают лишь в **1%** случаев; сессия завершается без единого клика в 26% случаев (против 16% без сводки).
- [FACT] Ahrefs: −34,5% CTR позиции №1 при AIO (апрель 2025, 300 тыс. ключей); обновлённое исследование (декабрь 2025) — уже **−58%** (CTR позиции №1: 0,076 в дек 2023 → 0,039 в дек 2025 при AIO).
- [FACT] Seer Interactive: органический CTR по запросам с AIO упал на 61% (июнь 2024 → сент 2025).
- [FACT] Semrush: 58,5% поисков в США и 59,7% в ЕС завершаются без клика (zero-click, 2025).
- [ESTIMATE] Google-рефералы паблишерам −38% г/г на янв 2026 (агрегированные отраслевые данные, вторичный источник).

**Что НЕ триггерит AIO (критично для ниши):**
- [FACT] Ahrefs (сент 2025, 146 млн SERP): навигационные запросы — **0,1%** триггеров AIO; транзакционные — ~4–15%.
- **Вывод для психотестов:** запрос «пройти тест X» — do-интент, AI не может «выдать результат теста» текстом; сам продукт (интерактивный тест) — **естественная защита от zero-click**. Уязвимы обёрточные инфозапросы («что такое MBTI», «признаки депрессии», «как интерпретировать результаты») — именно они исторически давали каталогам тестов ~половину трафика.

**Яндекс (RU):**
- [FACT, вторичные источники] Доля Яндекса в поиске РФ: ~65,5% (Q3 2024, Radar) → ~72–74% (2025). Google — ~25%.
- [ESTIMATE, отраслевые блоги — pr-cy, Timeweb/Аспро] Нейроответ (Алиса AI / бывш. Нейро) показывается на **~27% запросов**; органика по инфозапросам просела на 15–60% в зависимости от ниши; Алиса AI — 80 млн пользователей, 12 млн ежедневно. Точных независимых исследований уровня Pew по Яндексу нет [UNKNOWN — надёжность цифр средняя].
- [ESTIMATE] Механика та же: нейроответ собирается из топа выдачи со ссылками-сносками; чтобы быть источником, нужно быть в топе — SEO не отменяется, но конвертация показов в клики падает.

**AI-ассистенты как канал:**
- [FACT] ChatGPT ~1 млрд WAU (август 2026).
- [FACT, SE Land/Goodie/SearchSignal] AI-рефералы = лишь **~0,3% всего веб-трафика** (2026), но рост 16× с 2024. ChatGPT даёт 75–92% AI-рефералов; Perplexity ~780 млн запросов/мес; Claude обогнал Perplexity по рефералам в марте 2026.
- [FACT] AI-движки непропорционально цитируют домены с именованными клиническими авторами и ссылками на исследования — E-E-A-T-сигналы работают и для GEO.

---

## 3. YMYL / E-E-A-T риски для психологического контента

1. **[FACT] Ментальное здоровье = YMYL.** Тесты на депрессию/тревожность/СДВГ Google оценивает по повышенной планке (Quality Rater Guidelines; категории YMYL расширены обновлениями QRG 2025). Страницы без указания авторов-клиницистов и медицинского ревью системно занижаются.
2. **[OBSERVED] Рынок это уже подтвердил.** В наблюдённых SERP по клиническим конструктам (депрессия, тревожность, СДВГ — RU и EN) топ занят клиниками, телемедициной и госресурсами. Анонимный каталог тестов в этих кластерах в 2026 **не ранжируется** — это не прогноз, это текущее состояние выдачи.
3. **[FACT] Прецедент Helpful Content.** После HCU сен 2023 (и вливания в core в марте 2024) сайты «контент ради трафика» теряли 30–90% трафика; осмысленное восстановление — ~22% сайтов (трекинг Гленна Гейба, конец 2024); показательный кейс HouseFresh — возврат к пре-HCU уровню занял **2+ года**. Сайт психотестов без экспертных сигналов — типовая мишень этого класса алгоритмов.
4. **Разделение рисков по кластерам:** личностные/типологические тесты (MBTI-стиль, Big Five, темперамент) — НЕ клинический YMYL, риск умеренный; клинические скрининги (PHQ-9, Бек, GAD-7, СДВГ) — полный YMYL: нужны именованные специалисты, дисклеймеры, ссылки на валидизацию, кризисные контакты. [INFERRED из QRG + наблюдённой выдачи]
5. **[ESTIMATE] Правовой/этический хвост:** многие классические методики (16PF, MMPI, официальный MBTI) — коммерчески защищённые инструменты; «бесплатные онлайн-версии» существуют в серой зоне. Для psytests-модели это исторически игнорировалось, но для нового бренда с амбициями на E-E-A-T это риск (сами SERP-сниппеты предупреждают: «бесплатные тесты Кеттелла в открытом доступе — не официальная методика»).
6. **Яндекс:** формального аналога E-E-A-T меньше, требования к медконтенту мягче; «Проксима» учитывает экспертность, но порог входа для псих-контента в Яндексе ниже, чем в Google [INFERRED, вторичные источники].

---

## 4. Выводы: SEO как primary acquisition канал в 2026

### RU — **условно да, как primary канал на старте (с оговорками)**

- [OBSERVED] Ядро ниши живо: по запросам «методика + пройти онлайн» ранжируются каталоги тестов, а не корпорации. psytests.org удерживает #1 и занимает по 2–3 позиции на запрос.
- [ESTIMATE] Экономика подтверждена: psytests.org — ~2,2 млн визитов/мес (Similarweb, авг 2024), к 2026 глобальный ранг ~9 800 (что типично соответствует 4–7 млн визитов/мес; hypestat даёт ~1 млн, но с противоречащим рангом — данные конфликтуют, реалистичный диапазон **2–6 млн/мес**), 69,9% из РФ, 12 стр./визит — глубокое вовлечение. testometrika — ранг ~34 000 (≈1–2 млн/мес [ESTIMATE]).
- Доступные кластеры: **длинный хвост методик** (сотни опросников с низкой конкуренцией — Шмишек, Басса-Дарки, Йовайши…), **professional-сегмент** (психологи/студенты ищут «стимульный материал + ключи + нормы» и находят DOC-файлы школ и PDF-методички — выдача слабая, [OBSERVED]), нишевые конструкты (выгорание, прокрастинация, привязанность).
- Закрытые кластеры: профориентация (EdTech лид-ген с бюджетами), клинические скрининги (клиники и «Ясно»-подобные платформы уже там).
- Риски: нейроответы Яндекса на ~27% запросов [ESTIMATE] съедают именно обёрточный инфотрафик; сам интерактивный тест защищён. RU-рынок = Яндекс (74%), где AI-давление пока мягче Google.

### EN — **нет, SEO не может быть primary каналом для нового сайта**

- [OBSERVED] Все жирные кластеры заняты: брендами (16personalities — 17–23 млн визитов/мес [ESTIMATE]), телемедициной с VC-деньгами (Talkspace, Talkiatry, Brightside — для них тест это лид-ген на подписку $300+/мес, CAC-война непроигрываемая), авторитетами (Psychology Today, MHA, .edu, .gov).
- [FACT] Health-запросы под AIO до ~89% + YMYL-планка: новый домен без клинического E-E-A-T не войдёт в клинические кластеры в обозримом горизонте.
- Что остаётся: модель **IDRlabs** (4,9–7,7 млн визитов/мес [ESTIMATE]) — длинный хвост нишевых/«вирусных» тестов (dark triad, political coordinates) с научной обёрткой + соцсети как драйвер. Плюс Big Five кластер (научная легитимность, open-source конкуренты — выдача не «закрыта» корпорациями [OBSERVED]). Но это SEO как *вторичный* канал при primary = social/viral.

### Zero-click: где убивает экономику, а где нет

- **Убивает:** инфостатьи-спутники («что такое тревожность», «типы личности список», «как понять кем работать») — 88% AIO-триггеров это информационные запросы [FACT], CTR −58% [FACT]. Строить трафик-модель на обёрточном контенте в 2026 нельзя.
- **Не убивает:** сам интерактивный тест. AI не выдаст ваш результат по Кеттеллу — нужно кликнуть и пройти. Do-интент триггерит AIO в единицах процентов [FACT]. Продукт-как-контент — структурная защита.

### AI-ассистенты как канал

- Сегодня это **~0,3% веб-трафика [FACT]** — не канал объёма, но канал с реферальным качеством выше среднего и ростом 16× за два года. Реалистичная цель 2026–2027: быть тем сайтом, который ChatGPT/Алиса называют в ответ на «где пройти бесплатный тест Big Five» — для этого нужны: цитируемость (упоминания на авторитетных ресурсах), именованные эксперты, открытые описания методик с валидизацией, техническая доступность для краулеров LLM. [INFERRED] Для нового сайта «быть рекомендованным ChatGPT» — асимметричная ставка: дёшево сейчас, дорого догонять потом. Но как primary канал на 2026 — нет [ESTIMATE].

### Итоговая формула

**RU:** SEO как primary канал — жизнеспособно в кластерах «имя методики» + professional-хвост (Яндекс-первичная стратегия), при отказе от клинических кластеров без медлицензии/экспертов. **EN:** SEO — только support-канал; primary должен быть social/viral (IDRlabs-модель) или продуктовая дистрибуция; клинические кластеры — не входить без клинического бренда. **Оба рынка:** ядро стратегии — интерактивный продукт (защищён от zero-click), а не контент-обёртка (уже съедена AI).

---

## 5. Источники (дата доступа ко всем: 2026-08-19)

**AI Overviews / zero-click:**
1. Pew Research Center — «Google users are less likely to click on links when an AI summary appears» — pewresearch.org/short-reads/2025/07/22/… (данные марта 2025)
2. Ahrefs — «AI Overviews Reduce Clicks by 34.5%» — ahrefs.com/blog/ai-overviews-reduce-clicks/ (апр 2025; обновление −58% — дек 2025, через searchengineland.com/google-ai-overviews-hurt-click-through-rates-454428 и seo-kreativ.de)
3. Semrush — «AI Overviews Study» и «Is zero-click search traffic increasing?» — semrush.com/blog/semrush-ai-overviews-study; semrush.com/blog/is-zero-click-search-traffic-increasing/
4. Ahrefs — «What Triggers AI Overviews? 146 Million SERPs» — ahrefs.com/blog/ai-overview-triggers/
5. BrightEdge — «Healthcare and AI Overviews 2023–2025» — brightedge.com/resources/weekly-ai-search-insights/healthcare-ai-evolution-google-2023-2025
6. Searchengineland — «Google AI Overviews hurting clicks: Pew study» — searchengineland.com/google-ai-overviews-hurting-clicks-study-459434

**HCU / YMYL / E-E-A-T:**
7. thestacc.com/blog/helpful-content-update-recovery/ (данные Гленна Гейба, кейс HouseFresh)
8. thestacc.com/blog/eeat-ymyl-guide/; crownsvillemedia.com/therapist-ymyl-and-e-e-a-t
9. searchenginejournal.com/how-to-create-health-ymyl-content-that-performs-in-ai-search/584431/

**Яндекс / RU:**
10. Timeweb/Аспро — «Позиции есть, трафика нет: нейроответы Яндекса» — timeweb.com/ru/community/articles/pozicii-est-trafika-net… (27% запросов, −15–60% органики; отраслевые наблюдения, не академическое исследование)
11. PR-CY — «Алиса AI (Яндекс Нейро): влияние на SEO» — pr-cy.ru/news/p/10545-yandex-neuro
12. Skillbox Media / ppc.world — доли Яндекс/Google в РФ 2024–2025 — skillbox.ru/media/marketing/doli-yandeksa-i-google-v-rossii…; ppc.world/news/yandeks-za-god-ukrepil-pozicii…

**AI-search как канал:**
13. Searchengineland — «ChatGPT commands 92% of AI referral traffic (6.77M sessions)» — searchengineland.com/chatgpt-ai-referral-traffic-sessions-data-481630
14. Goodie — «AI Search Traffic Report 2026» — higoodie.com/blog/ai-search-traffic-report-2026/
15. DemandSage — «ChatGPT Statistics August 2026» — demandsage.com/chatgpt-statistics/

**Трафик (все — [ESTIMATE], панельные данные):**
16. Similarweb — similarweb.com/website/psytests.org/ (ранг ~9 797, RU 69,9%, 12 стр./визит); similarweb.com/website/testometrika.com/vs/psytests.org/ (2,2 млн визитов psytests, авг 2024); similarweb.com/website/16personalities.com/ (17,1 млн, июнь 2025); similarweb.com/website/idrlabs.com/ (4,9 млн)
17. Hypestat — hypestat.com/info/psytests.org (~986 тыс./мес — конфликтует с рангом Similarweb, надёжность низкая)
18. Semrush — semrush.com/website/16personalities.com/overview/ (18,9 млн, окт; −16% фев 2026)

**Наблюдённые SERP:** 17 запросов проверены через поисковый инструмент 19.08.2026 (US-локация, Google-подобный индекс; выдача Яндекса не наблюдалась — все выводы по Яндексу помечены [INFERRED]/[ESTIMATE]).
