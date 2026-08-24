import type { MetadataRoute } from "next";
import { getPublishedSituations } from "@/lib/content";
import { siteConfig } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/decisions", "/books", "/methodology", "/governance", "/labs", "/about", "/changelog"];
  return [
    ...staticPages.map((pathname) => ({ url: `${siteConfig.url}${pathname}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: pathname === "" ? 1 : 0.6 })),
    ...getPublishedSituations().map((item) => ({ url: `${siteConfig.url}/decisions/${item.slug}`, lastModified: item.lastReviewed, changeFrequency: "monthly" as const, priority: 0.9 }))
  ];
}
