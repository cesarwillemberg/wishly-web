"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ApiError, createList, deleteList, fetchLists, renameList } from "@/lib/client-api";
import { roleLabel, type WishList } from "@/lib/domain";
import { formatMoney } from "@/lib/money";

export function ListsHome() {
  const queryClient = useQueryClient();
  const lists = useQuery({ queryKey: ["lists"], queryFn: fetchLists });
  const [editor, setEditor] = useState<{ mode: "create" | "rename"; list?: WishList } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WishList | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async (name: string) => {
      if (editor?.mode === "rename" && editor.list) return renameList(editor.list.id, name);
      return createList(name);
    },
    onSuccess: async () => {
      setEditor(null);
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
    onError: (reason) =>
      setError(reason instanceof ApiError ? reason.message : "Não foi possível salvar."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteList(id),
    onSuccess: async () => {
      setPendingDelete(null);
      await queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
    onError: (reason) =>
      setError(reason instanceof ApiError ? reason.message : "Não foi possível excluir."),
  });

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="flex items-center gap-3">
        <h1 className="min-w-0 flex-1 font-display text-[32px] leading-[1.05] font-semibold">
          Suas listas
        </h1>
        <Button
          type="button"
          onClick={() => {
            setError(null);
            setEditor({ mode: "create" });
          }}
        >
          Nova lista
        </Button>
      </div>
      {lists.isPending ? (
        <p className="mt-6 leading-[1.4] text-muted">
          Abrindo suas listas… Se o servidor estiver acordando, a primeira resposta pode levar cerca
          de um minuto.
        </p>
      ) : null}
      {lists.isError ? (
        <div className="mt-6">
          <p className="text-danger">
            {lists.error instanceof ApiError
              ? lists.error.message
              : "Não foi possível carregar as listas."}
          </p>
          <Button type="button" className="mt-3" variant="ghost" onClick={() => lists.refetch()}>
            Tentar de novo
          </Button>
        </div>
      ) : null}
      {lists.data && lists.data.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-cream p-5 leading-[1.4] text-muted">
          Nenhuma lista ainda. Crie a primeira e comece a guardar o que você quer.
        </div>
      ) : null}
      {lists.data && lists.data.length > 0 ? (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lists.data.map((list) => (
            <li key={list.id}>
              <ListCard
                list={list}
                onRename={() => {
                  setError(null);
                  setEditor({ mode: "rename", list });
                }}
                onDelete={() => {
                  setError(null);
                  setPendingDelete(list);
                }}
              />
            </li>
          ))}
        </ul>
      ) : null}
      <NameDialog
        open={editor != null}
        title={editor?.mode === "rename" ? "Renomear lista" : "Nova lista"}
        confirm={editor?.mode === "rename" ? "Salvar" : "Criar"}
        initial={editor?.list?.name ?? ""}
        busy={save.isPending}
        error={error}
        onClose={() => setEditor(null)}
        onSave={(name) => save.mutate(name)}
      />
      <Modal
        open={pendingDelete != null}
        title="Excluir lista"
        onClose={() => setPendingDelete(null)}
      >
        <h2 className="font-display text-2xl font-semibold">Excluir “{pendingDelete?.name}”?</h2>
        <p className="mt-3 leading-[1.4] text-muted">
          A lista e os itens saem da sua conta. O link compartilhado deixa de funcionar.
        </p>
        {error ? <p className="mt-3 text-danger">{error}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setPendingDelete(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-danger"
            disabled={remove.isPending}
            onClick={() => pendingDelete && remove.mutate(pendingDelete.id)}
          >
            Excluir
          </Button>
        </div>
      </Modal>
    </section>
  );
}

function ListCard({
  list,
  onRename,
  onDelete,
}: {
  list: WishList;
  onRename: () => void;
  onDelete: () => void;
}) {
  const pending = list.totals[0];
  const bought = list.purchasedTotals[0];
  const total = pending
    ? formatMoney(pending.amount, pending.currency)
    : list.purchasedTotals.length
      ? "Nada pendente"
      : "Sem preços para somar";
  return (
    <article className="flex h-full min-h-[220px] flex-col rounded-3xl bg-cream p-5">
      <Link href={`/list/${list.id}`} className="min-w-0 flex-1">
        <span className="flex items-start gap-2">
          <span className="min-w-0 flex-1 truncate font-display text-2xl font-semibold">
            {list.name}
          </span>
          {list.collaborative ? (
            <span className="rounded-full bg-chip px-2 py-1 text-xs font-bold text-ink">
              Compartilhada
            </span>
          ) : null}
        </span>
        {list.collaborative && list.members.length > 0 ? (
          <span className="mt-2 block truncate text-sm text-muted">
            {list.members.map((member) => member.label || member.email).join(", ")}
          </span>
        ) : null}
        <span className="mt-2 block text-muted">
          {list.itemCount === 1 ? "1 item" : `${list.itemCount} itens`}
        </span>
        <span className="mt-2 block font-display text-xl text-forest">Falta comprar {total}</span>
        {bought ? (
          <span className="block text-muted line-through">
            Já comprado {formatMoney(bought.amount, bought.currency)}
          </span>
        ) : null}
      </Link>
      <div className="mt-3 flex items-center">
        {list.shareToken && !list.collaborative ? (
          <span className="text-xs font-bold text-accent">Link público</span>
        ) : null}
        <span className="ml-auto flex items-center">
          {list.role === "owner" ? (
            <>
              <Button type="button" variant="ghost" size="sm" onClick={onRename}>
                Renomear
              </Button>
              <Button type="button" variant="danger" size="sm" onClick={onDelete}>
                Excluir
              </Button>
            </>
          ) : (
            <span className="text-sm font-semibold text-muted">{roleLabel(list.role)}</span>
          )}
        </span>
      </div>
    </article>
  );
}

function NameDialog({
  open,
  title,
  confirm,
  initial,
  busy,
  error,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  confirm: string;
  initial: string;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <NameFields
        key={`${title}:${initial}`}
        title={title}
        confirm={confirm}
        initial={initial}
        busy={busy}
        error={error}
        onClose={onClose}
        onSave={onSave}
      />
    </Modal>
  );
}

function NameFields({
  title,
  confirm,
  initial,
  busy,
  error,
  onClose,
  onSave,
}: {
  title: string;
  confirm: string;
  initial: string;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState(initial);
  const [localError, setLocalError] = useState<string | null>(null);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
          setLocalError("Informe um nome.");
          return;
        }
        onSave(trimmed);
      }}
    >
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <label className="mt-4 block text-sm font-bold" htmlFor="list-name">
        Nome da lista
      </label>
      <Input
        id="list-name"
        className="mt-2"
        value={name}
        autoFocus
        onChange={(event) => setName(event.target.value)}
      />
      {error || localError ? <p className="mt-3 text-danger">{error || localError}</p> : null}
      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Salvando…" : confirm}
        </Button>
      </div>
    </form>
  );
}
