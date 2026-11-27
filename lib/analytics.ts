export const INTERACTION_EVENTS = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

const GA4_ID = /^G-[A-Z0-9]+$/;
const ADS_ID = /^AW-\d+$/;
const META_ID = /^\d{5,20}$/;
const CLARITY_ID = /^[a-z0-9]{4,32}$/i;

export type AnalyticsIds = {
  ga4: string | null;
  ads: string | null;
  meta: string | null;
  clarity: string | null;
};

function match(value: string | undefined, pattern: RegExp): string | null {
  const trimmed = value?.trim() ?? "";
  return pattern.test(trimmed) ? trimmed : null;
}

export function readAnalyticsIds(env: NodeJS.ProcessEnv = process.env): AnalyticsIds {
  return {
    ga4: match(env.NEXT_PUBLIC_GA4_ID, GA4_ID),
    ads: match(env.NEXT_PUBLIC_GOOGLE_ADS_ID, ADS_ID),
    meta: match(env.NEXT_PUBLIC_META_PIXEL_ID, META_ID),
    clarity: match(env.NEXT_PUBLIC_CLARITY_ID, CLARITY_ID),
  };
}

export function hasAnalytics(ids: AnalyticsIds): boolean {
  return Boolean(ids.ga4 || ids.ads || ids.meta || ids.clarity);
}

export function gtagSnippet(ids: AnalyticsIds): string | null {
  const primary = ids.ga4 ?? ids.ads;
  if (!primary) return null;
  const configs = [ids.ga4, ids.ads].filter((id): id is string => Boolean(id));
  const lines = configs.map((id) => `gtag('config', '${id}');`).join("");
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());${lines}`;
}

export function gtagSrc(ids: AnalyticsIds): string | null {
  const primary = ids.ga4 ?? ids.ads;
  if (!primary) return null;
  return `https://www.googletagmanager.com/gtag/js?id=${primary}`;
}

export function metaSnippet(id: string): string {
  return `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${id}');fbq('track', 'PageView');`;
}

export function claritySnippet(id: string): string {
  return `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${id}");`;
}
