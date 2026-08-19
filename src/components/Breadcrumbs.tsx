import Link from "next/link";
import { SITE } from "@/lib/site";

export type Crumb = { name: string; href: string };

/** Хлебные крошки + разметка BreadcrumbList: помогает и людям, и выдаче. */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.href === "/" ? "" : item.href}`,
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="crumbs" aria-label="Хлебные крошки">
        {items.map((item, i) => (
          <span key={item.href}>
            {i > 0 && <span aria-hidden="true"> / </span>}
            {i === items.length - 1 ? <span>{item.name}</span> : <Link href={item.href}>{item.name}</Link>}
          </span>
        ))}
      </nav>
    </>
  );
}
