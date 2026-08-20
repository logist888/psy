/**
 * Inline SVG icon set for ПСИХОТЕСТЫ. Stroke icons inherit `currentColor`; the
 * few duotone category glyphs use it too. Keeping them inline (no icon font, no
 * runtime fetch) keeps the static export self-contained.
 */
import type { Test } from "@/lib/engine/schema";

export type IconName =
  | "brand" | "person" | "brain" | "heart" | "bars" | "target"
  | "arrow" | "arrow-left" | "search" | "chevron" | "chevron-left" | "chevron-right"
  | "clock" | "list" | "star" | "bookmark" | "shield" | "copy" | "close"
  | "user" | "check" | "sliders" | "grid" | "info" | "menu" | "link" | "reliability";

const P: Record<IconName, React.ReactNode> = {
  brand: <><path d="M7 4h5a5 5 0 0 1 0 10H7z" /><path d="M12 4h1a5 5 0 0 1 0 10h-1" /><path d="M9.5 9h3" /></>,
  person: <><circle cx="12" cy="8" r="3.4" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></>,
  brain: <><path d="M9 5.5A2.5 2.5 0 0 0 6.5 8 2.5 2.5 0 0 0 5 12a2.5 2.5 0 0 0 1.5 4A2.5 2.5 0 0 0 9 18.5V5.5z" /><path d="M15 5.5A2.5 2.5 0 0 1 17.5 8 2.5 2.5 0 0 1 19 12a2.5 2.5 0 0 1-1.5 4A2.5 2.5 0 0 1 15 18.5V5.5z" /><path d="M9 5.5A2 2 0 0 1 12 4a2 2 0 0 1 3 1.5" /></>,
  heart: <path d="M12 20s-7-4.4-9-8.2C1.4 8.4 3 5.5 6 5.5c1.9 0 3 1.1 3.8 2.2C10.6 6.6 11.7 5.5 13.6 5.5c3 0 4.6 2.9 3 6.3C19.5 15.6 12 20 12 20z" />,
  bars: <><path d="M5 20V11" /><path d="M12 20V4" /><path d="M19 20v-6" /></>,
  target: <><circle cx="12" cy="12" r="7.5" /><circle cx="12" cy="12" r="3.5" /><circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" /></>,
  arrow: <><path d="M4 12h15" /><path d="M13 6l6 6-6 6" /></>,
  "arrow-left": <><path d="M20 12H5" /><path d="M11 6l-6 6 6 6" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.6-3.6" /></>,
  chevron: <path d="M6 9l6 6 6-6" />,
  "chevron-left": <path d="M15 6l-6 6 6 6" />,
  "chevron-right": <path d="M9 6l6 6-6 6" />,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4.5l3 1.8" /></>,
  list: <><path d="M8 7h11" /><path d="M8 12h11" /><path d="M8 17h11" /><path d="M4.5 7h.01" /><path d="M4.5 12h.01" /><path d="M4.5 17h.01" /></>,
  star: <path d="M12 4l2.3 4.9 5.2.6-3.9 3.6 1.1 5.3L12 15.9 7.3 18.4l1.1-5.3-3.9-3.6 5.2-.6z" />,
  bookmark: <path d="M7 5h10v15l-5-3.4L7 20z" />,
  shield: <><path d="M12 4l6.5 2.4v5c0 4.3-2.9 7.3-6.5 8.6-3.6-1.3-6.5-4.3-6.5-8.6v-5z" /><path d="M9.3 12l1.9 1.9 3.6-3.8" /></>,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" /></>,
  close: <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>,
  user: <><circle cx="12" cy="8.5" r="3.2" /><path d="M6 19a6 6 0 0 1 12 0" /></>,
  check: <path d="M5 12.5l4.2 4.2L19 7" />,
  sliders: <><path d="M4 8h10" /><path d="M18 8h2" /><circle cx="16" cy="8" r="2" /><path d="M4 16h4" /><path d="M12 16h8" /><circle cx="10" cy="16" r="2" /></>,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.6" /><rect x="13" y="4" width="7" height="7" rx="1.6" /><rect x="4" y="13" width="7" height="7" rx="1.6" /><rect x="13" y="13" width="7" height="7" rx="1.6" /></>,
  info: <><circle cx="12" cy="12" r="8" /><path d="M12 11v5" /><path d="M12 8h.01" /></>,
  menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
  link: <><path d="M9 15l6-6" /><path d="M11 7l1-1a3.5 3.5 0 0 1 5 5l-1 1" /><path d="M13 17l-1 1a3.5 3.5 0 0 1-5-5l1-1" /></>,
  reliability: <><path d="M4 18h16" /><path d="M6 18v-4" /><path d="M11 18v-8" /><path d="M16 18v-6" /></>,
};

export function Icon({ name, size = 24, className = "i", strokeWidth = 1.8 }: {
  name: IconName; size?: number; className?: string; strokeWidth?: number;
}) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      {P[name]}
    </svg>
  );
}

/** Per-category presentation: the CSS setter class + its glyph. */
export const CATEGORY_META: Record<Test["category"], { className: string; icon: IconName }> = {
  personality: { className: "cat-personality", icon: "person" },
  wellbeing: { className: "cat-wellbeing", icon: "brain" },
  relationships: { className: "cat-relationships", icon: "heart" },
  career: { className: "cat-career", icon: "bars" },
  values: { className: "cat-values", icon: "target" },
};
