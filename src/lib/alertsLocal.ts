import { readCache, saveCache } from "@/lib/db";

export type LocalAlert = {
  id: string;
  symbol: string;
  kind: string;
  threshold: number | null;
  enabled: boolean;
};

const KEY = "alerts";

export async function listLocalAlerts() {
  const cached = await readCache<LocalAlert[]>(KEY);
  return cached?.data ?? [];
}

export async function saveLocalAlerts(items: LocalAlert[]) {
  await saveCache(KEY, items);
}

export async function createLocalAlert(input: Omit<LocalAlert, "id" | "enabled">) {
  const items = await listLocalAlerts();
  const row: LocalAlert = {
    id: `local-${crypto.randomUUID()}`,
    symbol: input.symbol,
    kind: input.kind,
    threshold: input.threshold,
    enabled: true,
  };
  const next = [row, ...items];
  await saveLocalAlerts(next);
  return row;
}

export async function toggleLocalAlert(id: string, enabled: boolean) {
  const items = await listLocalAlerts();
  const next = items.map((item) => (item.id === id ? { ...item, enabled } : item));
  await saveLocalAlerts(next);
  return next;
}

export async function deleteLocalAlert(id: string) {
  const items = await listLocalAlerts();
  const next = items.filter((item) => item.id !== id);
  await saveLocalAlerts(next);
  return next;
}
