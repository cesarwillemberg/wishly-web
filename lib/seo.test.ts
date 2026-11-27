import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { hasAnalytics, readAnalyticsIds } from "./analytics.ts";
import { organizationJsonLd, siteUrl, websiteJsonLd } from "./seo.ts";
import { parseSharePreview, shareDescription } from "./share-preview.ts";

test("site url falls back to the Vercel host and drops a trailing slash", () => {
  assert.equal(siteUrl({}), "https://wishly-web-sigma.vercel.app");
  assert.equal(
    siteUrl({ NEXT_PUBLIC_SITE_URL: "https://wishly.example/" }),
    "https://wishly.example",
  );
});

test("organization and website json-ld keep the required shape", () => {
  const url = "https://wishly-web-sigma.vercel.app";
  const organization = organizationJsonLd(url);
  const website = websiteJsonLd(url);
  assert.equal(organization["@context"], "https://schema.org");
  assert.equal(organization["@type"], "Organization");
  assert.equal(organization.name, "Wishly");
  assert.equal(organization.url, url);
  assert.equal(typeof organization.logo, "string");
  assert.equal(website["@type"], "WebSite");
  assert.equal(website.name, "Wishly");
  assert.equal(website.url, url);
});

test("analytics ids are injected only when they match the vendor shape", () => {
  const empty = readAnalyticsIds({});
  assert.equal(hasAnalytics(empty), false);
  const ids = readAnalyticsIds({
    NEXT_PUBLIC_GA4_ID: "G-ABC123",
    NEXT_PUBLIC_GOOGLE_ADS_ID: "AW-123",
    NEXT_PUBLIC_META_PIXEL_ID: "1234567890",
    NEXT_PUBLIC_CLARITY_ID: "abcd1234",
  });
  assert.deepEqual(ids, {
    ga4: "G-ABC123",
    ads: "AW-123",
    meta: "1234567890",
    clarity: "abcd1234",
  });
  const rejected = readAnalyticsIds({
    NEXT_PUBLIC_GA4_ID: "https://evil.example/script.js",
    NEXT_PUBLIC_GOOGLE_ADS_ID: "not-an-id",
    NEXT_PUBLIC_META_PIXEL_ID: "abc",
    NEXT_PUBLIC_CLARITY_ID: "bad id",
  });
  assert.equal(hasAnalytics(rejected), false);
});

test("the pixel loader waits for the first interaction and has no idle fallback", () => {
  const loader = readFileSync("components/deferred-analytics.tsx", "utf8");
  const events = readFileSync("lib/analytics.ts", "utf8");
  assert.equal(loader.includes("requestIdleCallback"), false);
  assert.equal(loader.includes("setTimeout"), false);
  assert.equal(events.includes("requestIdleCallback"), false);
  for (const event of ["pointerdown", "keydown", "scroll", "touchstart"]) {
    assert.equal(events.includes(`"${event}"`), true);
  }
  assert.equal(loader.includes("INTERACTION_EVENTS"), true);
});

test("a public share preview uses the list name and the item count", () => {
  const preview = parseSharePreview({
    list: { name: " Casa " },
    items: [{ id: "1" }, { id: "2" }],
  });
  assert.deepEqual(preview, { name: "Casa", itemCount: 2 });
  assert.equal(shareDescription(preview!), "Casa · 2 itens no Wishly.");
  assert.equal(parseSharePreview({ items: [] }), null);
});
