export type SortKey =
  "manual" | "price_asc" | "price_desc" | "date" | "store" | "name" | "priority";

type ArrangedItem = {
  id: string;
  name: string;
  price: number | null;
  currency: string | null;
  store: string | null;
  categoryId: string | null;
  purchased: boolean;
  priority: string;
  position: number;
  note: string | null;
  color: string | null;
  sizeLabel: string | null;
  voltage: string | null;
  createdAt: string;
};

type ArrangedCategory = { id: string; position: number };

export const SORTS: { value: SortKey; label: string }[] = [
  { value: "manual", label: "Manual" },
  { value: "price_asc", label: "Preço ↑" },
  { value: "price_desc", label: "Preço ↓" },
  { value: "date", label: "Data" },
  { value: "store", label: "Loja" },
  { value: "name", label: "Nome" },
  { value: "priority", label: "Prioridade" },
];

export function isSortKey(value: string | null): value is SortKey {
  return SORTS.some((entry) => entry.value === value);
}

export type ItemGroup<T extends ArrangedItem = ArrangedItem> = {
  id: string | null;
  name: string;
  items: T[];
};

function priorityRank(value: string): number {
  if (value === "muito") return 0;
  if (value === "talvez") return 2;
  return 1;
}

export function arrangeItems<T extends ArrangedItem>(
  source: T[],
  options: { query: string; priority: string; sort: SortKey; hidePurchased: boolean },
): T[] {
  const query = options.query.trim().toLowerCase();
  const items = source.filter((item) => {
    if (options.hidePurchased && item.purchased) return false;
    if (options.priority !== "todas" && item.priority !== options.priority) return false;
    if (!query) return true;
    const details = `${item.color ?? ""} ${item.sizeLabel ?? ""} ${item.voltage ?? ""}`;
    return (
      item.name.toLowerCase().includes(query) ||
      (item.store ?? "").toLowerCase().includes(query) ||
      (item.note ?? "").toLowerCase().includes(query) ||
      details.toLowerCase().includes(query)
    );
  });
  items.sort((a, b) => {
    switch (options.sort) {
      case "price_asc":
        return (a.price ?? 1e12) - (b.price ?? 1e12);
      case "price_desc":
        return (b.price ?? -1) - (a.price ?? -1);
      case "name":
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      case "store":
        return (a.store ?? "").toLowerCase().localeCompare((b.store ?? "").toLowerCase());
      case "priority":
        return priorityRank(a.priority) - priorityRank(b.priority);
      case "date":
        return b.createdAt.localeCompare(a.createdAt);
      default: {
        const byPosition = a.position - b.position;
        if (byPosition !== 0) return byPosition;
        return a.createdAt.localeCompare(b.createdAt);
      }
    }
  });
  return items;
}

export function canReorder(options: {
  canEdit: boolean;
  sort: SortKey;
  query: string;
  priority: string;
  hidePurchased: boolean;
}): boolean {
  return (
    options.canEdit &&
    options.sort === "manual" &&
    options.query.trim() === "" &&
    options.priority === "todas" &&
    !options.hidePurchased
  );
}

export function buildGroups<T extends ArrangedItem>(
  categories: (ArrangedCategory & { name: string })[],
  items: T[],
  filterId?: string | null,
): ItemGroup<T>[] {
  const ordered = [...categories].sort((a, b) => a.position - b.position);
  const groups: ItemGroup<T>[] = [
    ...ordered.map((category) => ({
      id: category.id,
      name: category.name,
      items: items.filter((item) => item.categoryId === category.id),
    })),
    {
      id: null,
      name: "Sem categoria",
      items: items.filter((item) => item.categoryId == null),
    },
  ];
  if (filterId == null) return groups.filter((group) => group.id != null || group.items.length > 0);
  if (filterId === "") return groups.filter((group) => group.id == null);
  return groups.filter((group) => group.id === filterId);
}

/** Full item id order after moving one card inside its category, matching the Flutter reorder. */
export function idsAfterMove(
  items: ArrangedItem[],
  categories: ArrangedCategory[],
  categoryId: string | null,
  oldIndex: number,
  newIndex: number,
): string[] | null {
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return null;
  const byCategory = new Map<string | null, ArrangedItem[]>();
  for (const item of items) {
    const key = item.categoryId;
    const group = byCategory.get(key) ?? [];
    group.push(item);
    byCategory.set(key, group);
  }
  for (const group of byCategory.values()) {
    group.sort((a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt));
  }
  const group = [...(byCategory.get(categoryId) ?? [])];
  if (oldIndex >= group.length || newIndex >= group.length) return null;
  const [moved] = group.splice(oldIndex, 1);
  group.splice(newIndex, 0, moved);
  byCategory.set(categoryId, group);
  const ids: string[] = [];
  const seen = new Set<string>();
  const ordered = [...categories].sort((a, b) => a.position - b.position);
  for (const category of ordered) {
    for (const item of byCategory.get(category.id) ?? []) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        ids.push(item.id);
      }
    }
  }
  for (const item of byCategory.get(null) ?? []) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      ids.push(item.id);
    }
  }
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      ids.push(item.id);
    }
  }
  return ids;
}
