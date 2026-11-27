import type { Metadata } from "next";

import { Soon } from "@/components/placeholders";

export const metadata: Metadata = {
  title: "Adicionar da web",
  description: "Guardar um link compartilhado pelo navegador.",
  alternates: { canonical: "/compartilhar" },
};

export default function ShareInPlaceholder() {
  return (
    <Soon
      title="Adicionar da web"
      body="Guardar um link compartilhado pelo navegador entra numa etapa seguinte. O endereço antigo já abre esta página."
    />
  );
}
