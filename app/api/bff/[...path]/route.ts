import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { API_TIMEOUT_MS, apiBaseUrl } from "@/lib/api/client";
import { SESSION_COOKIE } from "@/lib/auth/cookie";
import { allowedBackendPath } from "@/lib/bff-path";

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: Request, context: RouteContext, method: string) {
  const backendPath = allowedBackendPath((await context.params).path);
  if (!backendPath) {
    return NextResponse.json({ message: "Não encontramos esse caminho." }, { status: 404 });
  }
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: "Faça login para continuar." }, { status: 401 });
  }

  const incoming = new URL(request.url);
  const headers = new Headers();
  headers.set("accept", request.headers.get("accept") || "*/*");
  headers.set("authorization", `Bearer ${token}`);
  const contentType = request.headers.get("content-type");
  if (contentType && method !== "GET" && method !== "HEAD")
    headers.set("content-type", contentType);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();
    const response = await fetch(`${apiBaseUrl()}/api/${backendPath}${incoming.search}`, {
      method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      signal: controller.signal,
      cache: "no-store",
    });
    const payload = await response.arrayBuffer();
    const outgoing = new Headers();
    const type = response.headers.get("content-type");
    if (type) outgoing.set("content-type", type);
    outgoing.set("cache-control", "private, no-store");
    return new NextResponse(payload, { status: response.status, headers: outgoing });
  } catch (error) {
    const timedOut =
      error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError");
    return NextResponse.json(
      {
        message: timedOut
          ? "O servidor demorou demais para responder. Tente de novo."
          : "Não foi possível falar com o servidor.",
      },
      { status: timedOut ? 504 : 503 },
    );
  } finally {
    clearTimeout(timer);
  }
}

export function GET(request: Request, context: RouteContext) {
  return proxy(request, context, "GET");
}

export function POST(request: Request, context: RouteContext) {
  return proxy(request, context, "POST");
}

export function PATCH(request: Request, context: RouteContext) {
  return proxy(request, context, "PATCH");
}

export function PUT(request: Request, context: RouteContext) {
  return proxy(request, context, "PUT");
}

export function DELETE(request: Request, context: RouteContext) {
  return proxy(request, context, "DELETE");
}
