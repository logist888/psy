import type { Metadata } from "next";
import { getAllTests } from "@/lib/content";
import MyTests from "@/components/MyTests";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Мои тесты",
  description: "История пройденных тестов — хранится только в вашем браузере.",
  robots: { index: false, follow: true },
};

export default function MyPage() {
  const tests = getAllTests().map((t) => ({ slug: t.slug, title: t.title, minutes: t.minutes }));
  return (
    <>
      <Breadcrumbs items={[{ name: "Главная", href: "/" }, { name: "Мои тесты", href: "/my" }]} />
      <h1>Мои тесты</h1>
      <MyTests tests={tests} />
    </>
  );
}
