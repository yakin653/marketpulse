import axios from "axios";
import { readCache, saveCache } from "./db";

export type DataSource = "network" | "cache" | "mock";

export interface LoadResult<T> {
  data: T;
  source: DataSource;
  savedAt?: number;
}

const http = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  timeout: 6000,
});

export async function loadData<T>(
  cacheKey: string,
  path: string,
  mock: T
): Promise<LoadResult<T>> {
  try {
    // 1. Essayer le vrai backend
    const res = await http.get<T>(path);

    await saveCache(cacheKey, res.data).catch(() => {});
    return { data: res.data, source: "network" };
  } catch (error) {
    console.warn(
      `[API] Échec réseau pour ${path}, recherche dans le cache...`
    );

    // 2. Si le backend ne répond pas, utiliser le cache
    const cached = await readCache<T>(cacheKey).catch(() => undefined);

    if (cached) {
      return {
        data: cached.data,
        source: "cache",
        savedAt: cached.savedAt,
      };
    }

    // 3. Sans cache, utiliser les données mock
    console.warn("[API] Pas de cache, utilisation des données mock.");
    return { data: mock, source: "mock" };
  }
}
