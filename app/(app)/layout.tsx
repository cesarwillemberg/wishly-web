import { io } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { PrivateFallback, Unreachable } from "@/components/placeholders";
import { loadSession } from "@/lib/auth/session";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PrivateFallback />}>
      <PrivateFrame>{children}</PrivateFrame>
    </Suspense>
  );
}

async function PrivateFrame({ children }: { children: ReactNode }) {
  await io();
  const session = await loadSession();
  if (session.status === "anonymous") redirect("/entrar");
  if (session.status === "invalid") {
    const next = session.next !== "/" ? `?next=${encodeURIComponent(session.next)}` : "";
    redirect(`/api/auth/clear${next}`);
  }
  if (session.status === "unreachable") return <Unreachable message={session.message} />;
  return <AppShell user={session.user}>{children}</AppShell>;
}
