import assert from "node:assert/strict";
import test from "node:test";

import { allowedBackendPath } from "./bff-path.ts";

test("allows list and item routes and blocks everything else", () => {
  assert.equal(allowedBackendPath(["lists"]), "lists");
  assert.equal(allowedBackendPath(["lists", "abc", "items", "reorder"]), "lists/abc/items/reorder");
  assert.equal(allowedBackendPath(["items", "abc", "image"]), "items/abc/image");
  assert.equal(allowedBackendPath(["auth", "login"]), null);
  assert.equal(allowedBackendPath(["lists", "..", "items"]), null);
});
