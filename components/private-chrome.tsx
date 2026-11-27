"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import type { SessionUser } from "@/lib/api/parse";

export function PrivateChrome({ user, children }: { user: SessionUser; children: ReactNode }) {
  const pathname = usePathname();
  if (/^\/list\/[^/]+$/.test(pathname)) return children;
  return <AppShell user={user}>{children}</AppShell>;
}
