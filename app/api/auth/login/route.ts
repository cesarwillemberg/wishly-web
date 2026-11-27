import { NextResponse } from "next/server";

import { loginAccount } from "@/lib/api/auth";
import { cleanEmail, passwordError } from "@/lib/api/parse";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/cookie";

export async function POST(request: Request) {
  return authenticate(request, loginAccount);
}

async function authenticate(
  request: Request,
  call: (email: string, password: string) => ReturnType<typeof loginAccount>,
) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Informe um e-mail válido." }, { status: 400 });
  }
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const email = typeof record.email === "string" ? cleanEmail(record.email) : null;
  const password = typeof record.password === "string" ? record.password : "";
  if (!email) return NextResponse.json({ message: "Informe um e-mail válido." }, { status: 400 });
  const invalidPassword = passwordError(password);
  if (invalidPassword) return NextResponse.json({ message: invalidPassword }, { status: 400 });

  const result = await call(email, password);
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });

  const response = NextResponse.json({ user: result.user });
  response.cookies.set(SESSION_COOKIE, result.token, sessionCookieOptions(request));
  return response;
}
