"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell, UserContext } from "@/components/app-shell";
import type { SessionUser } from "@/lib/api/parse";

export function PrivateChrome({ user, children }: { user: SessionUser; children: ReactNode }) {
  const pathname = usePathname();
  const frame = /^\/list\/[^/]+$/.test(pathname) ? (
    children
  ) : (
    <AppShell user={user}>{children}</AppShell>
  );
  return <UserContext value={user}>{frame}</UserContext>;
}
