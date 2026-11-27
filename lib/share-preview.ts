export type SharePreview = {
  name: string;
  itemCount: number;
};

export function shareTokenOk(token: string): boolean {
  return token.length >= 8 && token.length <= 200 && !/[^A-Za-z0-9_-]/.test(token);
}

export function parseSharePreview(value: unknown): SharePreview | null {
  if (!value || typeof value !== "object") return null;
  const record = value as { list?: { name?: unknown }; items?: unknown };
  const name = typeof record.list?.name === "string" ? record.list.name.trim() : "";
  if (!name) return null;
  const itemCount = Array.isArray(record.items) ? record.items.length : 0;
  return { name, itemCount };
}

export function shareDescription(preview: SharePreview): string {
  const items = preview.itemCount === 1 ? "1 item" : `${preview.itemCount} itens`;
  return `${preview.name} · ${items} no Wishly.`;
}
