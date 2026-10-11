"use client";

import { track } from "@vercel/analytics";
import { schoolConfig, schoolLink } from "@/lib/site";

// 運営元のスクールへの案内。本の推薦とは混ぜず、「運営元」と明記して表示する。
export function SchoolCta({ goalSlug, placement, title, body }: { goalSlug: string; placement: string; title: string; body: string }) {
  return (
    <aside className="school-cta" aria-label="運営元のスクールの案内">
      <small>運営元のスクール</small>
      <h3>{title}</h3>
      <p>{body}</p>
      <a
        href={schoolLink(goalSlug, placement)}
        target="_blank"
        rel="noreferrer"
        onClick={() => track("school_cta_click", { goal: goalSlug, placement })}
      >
        {schoolConfig.name}で相談する<span className="sr-only">（新しいタブで開きます）</span> ↗
      </a>
    </aside>
  );
}
