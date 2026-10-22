import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface WatchItem {
  symbol: string;
  name: string;
  note?: string;
  targetPrice?: number;
  addedAt: number;
}

interface CacheRow {
  key: string;
  data: unknown;
  savedAt: number;
}

interface MPDB extends DBSchema {
  cache: { key: string; value: CacheRow };
  watchlist: { key: string; value: WatchItem };
}

let dbPromise: Promise<IDBPDatabase<MPDB>> | null = null;

export function getDB() {
  if (typeof window === "undefined") throw new Error("IndexedDB côté navigateur uniquement");
  if (!dbPromise) {
    dbPromise = openDB<MPDB>("marketpulse", 1, {
      upgrade(db) {
        db.createObjectStore("cache", { keyPath: "key" });
        db.createObjectStore("watchlist", { keyPath: "symbol" });
      },
    });
  }
  return dbPromise;
}

export async function saveCache(key: string, data: unknown) {
  const db = await getDB();
  await db.put("cache", { key, data, savedAt: Date.now() });
}

export async function readCache<T>(key: string) {
  const db = await getDB();
  const row = await db.get("cache", key);
  return row ? { data: row.data as T, savedAt: row.savedAt } : undefined;
}

export async function addWatch(item: Omit<WatchItem, "addedAt">) {
  const db = await getDB();
  await db.put("watchlist", { ...item, addedAt: Date.now() });
}
export async function listWatch() {
  const db = await getDB();
  const all = await db.getAll("watchlist");
  return all.sort((a, b) => b.addedAt - a.addedAt);
}
export async function updateWatch(symbol: string, patch: Partial<WatchItem>) {
  const db = await getDB();
  const current = await db.get("watchlist", symbol);
  if (!current) return;
  await db.put("watchlist", { ...current, ...patch, symbol });
}
export async function removeWatch(symbol: string) {
  const db = await getDB();
  await db.delete("watchlist", symbol);
}