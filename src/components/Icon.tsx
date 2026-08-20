/**
 * Набор тонколинейных глифов по правилам айдентики MainExperts: 24×24,
 * fill не задаётся, обводка наследует цвет текста, толщина 2, круглые концы.
 * Иконки встроены в разметку, а не подключаются шрифтом или спрайтом: лишний
 * запрос на первом экране дороже, чем килобайт в HTML, а цвет должен меняться
 * вместе с темой сам собой.
 *
 * Эмодзи в этом проекте не используются нигде — правило бренда.
 */

export type IconName =
  | "personality"
  | "wellbeing"
  | "relationships"
  | "career"
  | "values"
  | "topic"
  | "search"
  | "menu"
  | "clock"
  | "list"
  | "shield"
  | "experts"
  | "lifebuoy"
  | "arrow"
  | "spark"
  | "scales";

const PATHS: Record<IconName, React.ReactNode> = {
  // Личность — человек в профиль: черта описывает того, кто отвечает
  personality: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
    </>
  ),
  // Состояние — волна: то, что меняется день ото дня, в отличие от черты
  wellbeing: (
    <>
      <path d="M3 14c2-3 3.5-3 5.5 0s3.5 3 5.5 0 3.5-3 5.5 0" />
      <path d="M3 19h18" />
    </>
  ),
  // Отношения — два круга внахлёст: результат описывает половину общего
  relationships: (
    <>
      <circle cx="9" cy="12" r="5" />
      <circle cx="15" cy="12" r="5" />
    </>
  ),
  // Работа — папка: интересы к деятельности, а не к профессии
  career: (
    <>
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h4l2 2.5h7A1.5 1.5 0 0 1 19 11v6.5A1.5 1.5 0 0 1 17.5 19h-13A1.5 1.5 0 0 1 3 17.5z" />
      <path d="M3 12h16" />
    </>
  ),
  // Ценности — компас: чем человек меряет правильность
  values: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15 9l-2 5-4 1 2-5z" />
    </>
  ),
  // Тема — раскрытая книга: разбор, а не тест
  topic: (
    <>
      <path d="M12 6.5C10.4 5.5 8.6 5 6.5 5H4v13h2.5c2.1 0 3.9.5 5.5 1.5" />
      <path d="M12 6.5C13.6 5.5 15.4 5 17.5 5H20v13h-2.5c-2.1 0-3.9.5-5.5 1.5" />
      <path d="M12 6.5v13" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  list: (
    <>
      <path d="M9 7h11" />
      <path d="M9 12h11" />
      <path d="M9 17h11" />
      <path d="M4.5 7h.01M4.5 12h.01M4.5 17h.01" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5l7 2.5v5.5c0 4-2.9 7.4-7 8.5-4.1-1.1-7-4.5-7-8.5V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  experts: (
    <>
      <circle cx="9" cy="9" r="3" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M16 6.5a3 3 0 0 1 0 5.6" />
      <path d="M17.5 14.2c1.9.6 3 2.2 3 4.3" />
    </>
  ),
  // Помощь — спасательный круг: кризисный блок
  lifebuoy: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M6 6l3.5 3.5M18 6l-3.5 3.5M6 18l3.5-3.5M18 18l-3.5-3.5" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h13" />
      <path d="M13 6.5l5.5 5.5-5.5 5.5" />
    </>
  ),
  spark: (
    <>
      <path d="M12 4l1.8 4.7L18.5 10l-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-1.3z" />
      <path d="M18 16.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
    </>
  ),
  // Надёжность — весы: паспорт методики
  scales: (
    <>
      <path d="M12 4.5v15" />
      <path d="M7.5 19.5h9" />
      <path d="M4 7.5h16" />
      <path d="M4 7.5L1.8 12.5h4.4z" />
      <path d="M20 7.5l-2.2 5h4.4z" />
    </>
  ),
};

export default function Icon({
  name,
  size = 24,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className ? `icon ${className}` : "icon"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      // Иконка здесь всегда рядом с текстом и ничего не добавляет к смыслу:
      // для скринридера это украшение, а не содержание
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
