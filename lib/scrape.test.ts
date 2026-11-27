import assert from "node:assert/strict";
import test from "node:test";

import { conciseScrapeMessage, offerScrapeRetry } from "./scrape.ts";

test("collapses a blocked scrape into one sentence", () => {
  const message = conciseScrapeMessage(
    "A loja bloqueou a leitura. Mantivemos a foto que já estava salva.",
  );
  assert.equal(message.includes("Mantivemos"), false);
  assert.equal(offerScrapeRetry("failed", message), true);
  assert.equal(offerScrapeRetry("ok", message), false);
  assert.equal(offerScrapeRetry("partial", "Atualizamos o preço."), false);
});
