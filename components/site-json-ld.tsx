import { organizationJsonLd, siteUrl, websiteJsonLd } from "@/lib/seo";

export function SiteJsonLd() {
  const url = siteUrl();
  const data = [organizationJsonLd(url), websiteJsonLd(url)];
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
