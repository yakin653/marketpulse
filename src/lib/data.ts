import axios from "axios";
import { readCache, saveCache } from "./db";

export type DataSource = "network" | "cache" | "mock";

export interface LoadResult<T> {
  data: T;
  source: DataSource;
  savedAt?: number;
}

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  timeout: 6000,
});

export async function loadData<T>(cacheKey: string, path: string, mock: T): Promise<LoadResult<T>> {
  try {
    const res = await http.get<T>(path);
    await saveCache(cacheKey, res.data).catch(() => {});
    return { data: res.data, source: "network" };
  } catch {
    const cached = await readCache<T>(cacheKey).catch(() => undefined);
    if (cached) return { data: cached.data, source: "cache", savedAt: cached.savedAt };
    return { data: mock, source: "mock" };
  }
}