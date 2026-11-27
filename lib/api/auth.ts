import "server-only";

import { createWishlyClient } from "./client";
import {
  messageFromApi,
  networkMessage,
  parseAuthPayload,
  parseUser,
  toSessionUser,
  type SessionUser,
} from "./parse";

type AuthResult =
  { ok: true; token: string; user: SessionUser } | { ok: false; status: number; message: string };

async function postAuth(
  path: "/api/auth/login" | "/api/auth/register",
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    const client = createWishlyClient();
    const result =
      path === "/api/auth/login"
        ? await client.POST("/api/auth/login", { body: { email, password } })
        : await client.POST("/api/auth/register", { body: { email, password } });
    if (!result.response.ok) {
      return {
        ok: false,
        status: result.response.status,
        message: messageFromApi(result.error, result.response.status),
      };
    }
    const parsed = parseAuthPayload(result.data);
    if (!parsed) {
      return { ok: false, status: 502, message: "Resposta inesperada do servidor." };
    }
    return { ok: true, token: parsed.token, user: toSessionUser(parsed.user) };
  } catch (error) {
    const timedOut =
      error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
    return { ok: false, status: timedOut ? 504 : 503, message: networkMessage(error) };
  }
}

export function loginAccount(email: string, password: string) {
  return postAuth("/api/auth/login", email, password);
}

export function registerAccount(email: string, password: string) {
  return postAuth("/api/auth/register", email, password);
}

export type CurrentUserResult =
  | { status: "ok"; user: SessionUser }
  | { status: "invalid" }
  | { status: "unreachable"; message: string };

export async function fetchCurrentUser(token: string): Promise<CurrentUserResult> {
  try {
    const client = createWishlyClient(token);
    const result = await client.GET("/api/me", {
      params: { header: { authorization: `Bearer ${token}` } },
    });
    if (result.response.status === 401) return { status: "invalid" };
    if (!result.response.ok) {
      return {
        status: "unreachable",
        message: messageFromApi(result.error, result.response.status),
      };
    }
    const user = parseUser(result.data);
    if (!user) return { status: "unreachable", message: "Resposta inesperada do servidor." };
    return { status: "ok", user: toSessionUser(user) };
  } catch (error) {
    return { status: "unreachable", message: networkMessage(error) };
  }
}
