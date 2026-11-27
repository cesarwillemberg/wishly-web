export const SESSION_COOKIE = "wishly_session";

/** The API issues JWTs for 30 days (`token_version` still revokes them). */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function isHttps(request: Request) {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0]?.trim() === "https";
  return new URL(request.url).protocol === "https:";
}

export function sessionCookieOptions(request: Request, maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isHttps(request),
    path: "/",
    maxAge,
  };
}
