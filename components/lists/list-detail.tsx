"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Menu, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";

import { ItemForm } from "@/components/lists/item-form";
import { ItemGroups } from "@/components/lists/item-groups";
import { ListSidebar } from "@/components/lists/sidebar";
import { ThemeMenu } from "@/components/theme-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  arrangeItems,
  buildGroups,
  canReorder,
  idsAfterMove,
  isSortKey,
  SORTS,
  type SortKey,
} from "@/lib/arrange";
import {
  ApiError,
  deleteCategory,
  deleteItem,
  fetchLists,
  fetchSnapshot,
  refreshItem,
  renameCategory,
  reorderCategories,
  reorderItems,
  updateItem,
} from "@/lib/client-api";
import { canEditRole, snapshotTotals, type WishCategory, type WishItem } from "@/lib/domain";
import { formatMoney } from "@/lib/money";

function useSavedSort(listId: string): [SortKey, (value: SortKey) => void] {
  const sort = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("wishly-sort", onChange);
      return () => window.removeEventListener("wishly-sort", onChange);
    },
    () => {
      const saved = localStorage.getItem(`wishly_sort_${listId}`);
      return isSortKey(saved) ? saved : "manual";
    },
    () => "manual" as SortKey,
  );
  const setSort = (value: SortKey) => {
    localStorage.setItem(`wishly_sort_${listId}`, value);
    window.dispatchEvent(new Event("wishly-sort"));
  };
  return [sort, setSort];
}

function useWideScreen() {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia("(min-width: 1024px)");
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );
}

