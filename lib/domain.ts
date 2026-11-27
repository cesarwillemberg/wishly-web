import { sumPrices, type MoneyTotal } from "./money";

export type ListRole = "owner" | "editor" | "viewer";

export type ListMember = {
  userId: string;
  email: string;
  label: string;
  initials: string;
  role: string;
};

export type WishList = {
  id: string;
  name: string;
  shareToken: string | null;
  itemCount: number;
  unpricedCount: number;
  totals: MoneyTotal[];
  purchasedTotals: MoneyTotal[];
  role: ListRole;
  collaborative: boolean;
  members: ListMember[];
  budget: number | null;
  budgetCurrency: string | null;
};

export type WishCategory = {
  id: string;
  name: string;
  position: number;
};

export type WishItem = {
  id: string;
  name: string;
  url: string;
  imageUrl: string | null;
  price: number | null;
  currency: string | null;
  store: string | null;
  status: string;
  message: string | null;
  listId: string | null;
  categoryId: string | null;
  purchased: boolean;
  priority: string;
  position: number;
  note: string | null;
  color: string | null;
  sizeLabel: string | null;
  voltage: string | null;
  quantity: number | null;
  createdAt: string;
  updatedAt: string;
};

export type ListSnapshot = {
  items: WishItem[];
  categories: WishCategory[];
  list: WishList | null;
  unpricedCount: number;
};

export function roleLabel(role: string): string {
  if (role === "owner") return "Dono";
  if (role === "editor") return "Pode editar";
  if (role === "viewer") return "Só pode ver";
  return role;
}

export function canEditRole(role: string): boolean {
  return role !== "viewer";
}

export function isOwnerRole(role: string): boolean {
  return role === "owner";
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function moneyList(value: unknown): MoneyTotal[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>;
    return [{ currency: asString(record.currency) ?? "", amount: asNumber(record.amount) ?? 0 }];
  });
}

function members(value: unknown): ListMember[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const record = entry as Record<string, unknown>;
    if (typeof record.user_id !== "string") return [];
    return [
      {
        userId: record.user_id,
        email: asString(record.email) ?? "",
        label: asString(record.label) ?? "",
        initials: asString(record.initials) ?? "?",
        role: asString(record.role) ?? "viewer",
      },
    ];
  });
}

function asRole(value: unknown): ListRole {
  if (value === "editor" || value === "viewer" || value === "owner") return value;
  return "owner";
}

export function parseList(value: unknown): WishList | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || typeof record.name !== "string") return null;
  return {
    id: record.id,
    name: record.name,
    shareToken: asString(record.share_token),
    itemCount: asNumber(record.item_count) ?? 0,
    unpricedCount: asNumber(record.unpriced_count) ?? 0,
    totals: moneyList(record.totals),
    purchasedTotals: moneyList(record.purchased_totals),
    role: asRole(record.role),
    collaborative: record.collaborative === true,
    members: members(record.members),
    budget: asNumber(record.budget),
    budgetCurrency: asString(record.budget_currency),
  };
}

export function parseListsPayload(value: unknown): WishList[] {
  if (!value || typeof value !== "object") return [];
  const raw = (value as { lists?: unknown }).lists;
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry) => {
    const list = parseList(entry);
    return list ? [list] : [];
  });
}

export function parseCategory(value: unknown): WishCategory | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || typeof record.name !== "string") return null;
  return { id: record.id, name: record.name, position: asNumber(record.position) ?? 0 };
}

export function parseItem(value: unknown): WishItem | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || typeof record.name !== "string") return null;
  return {
    id: record.id,
    name: record.name,
    url: asString(record.url) ?? "",
    imageUrl: asString(record.image_url),
    price: asNumber(record.price),
    currency: asString(record.currency),
    store: asString(record.store),
    status: asString(record.status) ?? "failed",
    message: asString(record.message),
    listId: asString(record.list_id),
    categoryId: asString(record.category_id),
    purchased: record.purchased === true,
    priority: asString(record.priority) ?? "quero",
    position: asNumber(record.position) ?? 0,
    note: asString(record.note),
    color: asString(record.color),
    sizeLabel: asString(record.size_label),
    voltage: asString(record.voltage),
    quantity: asNumber(record.quantity),
    createdAt: asString(record.created_at) ?? "",
    updatedAt: asString(record.updated_at) ?? "",
  };
}

export function parseSnapshot(value: unknown): ListSnapshot {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const items = Array.isArray(record.items)
    ? record.items.flatMap((entry) => {
        const item = parseItem(entry);
        return item ? [item] : [];
      })
    : [];
  const categories = Array.isArray(record.categories)
    ? record.categories
        .flatMap((entry) => {
          const category = parseCategory(entry);
          return category ? [category] : [];
        })
        .sort((a, b) => a.position - b.position)
    : [];
  return {
    items,
    categories,
    list: parseList(record.list),
    unpricedCount:
      asNumber(record.unpriced_count) ?? items.filter((item) => item.price == null).length,
  };
}

export function listTotals(list: WishList): { pending: MoneyTotal[]; bought: MoneyTotal[] } {
  if (list.totals.length || list.purchasedTotals.length) {
    return { pending: list.totals, bought: list.purchasedTotals };
  }
  return { pending: [], bought: [] };
}

export function snapshotTotals(items: WishItem[]): { pending: MoneyTotal[]; bought: MoneyTotal[] } {
  return {
    pending: sumPrices(items.filter((item) => !item.purchased)),
    bought: sumPrices(items.filter((item) => item.purchased)),
  };
}
