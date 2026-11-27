import assert from "node:assert/strict";
import test from "node:test";

import { cleanEmail, displayNameOf, parseAuthPayload, passwordError } from "./parse.ts";

test("accepts the same email shape the API accepts", () => {
  assert.equal(cleanEmail("  Pessoa@Example.com "), "pessoa@example.com");
  assert.equal(cleanEmail("sem-arroba"), null);
  assert.equal(cleanEmail("a@b"), null);
});

test("matches the API password length rule", () => {
  assert.equal(passwordError("curta"), "A senha precisa ter pelo menos 8 caracteres.");
  assert.equal(passwordError("senha-ok"), null);
});

test("uses the mailbox name when there is no display name", () => {
  assert.equal(displayNameOf({ email: "ana@example.com", displayName: null }), "ana");
  assert.equal(displayNameOf({ email: "ana@example.com", displayName: " Ana " }), "Ana");
});

test("reads the auth payload and ignores a missing token", () => {
  const parsed = parseAuthPayload({
    token: "jwt",
    user: { id: "1", email: "ana@example.com", display_name: null, has_avatar: false },
  });
  assert.equal(parsed?.user.email, "ana@example.com");
  assert.equal(parseAuthPayload({ user: { id: "1", email: "ana@example.com" } }), null);
});
