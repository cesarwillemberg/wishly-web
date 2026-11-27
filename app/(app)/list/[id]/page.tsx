import type { Metadata } from "next";

import { ListDetail } from "@/components/lists/list-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Lista",
    description: "Itens de uma lista de desejos no Wishly.",
    alternates: { canonical: `/list/${id}` },
  };
}

export default async function ListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ListDetail listId={id} />;
}
