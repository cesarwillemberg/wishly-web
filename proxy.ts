import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/cookie";
import { safeNextPath } from "@/lib/navigation";

const PRIVATE = [
  /^\/$/,
  /^\/configuracoes(?:\/|$)/,
  /^\/list(?:\/|$)/,
  /^\/compartilhar(?:\/|$)/,
  /^\/c(?:\/|$)/,
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const isPrivate = PRIVATE.some((pattern) => pattern.test(pathname));

  if (isPrivate && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = "";
    const next = `${pathname}${request.nextUrl.search}`;
    if (next !== "/") url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }

  if (pathname === "/entrar" && token) {
    return NextResponse.redirect(
      new URL(safeNextPath(request.nextUrl.searchParams.get("next")), request.url),
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-wishly-path", `${pathname}${request.nextUrl.search}`);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
