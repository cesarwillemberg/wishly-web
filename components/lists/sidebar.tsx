"use client";

import { ChevronUp, List, LogOut, Plus, Settings, Tags } from "lucide-react";
import Link from "next/link";
import { useId, useState, type FormEvent } from "react";

import { useSessionUser } from "@/components/app-shell";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ApiError, createList } from "@/lib/client-api";
import { roleLabel, type WishList } from "@/lib/domain";

export function ListSidebar({
  lists,
  currentId,
  onClose,
  onCreated,
  onCategories,
}: {
  lists: WishList[];
  currentId: string;
  onClose: () => void;
  onCreated: (list: WishList) => void;
  onCategories?: () => void;
}) {
  const user = useSessionUser();
  const logoutFormId = useId();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Informe um nome.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const list = await createList(trimmed);
      setName("");
      setCreating(false);
      onCreated(list);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Não foi possível criar.");
      setBusy(false);
    }
  }

  return (
    <aside className="flex h-full flex-col border-r border-line bg-cream pt-[env(safe-area-inset-top)] ps-[env(safe-area-inset-left)] text-ink">
      <div className="flex h-16 items-center px-4">
        <Link
          href="/"
          onClick={onClose}
          className="font-display text-[28px] leading-none font-semibold text-ink italic"
        >
          Wishly
        </Link>
      </div>
      <p className="px-4 pb-2 text-xs font-bold tracking-[0.14em] text-muted uppercase">
        Suas listas
      </p>
      <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-2">
        {lists.map((list) => {
          const current = list.id === currentId;
          return (
            <Link
              key={list.id}
              href={`/list/${list.id}`}
              aria-current={current ? "page" : undefined}
              onClick={onClose}
              className={
                current
                  ? "mb-1 flex items-center gap-3 rounded-xl bg-accent/10 px-2.5 py-2.5"
                  : "mb-1 flex items-center gap-3 rounded-xl px-2.5 py-2.5 hover:bg-paper"
              }
            >
              <span
                className={
                  current
                    ? "grid size-8 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent"
                    : "grid size-8 shrink-0 place-items-center rounded-lg bg-surface text-muted"
                }
              >
                <List className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{list.name}</span>
                <span className="block truncate text-xs text-muted">{listMeta(list)}</span>
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-line px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {creating ? (
          <form onSubmit={onSubmit} className="mb-1 px-1">
            <Input
              value={name}
              placeholder="Nome da lista"
              onChange={(event) => setName(event.target.value)}
            />
            {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
            <div className="mt-2 flex gap-2">
              <Button type="submit" size="sm" disabled={busy}>
                {busy ? "Salvando…" : "Criar"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setCreating(false);
                  setError(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <button type="button" className={actionClass} onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Nova lista
          </button>
        )}
        {onCategories ? (
          <button type="button" className={actionClass} onClick={onCategories}>
            <Tags className="size-4" />
            Categorias
          </button>
        ) : null}
        <form id={logoutFormId} action="/api/auth/logout" method="post" />
        <Menu>
          <MenuTrigger className="mt-1 flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left outline-none hover:bg-paper focus-visible:ring-[1.4px] focus-visible:ring-accent">
            <Avatar name={user.name} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{user.name}</span>
              <span className="block truncate text-xs text-muted">{user.email}</span>
            </span>
            <ChevronUp className="size-4 shrink-0 text-muted" />
          </MenuTrigger>
          <MenuContent
            side="top"
            align="start"
            className="w-[var(--radix-dropdown-menu-trigger-width)]"
          >
            <MenuItem asChild>
              <Link href="/configuracoes" onClick={onClose}>
                <Settings className="size-5" />
                Configurações
              </Link>
            </MenuItem>
            <MenuItem
              className="text-danger data-[highlighted]:bg-danger/10"
              onSelect={() => {
                const form = document.getElementById(logoutFormId);
                if (form instanceof HTMLFormElement) form.requestSubmit();
              }}
            >
              <LogOut className="size-5" />
              Sair
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </aside>
  );
}

const actionClass =
  "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-ink hover:bg-paper";

function listMeta(list: WishList) {
  const count = list.itemCount === 1 ? "1 item" : `${list.itemCount} itens`;
  if (list.role === "owner") return count;
  return `${count} · ${roleLabel(list.role)}`;
}
