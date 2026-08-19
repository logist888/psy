"use client";

import { track } from "@/lib/analytics";

/** Экспертный CTA: отдельная воронка — психолог, а не клиент. */
export default function ExpertCta({
  href,
  placement,
  children,
}: {
  href: string;
  placement: string;
  children: React.ReactNode;
}) {
  return (
    <a className="btn" href={href} rel="noopener" onClick={() => track({ name: "expert_cta_click", placement })}>
      {children}
    </a>
  );
}
