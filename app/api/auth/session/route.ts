import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { fetchCurrentUser } from "@/lib/api/auth";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/cookie";

export async function GET(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });
  const result = await fetchCurrentUser(token);
  if (result.status === "ok") return NextResponse.json({ user: result.user });
  if (result.status === "invalid") {
    const response = NextResponse.json({ user: null }, { status: 401 });
    response.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(request, 0));
    return response;
  }
  return NextResponse.json({ message: result.message }, { status: 503 });
}
