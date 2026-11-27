import assert from "node:assert/strict";
import test from "node:test";

import { arrangeItems, canReorder, idsAfterMove } from "./arrange.ts";

function item(partial: { id: string; name: string } & Record<string, unknown>) {
  return {
    url: "",
    imageUrl: null,
    price: null,
    currency: null,
    store: null,
    status: "ok",
    message: null,
    listId: "list",
    categoryId: null,
    purchased: false,
    priority: "quero",
    position: 0,
    note: null,
    color: null,
    sizeLabel: null,
    voltage: null,
    quantity: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...partial,
  };
}

test("manual order follows position and reorder is blocked while searching", () => {
  const items = [
    item({ id: "b", name: "B", position: 2 }),
    item({ id: "a", name: "A", position: 1, priority: "muito" }),
  ];
  assert.deepEqual(
    arrangeItems(items, { query: "", priority: "todas", sort: "manual", hidePurchased: false }).map(
      (entry) => entry.id,
    ),
    ["a", "b"],
  );
  assert.equal(
    canReorder({
      canEdit: true,
      sort: "manual",
      query: "a",
      priority: "todas",
      hidePurchased: false,
    }),
    false,
  );
  assert.equal(
    arrangeItems(items, { query: "", priority: "muito", sort: "manual", hidePurchased: false })
      .length,
    1,
  );
});

test("moves a card inside its category and keeps the other category first", () => {
  const items = [
    item({ id: "c1", name: "C1", categoryId: "cat", position: 0 }),
    item({ id: "c2", name: "C2", categoryId: "cat", position: 1 }),
    item({ id: "loose", name: "Loose", position: 0 }),
  ];
  assert.deepEqual(idsAfterMove(items, [{ id: "cat", name: "Casa", position: 0 }], "cat", 0, 1), [
    "c2",
    "c1",
    "loose",
  ]);
});
