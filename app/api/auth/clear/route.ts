import { NextResponse } from "next/server";

import { safeNextPath } from "@/lib/navigation";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/cookie";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"));
  const destination = new URL("/entrar", url);
  if (next !== "/") destination.searchParams.set("next", next);
  const response = NextResponse.redirect(destination);
  response.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(request, 0));
  return response;
}
