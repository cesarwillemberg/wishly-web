import "server-only";

import createClient from "openapi-fetch";

import type { paths } from "./schema";

export const API_TIMEOUT_MS = 70_000;

export function apiBaseUrl(): string {
  const raw = process.env.API_BASE_URL?.trim() || "https://lista-desejos-backend.onrender.com";
  return raw.replace(/\/+$/, "");
}

function fetchWithTimeout(input: Request): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const signal = input.signal
    ? AbortSignal.any([input.signal, controller.signal])
    : controller.signal;
  return fetch(input, { signal, cache: "no-store" }).finally(() => clearTimeout(timer));
}

export function createWishlyClient(token?: string) {
  return createClient<paths>({
    baseUrl: apiBaseUrl(),
    headers: {
      accept: "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    fetch: fetchWithTimeout,
  });
}
