import { NextResponse } from "next/server";

import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/cookie";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/entrar", request.url), 303);
  response.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(request, 0));
  return response;
}
