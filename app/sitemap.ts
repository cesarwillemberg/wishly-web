import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteUrl()}/entrar`,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
