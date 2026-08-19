import Link from "next/link";
import type { Metadata } from "next";
import { getAllTests } from "@/lib/content";
import { SITE, platformLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Научные паспорта методик",
  description:
    "Что измеряет каждая методика, откуда она взята, какая у неё надёжность и на каком правовом основании мы её используем.",
  alternates: { canonical: `${SITE.url}/methods` },
};

export default function MethodsPage() {
  const tests = getAllTests();
  return (
    <>
      <h1>Научные паспорта методик</h1>
      <p className="lead">
        Для каждой методики мы указываем происхождение, психометрический статус, ограничения и правовое основание
        использования. Если чего-то не знаем — пишем прямо, а не обходим молчанием.
      </p>

      <div className="grid">
        {tests.map((test) => (
          <Link key={test.slug} href={`/methods/${test.slug}`} className="card">
            <h3>{test.title}</h3>
            <p className="small muted" style={{ margin: 0 }}>
              {test.passport.rightsBasis === "public_domain"
                ? "Общественное достояние"
                : test.passport.rightsBasis === "own_work"
                  ? "Собственная разработка"
                  : "По лицензии"}{" "}
              · {test.questions.length} пунктов
            </p>
          </Link>
        ))}
      </div>

      <div className="cta">
        <h2>Вы психолог или консультант?</h2>
        <p>
          Клиенты приходят сюда с готовым результатом — с ним удобно начинать первую встречу. На {SITE.platform.name}{" "}
          можно вести консультации: профиль со специализацией, онлайн-запись и оплата, никаких откликов за деньги.
        </p>
        <p>
          <a className="btn" href={platformLink({ campaign: "methods_index", content: "expert" })} rel="noopener">
            Как вести практику на {SITE.platform.name}
          </a>
        </p>
      </div>
    </>
  );
}
