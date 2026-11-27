export const SITE_NAME = "Wishly";
export const SITE_DESCRIPTION = "Suas listas de desejos, com foto e preço da loja.";
export const DEFAULT_SITE_URL = "https://wishly-web-sigma.vercel.app";

export function siteUrl(env: NodeJS.ProcessEnv = process.env): string {
  const raw = env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, "");
}

export function organizationJsonLd(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url,
    logo: `${url}/icons/icon-512.webp`,
  };
}

export function websiteJsonLd(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url,
    inLanguage: "pt-BR",
  };
}
