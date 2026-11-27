import assert from "node:assert/strict";
import test from "node:test";

import { pathFromLegacyHash, safeNextPath } from "./navigation.ts";

test("maps the Flutter hash routes to path routes", () => {
  assert.equal(pathFromLegacyHash("#/list/abc"), "/list/abc");
  assert.equal(pathFromLegacyHash("#/list/abc/"), "/list/abc");
  assert.equal(pathFromLegacyHash("#/configuracoes"), "/configuracoes");
  assert.equal(pathFromLegacyHash("#/l/Ab12"), "/l/Ab12");
  assert.equal(pathFromLegacyHash("#/c/Ab12"), "/c/Ab12");
  assert.equal(pathFromLegacyHash("#/entrar"), "/entrar");
  assert.equal(
    pathFromLegacyHash("#/compartilhar?url=https%3A%2F%2Floja.example%2Fp&title=Caneca"),
    "/compartilhar?url=https%3A%2F%2Floja.example%2Fp&title=Caneca",
  );
});

test("ignores hashes that are not app routes", () => {
  assert.equal(pathFromLegacyHash(""), null);
  assert.equal(pathFromLegacyHash("#/"), null);
  assert.equal(pathFromLegacyHash("#about"), null);
  assert.equal(pathFromLegacyHash("#/desconhecida"), null);
  assert.equal(pathFromLegacyHash("#/list/../entrar"), null);
  assert.equal(pathFromLegacyHash("#/list//abc"), null);
  assert.equal(pathFromLegacyHash("#/configuracoes/extra"), null);
});

test("only allows same-site next paths", () => {
  assert.equal(safeNextPath(null), "/");
  assert.equal(safeNextPath("/list/abc"), "/list/abc");
  assert.equal(
    safeNextPath("/compartilhar?url=https%3A%2F%2Fx"),
    "/compartilhar?url=https%3A%2F%2Fx",
  );
  assert.equal(safeNextPath("//evil.example"), "/");
  assert.equal(safeNextPath("https://evil.example"), "/");
  assert.equal(safeNextPath("/entrar"), "/");
  assert.equal(safeNextPath("/api/auth/logout"), "/");
  assert.equal(safeNextPath("/list/../entrar"), "/");
});
