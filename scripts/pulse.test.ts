import assert from "node:assert/strict";
import { test } from "node:test";
import { calculatePulseScore } from "../src/lib/pulse.ts";

test("le score reste entre 0 et 100 et les poids sont 45, 30 et 25", () => {
  const result = calculatePulseScore({
    prix_actuel: 110,
    ma20: 100,
    ma50: 100,
    volatilite_annualisee_pct: 20,
    max_drawdown_pct: -10,
  });
  assert.deepEqual(result.composantes.map((part) => part.poids), [0.45, 0.3, 0.25]);
  assert.ok(result.score !== null && result.score >= 0 && result.score <= 100);
});

test("sans série, le score est vide", () => {
  assert.equal(calculatePulseScore(null).score, null);
});
