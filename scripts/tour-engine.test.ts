import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  defaultProgress,
  placeBubble,
  readProgress,
  resolveVisibleTarget,
  selectSteps,
  storageKey,
  writeProgress,
} from "../src/lib/tour/engine.ts";
import { TOUR_STEPS } from "../src/lib/tour/steps.ts";

test("debutant a 12 étapes ; intermediaire et expert en ont 6 (express)", () => {
  assert.equal(selectSteps("debutant").length, 12);
  assert.equal(selectSteps("intermediaire").length, 6);
  assert.equal(selectSteps("expert").length, 6);
  assert.equal(selectSteps(undefined).length, 12);
  assert.ok(selectSteps("expert").every((step) => step.express));
});

test("resolveVisibleTarget prend le premier élément visible dans le viewport", () => {
  const hidden = {
    getBoundingClientRect: () => ({ top: -100, left: 0, width: 40, height: 40, bottom: -60, right: 40 }),
    checkVisibility: () => false,
  };
  const visible = {
    getBoundingClientRect: () => ({ top: 20, left: 20, width: 80, height: 40, bottom: 60, right: 100 }),
    checkVisibility: () => true,
  };
  const rect = resolveVisibleTarget([hidden, visible], { width: 400, height: 700 });
  assert.ok(rect);
  assert.equal(rect.top, 20);
  assert.equal(resolveVisibleTarget([hidden], { width: 400, height: 700 }), null);
});

test("placeBubble reste dans l'écran et replie si besoin", () => {
  const target = { top: 10, left: 10, width: 100, height: 40, bottom: 50, right: 110 };
  const bubble = { width: 280, height: 160 };
  const viewport = { width: 360, height: 640 };
  const top = placeBubble("top", target, bubble, viewport, false);
  assert.ok(top.box.top >= 0);
  assert.ok(top.box.left >= 0);
  assert.ok(top.box.left + top.box.width <= viewport.width);
  const mobile = placeBubble("right", target, bubble, viewport, true);
  assert.equal(mobile.placement, "bottom");
  const center = placeBubble("center", null, bubble, viewport, false);
  assert.equal(center.placement, "center");
});

test("read/write progression avec stockage indisponible tombe en mémoire", () => {
  const failing = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("blocked");
    },
  };
  writeProgress("u1", { ...defaultProgress(), completed: true }, failing);
  const again = readProgress("u1", failing);
  assert.equal(again.completed, true);
  assert.equal(storageKey("demo"), "mp_tour_v1:demo");
});

test("garde-fou : chaque data-tour de steps.ts existe dans au moins un composant", () => {
  const root = join(process.cwd(), "src");
  const files: string[] = [];
  function walk(dir: string) {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(tsx|ts|jsx|js)$/.test(name)) files.push(path);
    }
  }
  walk(root);
  const blob = files.map((file) => readFileSync(file, "utf8")).join("\n");
  const needed = new Set(
    TOUR_STEPS.map((step) => step.target).filter((value): value is string => Boolean(value)),
  );
  // Cibles d'UI hors steps mais exigées par le cahier.
  for (const extra of ["online-indicator", "help-menu", "company-card", "chat-fab"]) {
    needed.add(extra);
  }
  const missing: string[] = [];
  for (const id of needed) {
    const literal = blob.includes(`data-tour="${id}"`);
    const jsxExpr = new RegExp(`data-tour=\\{[^}]*["']${id}["']`).test(blob);
    if (!literal && !jsxExpr) missing.push(id);
  }
  assert.deepEqual(missing, [], `data-tour manquants : ${missing.join(", ")}`);

  // Uniquement les attributs littéraux data-tour="…" (pas les sélecteurs template du overlay).
  const orphans = [...blob.matchAll(/data-tour="([^"$]+)"/g)]
    .map((match) => match[1])
    .filter((id) => id && !id.includes("{") && id !== "…");
  const known = new Set([...needed, ...TOUR_STEPS.map((s) => s.target).filter(Boolean)]);
  const unexpected = orphans.filter((id) => !known.has(id));
  assert.deepEqual(unexpected, [], `data-tour orphelins : ${unexpected.join(", ")}`);
});
