const blockedRetryMessage =
  "A loja bloqueou a busca automática. Edite o preço ou toque em Tentar de novo.";
const genericRetryMessage =
  "Não consegui atualizar agora. Edite o preço ou toque em Tentar de novo.";

/** One short line for the card, matching the Flutter scrape copy. */
export function conciseScrapeMessage(raw: string): string {
  const trimmed = raw.replaceAll(/\s+/g, " ").trim();
  const keptAt = trimmed.toLowerCase().indexOf("mantivemos ");
  const head = (keptAt > 0 ? trimmed.slice(0, keptAt) : trimmed).trim();
  const folded = head.toLowerCase();
  if (folded.includes("bloqueia") || folded.includes("bloqueou")) return blockedRetryMessage;
  if (keptAt > 0) {
    if (!head) return genericRetryMessage;
    const end = head.endsWith(".") || head.endsWith("!") || head.endsWith("?") ? "" : ".";
    return `${head}${end}`;
  }
  return trimmed;
}

export function offerScrapeRetry(status: string, message?: string | null): boolean {
  if (status !== "failed" && status !== "partial") return false;
  const text = message ?? "";
  if (text.startsWith("Atualizamos")) return false;
  return (
    status === "failed" || text.includes("Tentar de novo") || text.toLowerCase().includes("bloque")
  );
}
