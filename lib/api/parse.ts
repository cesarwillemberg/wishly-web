const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export type ApiUser = {
  id: string;
  email: string;
  displayName: string | null;
  hasAvatar: boolean;
  avatarAt: string | null;
  emailPriceAlerts: boolean;
  createdAt: string | null;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  displayName: string | null;
};

export function cleanEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 200) return null;
  return email;
}

export function passwordError(value: string): string | null {
  if (value.length < 8) return "A senha precisa ter pelo menos 8 caracteres.";
  if (value.length > 200) return "A senha é longa demais.";
  return null;
}

export function displayNameOf(user: Pick<ApiUser, "email" | "displayName">): string {
  const typed = user.displayName?.trim() ?? "";
  if (typed) return typed;
  const local = user.email.split("@")[0]?.trim() ?? "";
  return local || user.email;
}

export function toSessionUser(user: ApiUser): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: displayNameOf(user),
    displayName: user.displayName,
  };
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function parseUser(value: unknown): ApiUser | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || typeof record.email !== "string") return null;
  return {
    id: record.id,
    email: record.email,
    displayName: stringOrNull(record.display_name),
    hasAvatar: record.has_avatar === true,
    avatarAt: stringOrNull(record.avatar_at),
    emailPriceAlerts: record.email_price_alerts !== false,
    createdAt: stringOrNull(record.created_at),
  };
}

export function parseAuthPayload(value: unknown): { token: string; user: ApiUser } | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.token !== "string" || record.token.length === 0) return null;
  const user = parseUser(record.user);
  if (!user) return null;
  return { token: record.token, user };
}

export function messageFromApi(error: unknown, status: number): string {
  if (error && typeof error === "object" && "detail" in error) {
    const detail = (error as { detail?: unknown }).detail;
    if (typeof detail === "string" && detail.trim()) return detail;
  }
  if (status === 401) return "E-mail ou senha incorretos.";
  if (status === 404) return "Não encontramos esse item.";
  return "Não foi possível concluir agora.";
}

export function networkMessage(error: unknown): string {
  if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
    return "O servidor demorou demais para responder. Tente de novo.";
  }
  return "Não foi possível falar com o servidor.";
}
