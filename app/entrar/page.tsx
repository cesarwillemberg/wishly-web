import { Suspense } from "react";

import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Entrar" };

export default function EntrarPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-paper" />}>
      <AuthForm />
    </Suspense>
  );
}
