import type { Metadata } from "next";

import { Soon } from "@/components/placeholders";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return {
    title: "Convite",
    description: "Convite para uma lista do Wishly.",
    alternates: { canonical: `/c/${code}` },
  };
}

export default function InvitePlaceholder() {
  return (
    <Soon
      title="Convite"
      body="Aceitar um convite de lista entra numa etapa seguinte. O link antigo já abre esta página."
    />
  );
}
