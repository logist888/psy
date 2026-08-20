import type { Test } from "./engine/schema";

/** Category labels — pure (no fs), so both server and client code can import it. */
export const CATEGORIES: Record<Test["category"], { title: string; description: string }> = {
  personality: { title: "Личность", description: "Черты, самооценка, характер" },
  wellbeing: { title: "Состояние", description: "Напряжение, выгорание, ресурс" },
  relationships: { title: "Отношения", description: "Привязанность и близость" },
  career: { title: "Работа и призвание", description: "Интересы и профессиональный выбор" },
  values: { title: "Ценности", description: "Что для вас важно" },
};

export const CATEGORY_ORDER: Test["category"][] = [
  "personality",
  "wellbeing",
  "relationships",
  "career",
  "values",
];
