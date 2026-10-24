import { readCache, saveCache } from "./db";

export type DataSource = "network" | "cache" | "mock";

export interface LoadResult<T> {
  data: T;
  source: DataSource;
  savedAt?: number;
}

export async function loadData<T>(cacheKey: string, path: string, mock: T): Promise<LoadResult<T>> {
  // On simule un petit délai réseau (300ms) pour que le loader soit visible
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // On retourne les données du mock
  return { data: mock, source: "mock" };
}