export function ListDetail({ listId }: { listId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const lists = useQuery({ queryKey: ["lists"], queryFn: fetchLists });
  const pendingSince = useRef<number | null>(null);
  const snapshot = useQuery({
    queryKey: ["list", listId],
    queryFn: () => fetchSnapshot(listId),
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? [];
      const pending = items.some((item) => item.status === "pending");
      if (!pending) {
        pendingSince.current = null;
        return false;
      }
      pendingSince.current ??= Date.now();
      if (Date.now() - pendingSince.current > 30_000) return false;
      return 2000;
    },
  });

  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("todas");
  const [hidePurchased, setHidePurchased] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sort, setSort] = useSavedSort(listId);
  const [drawer, setDrawer] = useState(false);
  const wide = useWideScreen();
  const [editor, setEditor] = useState<{ item: WishItem | null; categoryId: string | null } | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] = useState<WishItem | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const list = snapshot.data?.list ?? lists.data?.find((entry) => entry.id === listId) ?? null;
  const canEdit = canEditRole(list?.role ?? "viewer");
  const items = useMemo(() => snapshot.data?.items ?? [], [snapshot.data]);
  const categories = useMemo(() => snapshot.data?.categories ?? [], [snapshot.data]);
  const arranged = useMemo(
    () => arrangeItems(items, { query, priority, sort, hidePurchased }),
    [items, query, priority, sort, hidePurchased],
  );
  const groups = useMemo(
    () => buildGroups(categories, arranged, categoryFilter),
    [categories, arranged, categoryFilter],
  );
  const reorderOk = canReorder({ canEdit, sort, query, priority, hidePurchased });
  const totals = snapshotTotals(items);

  function rememberSort(value: SortKey) {
    setSort(value);
  }

  async function refreshBoard() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["list", listId] }),
      queryClient.invalidateQueries({ queryKey: ["lists"] }),
    ]);
  }

  const removeItem = useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: async () => {
      setPendingDelete(null);
      await refreshBoard();
    },
    onError: (reason) =>
      setError(reason instanceof ApiError ? reason.message : "Não foi possível excluir."),
  });

  async function togglePurchased(item: WishItem) {
    setBusyId(item.id);
    setError(null);
    try {
      await updateItem(item.id, { purchased: !item.purchased });
      await refreshBoard();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Não foi possível atualizar.");
    } finally {
      setBusyId(null);
    }
  }

  async function retry(item: WishItem) {
    setBusyId(item.id);
    setError(null);
    try {
      await refreshItem(item.id);
      await refreshBoard();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Não foi possível atualizar.");
    } finally {
      setBusyId(null);
    }
  }

  async function move(categoryId: string | null, oldIndex: number, newIndex: number) {
    const ids = idsAfterMove(items, categories, categoryId, oldIndex, newIndex);
    if (!ids) return;
    const rank = new Map(ids.map((id, index) => [id, index]));
    queryClient.setQueryData(["list", listId], (current: typeof snapshot.data) =>
      current
        ? {
            ...current,
            items: current.items.map((item) => ({
              ...item,
              position: rank.get(item.id) ?? item.position,
            })),
          }
        : current,
    );
    try {
      await reorderItems(listId, ids);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Não foi possível reordenar.");
      await refreshBoard();
    }
  }

  const sidebar = (
    <ListSidebar
      lists={lists.data ?? []}
      currentId={listId}
      onClose={() => setDrawer(false)}
      onCreated={async (created) => {
        await queryClient.invalidateQueries({ queryKey: ["lists"] });
        router.push(`/list/${created.id}`);
      }}
      onCategories={
        canEdit
          ? () => {
              setDrawer(false);
              setCategoriesOpen(true);
            }
          : undefined
      }
    />
  );

  return (
    <div className="flex min-h-dvh bg-paper text-ink">
      <div className="hidden w-[280px] shrink-0 lg:block">{sidebar}</div>
      {drawer ? (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setDrawer(false)}>
          <div className="absolute inset-0 bg-[rgb(26_20_16/0.45)]" />
          <div
            className="absolute inset-y-0 left-0 w-[min(100%,320px)]"
            onClick={(event) => event.stopPropagation()}
          >
            {sidebar}
          </div>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-1 bg-paper px-2 pt-[env(safe-area-inset-top)] ps-[max(0.5rem,env(safe-area-inset-left))] pe-[max(0.5rem,env(safe-area-inset-right))]">
          <button
            type="button"
            aria-label="Listas"
            className="grid size-12 place-items-center lg:hidden"
            onClick={() => setDrawer(true)}
          >
            <Menu className="size-5" />
          </button>
          <h1 className="min-w-0 flex-1 truncate font-display text-2xl font-semibold">
            {list?.name ?? "Lista"}
          </h1>
          {list && list.role !== "owner" ? (
            <span className="text-xs font-bold text-muted">
              {list.role === "editor" ? "Pode editar" : "Só pode ver"}
            </span>
          ) : null}
          <ThemeMenu onDark={false} />
          {canEdit ? (
            <button
              type="button"
              aria-label="Adicionar"
              className="grid size-12 place-items-center text-accent"
              onClick={() => setEditor({ item: null, categoryId: null })}
            >
              <Plus className="size-6" />
            </button>
          ) : null}
        </header>
        <main className="flex-1 px-4 py-3 pb-[max(1rem,env(safe-area-inset-bottom))] ps-[max(1rem,env(safe-area-inset-left))] pe-[max(1rem,env(safe-area-inset-right))]">
          <Totals
            totals={totals}
            budget={list?.budget ?? null}
            budgetCurrency={list?.budgetCurrency ?? null}
          />
          <Filters
            query={query}
            sort={sort}
            priority={priority}
            hidePurchased={hidePurchased}
            categories={categories}
            categoryFilter={categoryFilter}
            onQuery={setQuery}
            onSort={rememberSort}
            onPriority={setPriority}
            onHide={setHidePurchased}
            onCategory={setCategoryFilter}
          />
          {error ? <p className="mb-3 text-danger">{error}</p> : null}
          {snapshot.isPending ? (
            <p className="text-muted">
              Abrindo a lista… Se o servidor estiver acordando, pode levar cerca de um minuto.
            </p>
          ) : null}
          {snapshot.isError ? (
            <div>
              <p className="text-danger">
                {snapshot.error instanceof ApiError
                  ? snapshot.error.message
                  : "Não foi possível carregar os itens."}
              </p>
              <Button
                type="button"
                className="mt-3"
                variant="ghost"
                onClick={() => snapshot.refetch()}
              >
                Tentar de novo
              </Button>
            </div>
          ) : null}
          {snapshot.data && items.length === 0 ? (
            <p className="rounded-3xl bg-cream p-5 text-muted">
              Nenhum item ainda. {canEdit ? "Cole o link de um produto para começar." : ""}
            </p>
          ) : null}
          {snapshot.data && items.length > 0 ? (
            <ItemGroups
              groups={groups}
              canEdit={canEdit}
              canDrag={reorderOk}
              reorderHint={
                sort === "manual"
                  ? null
                  : "A ordenação manual está desligada. Escolha Manual para arrastar os cards."
              }
              busyId={busyId}
              wide={wide}
              onAddInCategory={
                canEdit ? (categoryId) => setEditor({ item: null, categoryId }) : null
              }
              onEdit={(item) => setEditor({ item, categoryId: item.categoryId })}
              onDelete={setPendingDelete}
              onRefresh={(item) => void retry(item)}
              onTogglePurchased={(item) => void togglePurchased(item)}
              onReorder={(categoryId, oldIndex, newIndex) =>
                void move(categoryId, oldIndex, newIndex)
              }
            />
          ) : null}
          {canEdit ? (
            <div className="mt-4 lg:hidden">
              <Button
                type="button"
                className="w-full"
                onClick={() => setEditor({ item: null, categoryId: null })}
              >
                Adicionar
              </Button>
            </div>
          ) : null}
          <p className="mt-6 lg:hidden">
            <Link href="/configuracoes" className="font-semibold text-ink">
              Configurações
            </Link>
          </p>
        </main>
      </div>
      <Modal
        open={editor != null}
        title={editor?.item ? "Editar item" : "Novo item"}
        onClose={() => setEditor(null)}
      >
        {editor ? (
          <ItemForm
            key={editor.item?.id ?? `new-${editor.categoryId ?? ""}`}
            listId={listId}
            item={editor.item}
            categories={categories}
            initialCategoryId={editor.categoryId}
            onClose={() => setEditor(null)}
            onCategory={() => void refreshBoard()}
            onSaved={() => {
              setEditor(null);
              void refreshBoard();
            }}
          />
        ) : null}
      </Modal>
      <Modal
        open={pendingDelete != null}
        title="Excluir item"
        onClose={() => setPendingDelete(null)}
      >
        <h2 className="font-display text-2xl font-semibold">Excluir este item?</h2>
        <p className="mt-2 text-muted">{pendingDelete?.name}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setPendingDelete(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-danger"
            disabled={removeItem.isPending}
            onClick={() => pendingDelete && removeItem.mutate(pendingDelete.id)}
          >
            Excluir
          </Button>
        </div>
      </Modal>
      <CategoryManager
        open={categoriesOpen}
        listId={listId}
        categories={categories}
        onClose={() => setCategoriesOpen(false)}
        onChanged={() => void refreshBoard()}
      />
    </div>
  );
}

function Totals({
  totals,
  budget,
  budgetCurrency,
}: {
  totals: ReturnType<typeof snapshotTotals>;
  budget: number | null;
  budgetCurrency: string | null;
}) {
  const bought = totals.bought[0]?.amount ?? 0;
  return (
    <div>
      <p className="text-xs font-semibold tracking-[1.2px] text-muted">FALTA COMPRAR</p>
      {totals.pending.length === 0 ? (
        <p className="mt-1 text-lg font-semibold text-forest">
          {totals.bought.length === 0 ? "Sem preços para somar" : "Nada pendente"}
        </p>
      ) : (
        totals.pending.map((total) => (
          <p key={total.currency || "plain"} className="font-display text-2xl text-forest">
            {formatMoney(total.amount, total.currency)}
          </p>
        ))
      )}
      {budget != null && budget > 0 ? (
        <div className="mt-2 max-w-xs">
          <p className="text-xs font-semibold tracking-[1.2px] text-muted">ORÇAMENTO</p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-forest"
              style={{ width: `${Math.min(100, (bought / budget) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted">Comprado de {formatMoney(budget, budgetCurrency)}</p>
        </div>
      ) : null}
      {totals.bought.length > 0 ? (
        <div className="mt-2">
          <p className="text-xs font-semibold tracking-[1.2px] text-muted">JÁ COMPRADO</p>
          {totals.bought.map((total) => (
            <p key={`bought-${total.currency}`} className="text-muted line-through">
              {formatMoney(total.amount, total.currency)}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Filters(props: {
  query: string;
  sort: SortKey;
  priority: string;
  hidePurchased: boolean;
  categories: WishCategory[];
  categoryFilter: string | null;
  onQuery: (value: string) => void;
  onSort: (value: SortKey) => void;
  onPriority: (value: string) => void;
  onHide: (value: boolean) => void;
  onCategory: (value: string | null) => void;
}) {
  const priorities = [
    ["todas", "Todas"],
    ["muito", "Quero muito"],
    ["quero", "Quero"],
    ["talvez", "Talvez"],
  ] as const;
  return (
    <div className="mt-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={props.query}
          placeholder="Buscar nome, loja ou nota"
          onChange={(event) => props.onQuery(event.target.value)}
        />
        <select
          aria-label="Ordenação"
          value={props.sort}
          onChange={(event) => props.onSort(event.target.value as SortKey)}
          className="h-12 rounded-lg border border-line bg-surface px-3 text-ink"
        >
          {SORTS.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {priorities.map(([value, label]) => (
          <FilterChip
            key={value}
            selected={props.priority === value}
            onClick={() => props.onPriority(value)}
          >
            {label}
          </FilterChip>
        ))}
        <FilterChip
          selected={props.hidePurchased}
          onClick={() => props.onHide(!props.hidePurchased)}
        >
          Ocultar comprados
        </FilterChip>
      </div>
      {props.categories.length > 0 ? (
        <div className="mt-1 flex gap-2 overflow-x-auto pb-1">
          <FilterChip
            selected={props.categoryFilter == null}
            onClick={() => props.onCategory(null)}
          >
            Todas
          </FilterChip>
          {props.categories.map((category) => (
            <FilterChip
              key={category.id}
              selected={props.categoryFilter === category.id}
              onClick={() => props.onCategory(category.id)}
            >
              {category.name}
            </FilterChip>
          ))}
          <FilterChip selected={props.categoryFilter === ""} onClick={() => props.onCategory("")}>
            Sem categoria
          </FilterChip>
        </div>
      ) : null}
    </div>
  );
}

function FilterChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        selected
          ? "h-10 shrink-0 rounded-full bg-chip px-3 text-sm font-semibold text-ink"
          : "h-10 shrink-0 rounded-full border border-line px-3 text-sm font-semibold text-ink"
      }
    >
      {children}
    </button>
  );
}

function CategoryManager({
  open,
  listId,
  categories,
  onClose,
  onChanged,
}: {
  open: boolean;
  listId: string;
  categories: WishCategory[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  async function rename(category: WishCategory) {
    const name = window.prompt("Renomear categoria", category.name)?.trim();
    if (!name || name === category.name) return;
    try {
      await renameCategory(category.id, name);
      onChanged();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Não foi possível renomear.");
    }
  }
  async function remove(category: WishCategory) {
    if (!window.confirm(`Excluir “${category.name}”?`)) return;
    try {
      await deleteCategory(category.id);
      onChanged();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Não foi possível excluir.");
    }
  }
  async function move(index: number, direction: -1 | 1) {
    const next = [...categories];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const [row] = next.splice(index, 1);
    next.splice(target, 0, row);
    try {
      await reorderCategories(
        listId,
        next.map((category) => category.id),
      );
      onChanged();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Não foi possível reordenar.");
    }
  }
  return (
    <Modal open={open} title="Categorias" onClose={onClose}>
      <h2 className="font-display text-2xl font-semibold">Categorias</h2>
      {error ? <p className="mt-2 text-danger">{error}</p> : null}
      <ul className="mt-4">
        {categories.map((category, index) => (
          <li key={category.id} className="flex items-center gap-2 border-b border-line py-2">
            <span className="min-w-0 flex-1 truncate">{category.name}</span>
            <button
              type="button"
              className="h-10 px-2 text-sm font-semibold"
              onClick={() => void move(index, -1)}
            >
              Subir
            </button>
            <button
              type="button"
              className="h-10 px-2 text-sm font-semibold"
              onClick={() => void move(index, 1)}
            >
              Descer
            </button>
            <button
              type="button"
              className="h-10 px-2 text-sm font-semibold"
              onClick={() => void rename(category)}
            >
              Renomear
            </button>
            <button
              type="button"
              className="h-10 px-2 text-sm font-bold text-danger"
              onClick={() => void remove(category)}
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>
      {categories.length === 0 ? (
        <p className="mt-3 text-muted">Nenhuma categoria ainda. Crie uma no formulário do item.</p>
      ) : null}
    </Modal>
  );
}
