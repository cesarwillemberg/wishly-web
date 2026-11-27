import "server-only";

import { cookies, headers } from "next/headers";

import { fetchCurrentUser } from "@/lib/api/auth";
import type { SessionUser } from "@/lib/api/parse";
import { safeNextPath } from "@/lib/navigation";

import { SESSION_COOKIE } from "./cookie";

export type LoadedSession =
  | { status: "anonymous" }
  | { status: "invalid"; next: string }
  | { status: "ok"; user: SessionUser }
  | { status: "unreachable"; message: string };

export async function loadSession(): Promise<LoadedSession> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return { status: "anonymous" };
  const result = await fetchCurrentUser(token);
  if (result.status === "invalid") {
    const path = (await headers()).get("x-wishly-path");
    return { status: "invalid", next: safeNextPath(path) };
  }
  return result;
}
