"use client";

import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useState } from "react";

import { ItemCard } from "@/components/lists/item-card";
import type { ItemGroup } from "@/lib/arrange";
import type { WishItem } from "@/lib/domain";
import { formatMoney } from "@/lib/money";

export function ItemGroups({
  groups,
  canEdit,
  canDrag,
  reorderHint,
  busyId,
  wide,
  onAddInCategory,
  onEdit,
  onDelete,
  onRefresh,
  onTogglePurchased,
  onReorder,
}: {
  groups: ItemGroup<WishItem>[];
  canEdit: boolean;
  canDrag: boolean;
  reorderHint: string | null;
  busyId: string | null;
  wide: boolean;
  onAddInCategory: ((categoryId: string | null) => void) | null;
  onEdit: (item: WishItem) => void;
  onDelete: (item: WishItem) => void;
  onRefresh: (item: WishItem) => void;
  onTogglePurchased: (item: WishItem) => void;
  onReorder: (categoryId: string | null, oldIndex: number, newIndex: number) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
  );

  return (
    <div className="mt-2">
      {reorderHint ? <p className="mb-3 text-sm text-muted">{reorderHint}</p> : null}
      {groups.map((group) => (
        <Group
          key={group.id ?? "none"}
          group={group}
          canEdit={canEdit}
          canDrag={canDrag && group.items.length > 1}
          wide={wide}
          busyId={busyId}
          sensors={sensors}
          onAddInCategory={onAddInCategory}
          onEdit={onEdit}
          onDelete={onDelete}
          onRefresh={onRefresh}
          onTogglePurchased={onTogglePurchased}
          onReorder={onReorder}
        />
      ))}
    </div>
  );
}

function Group({
  group,
  canEdit,
  canDrag,
  wide,
  busyId,
  sensors,
  onAddInCategory,
  onEdit,
  onDelete,
  onRefresh,
  onTogglePurchased,
  onReorder,
}: {
  group: ItemGroup<WishItem>;
  canEdit: boolean;
  canDrag: boolean;
  wide: boolean;
  busyId: string | null;
  sensors: ReturnType<typeof useSensors>;
  onAddInCategory: ((categoryId: string | null) => void) | null;
  onEdit: (item: WishItem) => void;
  onDelete: (item: WishItem) => void;
  onRefresh: (item: WishItem) => void;
  onTogglePurchased: (item: WishItem) => void;
  onReorder: (categoryId: string | null, oldIndex: number, newIndex: number) => void;
}) {
  const [open, setOpen] = useState(true);
  const remaining = oneTotal(group.items.filter((item) => !item.purchased));
  const bought = oneTotal(group.items.filter((item) => item.purchased));

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = group.items.findIndex((item) => item.id === active.id);
    const newIndex = group.items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(group.id, oldIndex, newIndex);
  }

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="text-ink">{open ? "▾" : "▸"}</span>
          <span className="truncate font-display text-2xl font-semibold">{group.name}</span>
          <span className="text-sm font-semibold text-muted">
            {group.items.length === 1 ? "1 item" : `${group.items.length} itens`}
          </span>
          {remaining ? (
            <span className="hidden font-display text-lg text-forest sm:inline">{remaining}</span>
          ) : null}
          {bought ? (
            <span className="hidden text-muted line-through sm:inline">{bought}</span>
          ) : null}
        </button>
        {canEdit && onAddInCategory ? (
          <button
            type="button"
            aria-label={`Adicionar item em ${group.name}`}
            className="grid size-12 place-items-center rounded-lg text-ink"
            onClick={() => onAddInCategory(group.id)}
          >
            <Plus className="size-5" />
          </button>
        ) : null}
      </div>
      {open ? (
        group.items.length === 0 ? (
          <p className="text-muted">Nenhum item nesta categoria</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext
              items={group.items.map((item) => item.id)}
              strategy={rectSortingStrategy}
            >
              <div
                className={
                  wide
                    ? "grid grid-cols-[repeat(auto-fill,minmax(220px,256px))] items-stretch gap-4"
                    : "grid gap-4"
                }
              >
                {group.items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    canEdit={canEdit}
                    draggingEnabled={canDrag}
                    busy={busyId === item.id}
                    onEdit={() => onEdit(item)}
                    onDelete={() => onDelete(item)}
                    onRefresh={() => onRefresh(item)}
                    onTogglePurchased={() => onTogglePurchased(item)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )
      ) : null}
    </section>
  );
}

function oneTotal(items: WishItem[]): string | null {
  const priced = items.filter((item) => item.price != null);
  if (!priced.length) return null;
  const codes = new Set(priced.map((item) => (item.currency ?? "").toUpperCase()));
  if (codes.size !== 1) return "preços em mais de uma moeda";
  const code = [...codes][0];
  const sum = priced.reduce((total, item) => total + (item.price ?? 0), 0);
  return formatMoney(sum, code || null);
}
