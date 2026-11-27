import {
  parseCategory,
  parseItem,
  parseList,
  parseListsPayload,
  parseSnapshot,
  type ListSnapshot,
  type WishCategory,
  type WishItem,
  type WishList,
} from "./domain";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function bff(path: string, init?: RequestInit): Promise<unknown> {
  const headers = new Headers(init?.headers);
  headers.set("accept", "application/json");
  if (init?.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  const response = await fetch(`/api/bff/${path}`, { ...init, headers });
  if (response.status === 401 && typeof window !== "undefined") {
    // The cookie is httpOnly, so only a navigation to the route handler can clear it.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/api/auth/clear";
  }
  if (response.status === 204) return null;
  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = null;
    }
  }
  if (!response.ok) {
    const record = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    const detail = typeof record.detail === "string" ? record.detail : null;
    const message = detail || (typeof record.message === "string" ? record.message : null);
    throw new ApiError(message || "Não foi possível concluir agora.", response.status);
  }
  return data;
}

function json(body: unknown): RequestInit {
  return { body: JSON.stringify(body) };
}

export function fetchLists() {
  return bff("lists").then(parseListsPayload);
}

export function createList(name: string) {
  return bff("lists", { method: "POST", ...json({ name }) }).then((data) => {
    const list = parseList(data);
    if (!list) throw new ApiError("Resposta inesperada do servidor.", 502);
    return list;
  });
}

export function renameList(id: string, name: string) {
  return bff(`lists/${id}`, { method: "PATCH", ...json({ name }) }).then((data) => {
    const list = parseList(data);
    if (!list) throw new ApiError("Resposta inesperada do servidor.", 502);
    return list;
  });
}

export function deleteList(id: string) {
  return bff(`lists/${id}`, { method: "DELETE" });
}

export function fetchSnapshot(id: string): Promise<ListSnapshot> {
  return bff(`lists/${id}/items`).then(parseSnapshot);
}

export function createItem(listId: string, body: Record<string, unknown>) {
  return bff(`lists/${listId}/items`, { method: "POST", ...json(body) }).then(requireItem);
}

export function updateItem(id: string, body: Record<string, unknown>) {
  return bff(`items/${id}`, { method: "PATCH", ...json(body) }).then(requireItem);
}

export function deleteItem(id: string) {
  return bff(`items/${id}`, { method: "DELETE" });
}

export function refreshItem(id: string) {
  return bff(`items/${id}/refresh`, { method: "POST" }).then(requireItem);
}

export function reorderItems(listId: string, ids: string[]) {
  return bff(`lists/${listId}/items/reorder`, { method: "POST", ...json({ ids }) });
}

export function createCategory(listId: string, name: string) {
  return bff(`lists/${listId}/categories`, { method: "POST", ...json({ name }) }).then(
    requireCategory,
  );
}

export function renameCategory(id: string, name: string) {
  return bff(`categories/${id}`, { method: "PATCH", ...json({ name }) }).then(requireCategory);
}

export function deleteCategory(id: string) {
  return bff(`categories/${id}`, { method: "DELETE" });
}

export function reorderCategories(listId: string, ids: string[]) {
  return bff(`lists/${listId}/categories/reorder`, { method: "POST", ...json({ ids }) }).then(
    (data) => {
      const raw =
        data && typeof data === "object" ? (data as { categories?: unknown }).categories : null;
      if (!Array.isArray(raw)) return [];
      return raw.flatMap((entry) => {
        const category = parseCategory(entry);
        return category ? [category] : [];
      });
    },
  );
}

export function itemImageSrc(item: WishItem): string {
  return `/api/bff/items/${item.id}/image?v=${encodeURIComponent(item.updatedAt)}`;
}

function requireItem(data: unknown): WishItem {
  const item = parseItem(data);
  if (!item) throw new ApiError("Resposta inesperada do servidor.", 502);
  return item;
}

function requireCategory(data: unknown): WishCategory {
  const category = parseCategory(data);
  if (!category) throw new ApiError("Resposta inesperada do servidor.", 502);
  return category;
}

export type { WishList };
