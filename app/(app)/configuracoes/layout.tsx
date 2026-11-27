import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Tema, conta e saída do Wishly.",
  alternates: { canonical: "/configuracoes" },
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}
