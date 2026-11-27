"use client";

import { useState, type FormEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModalScroll } from "@/components/ui/modal";
import { ApiError, createCategory, createItem, updateItem } from "@/lib/client-api";
import type { WishCategory, WishItem } from "@/lib/domain";
import { parseUserPrice } from "@/lib/money";

const CURRENCIES = ["BRL", "USD", "EUR", "GBP"];

export function ItemForm({
  listId,
  item,
  categories,
  initialCategoryId,
  onSaved,
  onCategory,
  onClose,
}: {
  listId: string;
  item: WishItem | null;
  categories: WishCategory[];
  initialCategoryId?: string | null;
  onSaved: (item: WishItem) => void;
  onCategory: (category: WishCategory) => void;
  onClose: () => void;
}) {
  const editing = item != null;
  const [name, setName] = useState(item?.name ?? "");
  const [url, setUrl] = useState(item?.url ?? "");
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? initialCategoryId ?? "");
  const [priority, setPriority] = useState(item?.priority ?? "quero");
  const [note, setNote] = useState(item?.note ?? "");
  const [color, setColor] = useState(item?.color ?? "");
  const [size, setSize] = useState(item?.sizeLabel ?? "");
  const [voltage, setVoltage] = useState(item?.voltage ?? "");
  const [quantity, setQuantity] = useState(item?.quantity == null ? "" : String(item.quantity));
  const [more, setMore] = useState(Boolean(item?.price != null || item?.imageUrl));
  const [price, setPrice] = useState(
    item?.price == null ? "" : item.price.toFixed(2).replace(".", ","),
  );
  const [currency, setCurrency] = useState(
    CURRENCIES.includes(item?.currency ?? "") ? (item?.currency ?? "BRL") : "BRL",
  );
  const [image, setImage] = useState(item?.imageUrl ?? "");
  const [purchased, setPurchased] = useState(item?.purchased ?? false);
  const [knownCategories, setKnownCategories] = useState(categories);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCategoryChange(value: string) {
    if (value !== "__new__") {
      setCategoryId(value);
      return;
    }
    const createdName = window.prompt("Nova categoria", "Ex.: Cozinha")?.trim();
    if (!createdName) return;
    setBusy(true);
    setError(null);
    try {
      const category = await createCategory(listId, createdName);
      setKnownCategories((current) => [...current, category]);
      setCategoryId(category.id);
      onCategory(category);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Não foi possível criar a categoria.");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextUrl = url.trim();
    if (!nextUrl.startsWith("http://") && !nextUrl.startsWith("https://")) {
      setError("O link do produto precisa começar com http:// ou https://.");
      return;
    }
    const nextName = name.trim();
    if (editing && !nextName) {
      setError("Informe um nome.");
      return;
    }
    const nextImage = image.trim();
    if (nextImage && !nextImage.startsWith("http://") && !nextImage.startsWith("https://")) {
      setError("A imagem precisa ser um link http ou https.");
      return;
    }
    let nextQuantity: number | null = null;
    if (quantity.trim()) {
      nextQuantity = Number(quantity);
      if (!Number.isInteger(nextQuantity) || nextQuantity < 1 || nextQuantity > 999) {
        setError("A quantidade precisa ficar entre 1 e 999.");
        return;
      }
    }
    let nextPrice: number | null = null;
    if (price.trim()) {
      nextPrice = parseUserPrice(price);
      if (nextPrice == null) {
        setError("Não entendi esse preço. Use algo como 1.299,90.");
        return;
      }
    }
    setBusy(true);
    setError(null);
    try {
      const saved = editing
        ? await updateItem(item.id, {
            name: nextName,
            url: nextUrl,
            note: note.trim(),
            priority,
            color: color.trim(),
            size_label: size.trim(),
            voltage: voltage.trim(),
            quantity: nextQuantity,
            image_url: nextImage,
            price: price.trim() ? nextPrice : null,
            currency,
            category_id: categoryId || null,
            purchased,
          })
        : await createItem(listId, {
            url: nextUrl,
            ...(nextName ? { name: nextName } : {}),
            ...(categoryId ? { category_id: categoryId } : {}),
            priority,
            ...(note.trim() ? { note: note.trim() } : {}),
            ...(color.trim() ? { color: color.trim() } : {}),
            ...(size.trim() ? { size_label: size.trim() } : {}),
            ...(voltage.trim() ? { voltage: voltage.trim() } : {}),
            ...(nextQuantity != null ? { quantity: nextQuantity } : {}),
            ...(nextPrice != null ? { price: nextPrice, currency } : {}),
            ...(nextImage ? { image_url: nextImage } : {}),
          });
      onSaved(saved);
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : "Não foi possível salvar.");
      setBusy(false);
    }
  }

  const label = "mt-4 mb-2 block text-sm font-bold text-ink";
  return (
    <form
      onSubmit={onSubmit}
      className="flex max-h-[calc(100dvh-env(safe-area-inset-top)-0.75rem)] min-h-0 flex-col overflow-hidden sm:max-h-[92dvh]"
    >
      <h2 className="shrink-0 px-5 pt-5 font-display text-2xl font-semibold text-ink">
        {editing ? "Editar item" : "Novo item"}
      </h2>
      <ModalScroll className="px-5 pt-1 pb-2">
        <label className={label} htmlFor="item-name">
          Nome (opcional)
        </label>
        <Input
          id="item-name"
          value={name}
          disabled={busy}
          placeholder="Se vazio, usamos o nome da página"
          onChange={(event) => setName(event.target.value)}
        />
        <label className={label} htmlFor="item-url">
          Link do produto
        </label>
        <Input
          id="item-url"
          value={url}
          disabled={busy}
          inputMode="url"
          placeholder="https://"
          onChange={(event) => setUrl(event.target.value)}
        />
        <label className={label} htmlFor="item-category">
          Categoria
        </label>
        <Select
          id="item-category"
          value={categoryId}
          disabled={busy}
          onChange={(value) => void onCategoryChange(value)}
        >
          <option value="">Sem categoria</option>
          {knownCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
          <option value="__new__">Nova categoria…</option>
        </Select>
        <label className={label} htmlFor="item-priority">
          Prioridade
        </label>
        <Select id="item-priority" value={priority} disabled={busy} onChange={setPriority}>
          <option value="muito">Quero muito</option>
          <option value="quero">Quero</option>
          <option value="talvez">Talvez</option>
        </Select>
        <label className={label} htmlFor="item-note">
          Nota
        </label>
        <textarea
          id="item-note"
          value={note}
          disabled={busy}
          rows={3}
          placeholder="Um recado para quem for comprar"
          onChange={(event) => setNote(event.target.value)}
          className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-base text-ink outline-none placeholder:text-muted focus-visible:border-accent"
        />
        <p className={label}>Detalhes rápidos</p>
        <div className="grid gap-2">
          <Input
            value={color}
            disabled={busy}
            placeholder="Cor"
            onChange={(event) => setColor(event.target.value)}
          />
          <Input
            value={size}
            disabled={busy}
            placeholder="Tamanho"
            onChange={(event) => setSize(event.target.value)}
          />
          <Input
            value={voltage}
            disabled={busy}
            placeholder="Voltagem"
            onChange={(event) => setVoltage(event.target.value)}
          />
          <Input
            value={quantity}
            disabled={busy}
            inputMode="numeric"
            placeholder="Quantidade"
            onChange={(event) => setQuantity(event.target.value)}
          />
        </div>
        <button
          type="button"
          className="mt-3 h-12 font-bold text-ink"
          disabled={busy}
          onClick={() => setMore((value) => !value)}
        >
          {more ? "Menos opções" : "Mais opções"}
        </button>
        {more ? (
          <>
            <label className={label} htmlFor="item-price">
              Preço
            </label>
            <Input
              id="item-price"
              value={price}
              disabled={busy}
              inputMode="decimal"
              placeholder="1.299,90"
              onChange={(event) => setPrice(event.target.value)}
            />
            <label className={label} htmlFor="item-currency">
              Moeda
            </label>
            <Select id="item-currency" value={currency} disabled={busy} onChange={setCurrency}>
              {CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Select>
            <label className={label} htmlFor="item-image">
              URL da imagem
            </label>
            <Input
              id="item-image"
              value={image}
              disabled={busy}
              placeholder="https://"
              onChange={(event) => setImage(event.target.value)}
            />
          </>
        ) : null}
        {editing ? (
          <label className="mt-4 flex items-center justify-between gap-3 text-sm font-bold text-ink">
            Comprado
            <input
              type="checkbox"
              checked={purchased}
              disabled={busy}
              onChange={(event) => setPurchased(event.target.checked)}
            />
          </label>
        ) : null}
        {error ? <p className="mt-3 text-danger">{error}</p> : null}
      </ModalScroll>
      <div className="flex shrink-0 justify-end gap-2 border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Salvando…" : editing ? "Salvar" : "Adicionar à lista"}
        </Button>
      </div>
    </form>
  );
}

function Select({
  id,
  value,
  disabled,
  onChange,
  children,
}: {
  id: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      id={id}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="h-12 w-full rounded-lg border border-line bg-surface px-3 text-base text-ink outline-none focus-visible:border-accent"
    >
      {children}
    </select>
  );
}
