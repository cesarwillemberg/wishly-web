import type { Metadata } from "next";
import { io } from "next/cache";
import { Suspense } from "react";

import { PublicSoon } from "@/components/placeholders";
import { apiBaseUrl } from "@/lib/api/client";
import { SITE_NAME } from "@/lib/seo";
import {
  parseSharePreview,
  shareDescription,
  shareTokenOk,
  type SharePreview,
} from "@/lib/share-preview";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  let preview: SharePreview | null = null;
  if (shareTokenOk(token)) {
    try {
      const response = await fetch(`${apiBaseUrl()}/api/share/${encodeURIComponent(token)}`, {
        headers: { accept: "application/json" },
        next: { revalidate: 60 },
      });
      if (response.ok) preview = parseSharePreview(await response.json());
    } catch {
      preview = null;
    }
  }
  const title = preview?.name ?? "Lista compartilhada";
  const description = preview
    ? shareDescription(preview)
    : "Uma lista de desejos compartilhada no Wishly.";
  const canonical = `/l/${token}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      url: canonical,
      type: "website",
      locale: "pt_BR",
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_NAME}`,
      description,
      images: ["/og.jpg"],
    },
  };
}

async function DynamicShare() {
  await io();
  return null;
}

export default function SharedPlaceholder() {
  return (
    <>
      <Suspense fallback={null}>
        <DynamicShare />
      </Suspense>
      <PublicSoon
        title="Lista compartilhada"
        body="A página pública da lista entra numa etapa seguinte. O link antigo já abre este endereço."
      />
    </>
  );
}
