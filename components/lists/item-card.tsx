"use client";

/* dnd-kit's sortable helpers are meant to be read while rendering the card. */
/* eslint-disable react-hooks/refs */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreVertical } from "lucide-react";
import { useState } from "react";

import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/dropdown-menu";
import type { WishItem } from "@/lib/domain";
import { formatMoney } from "@/lib/money";
import { conciseScrapeMessage, offerScrapeRetry } from "@/lib/scrape";
import { itemImageSrc } from "@/lib/client-api";

function priorityLabel(priority: string) {
  if (priority === "muito") return "Quero muito";
  if (priority === "talvez") return "Talvez";
  return "Quero";
}

function priorityClass(priority: string) {
  if (priority === "muito") return "bg-accent/15 text-accent";
  if (priority === "talvez") return "bg-line/40 text-muted";
  return "bg-forest/15 text-forest";
}

export function ItemCard({
  item,
  canEdit,
  draggingEnabled,
  busy,
  onEdit,
  onDelete,
  onRefresh,
  onTogglePurchased,
}: {
  item: WishItem;
  canEdit: boolean;
  draggingEnabled: boolean;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  onTogglePurchased: () => void;
}) {
  const sortable = useSortable({ id: item.id, disabled: !draggingEnabled });
  const [imageFailed, setImageFailed] = useState(false);
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };
  const price =
    item.status === "pending" && item.price == null
      ? "Lendo o preço…"
      : item.price == null
        ? "Preço indisponível"
        : formatMoney(item.price, item.currency);
  const details = [
    item.color,
    item.sizeLabel,
    item.voltage,
    item.quantity != null ? `×${item.quantity}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const retry = canEdit && offerScrapeRetry(item.status, item.message);
  const showImage = Boolean(item.imageUrl) && !imageFailed;

  return (
    <article
      ref={sortable.setNodeRef}
      style={style}
      className={`flex h-full flex-col overflow-hidden rounded-3xl bg-cream ${sortable.isDragging ? "opacity-70" : ""} ${item.purchased ? "opacity-80" : ""}`}
    >
      <div
        className="relative aspect-[155/100] overflow-hidden bg-surface"
        {...(draggingEnabled ? { ...sortable.attributes, ...sortable.listeners } : {})}
      >
        {showImage ? (
          // Product photos come from the authenticated image proxy.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={itemImageSrc(item)}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover ${item.purchased ? "opacity-45 grayscale" : ""}`}
            draggable={false}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="grid h-full place-items-center px-4 text-center text-sm text-muted">
            {item.status === "pending" ? "Lendo a loja…" : item.store || "Sem foto"}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[2.6em] font-display text-xl leading-[1.15] font-semibold">
          {item.name}
        </h3>
        {item.store ? (
          <p className="mt-1 truncate text-sm text-muted">{item.store}</p>
        ) : (
          <p className="mt-1 h-5" />
        )}
        <p
          className={`mt-2 font-display text-2xl ${item.purchased ? "text-muted line-through" : "text-forest"}`}
        >
          {price}
        </p>
        <p className="mt-2">
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${priorityClass(item.priority)}`}
          >
            {priorityLabel(item.priority)}
          </span>
        </p>
        {details ? <p className="mt-2 text-sm text-muted">{details}</p> : null}
        {item.note ? (
          <p className="mt-2 line-clamp-2 text-sm leading-[1.4] text-ink">{item.note}</p>
        ) : null}
        {item.message && item.status !== "ok" ? (
          <p className="mt-2 text-sm leading-[1.4] text-danger">
            {conciseScrapeMessage(item.message)}
          </p>
        ) : null}
        <div className="mt-auto flex items-center gap-2 pt-3">
          {canEdit ? (
            <button
              type="button"
              disabled={busy}
              onClick={onTogglePurchased}
              className={
                item.purchased
                  ? "inline-flex h-10 items-center rounded-full bg-forest px-3 text-sm font-bold text-white disabled:opacity-55"
                  : "inline-flex h-10 items-center rounded-full border border-line px-3 text-sm font-bold text-ink disabled:opacity-55"
              }
            >
              {item.purchased ? "Comprado" : "Comprar"}
            </button>
          ) : null}
          {retry ? (
            <button
              type="button"
              className="text-sm font-bold text-accent disabled:opacity-55"
              disabled={busy}
              onClick={onRefresh}
            >
              Tentar de novo
            </button>
          ) : null}
          {canEdit ? (
            <Menu>
              <MenuTrigger
                aria-label="Ações"
                className="ml-auto grid size-10 place-items-center rounded-lg text-ink"
              >
                <MoreVertical className="size-5" />
              </MenuTrigger>
              <MenuContent>
                <MenuItem onSelect={onEdit}>Editar</MenuItem>
                <MenuItem onSelect={onRefresh}>Atualizar da loja</MenuItem>
                <MenuItem onSelect={onDelete}>Excluir</MenuItem>
              </MenuContent>
            </Menu>
          ) : null}
        </div>
      </div>
    </article>
  );
}
