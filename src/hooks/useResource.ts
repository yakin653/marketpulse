"use client";
import { useEffect, useState } from "react";
import { loadData, type LoadResult } from "@/lib/data";

export function useResource<T>(cacheKey: string, path: string, mock: T) {
  const [state, setState] = useState<LoadResult<T>>({ data: mock, source: "mock" });
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    loadData<T>(cacheKey, path, mock).then((r) => {
      if (alive) { setState(r); setLoading(false); }
    }).catch(() => {
      if (alive) setLoading(false);
    });
    return () => { alive = false; };
  }, [cacheKey, path, nonce]);

  return { ...state, loading, reload: () => setNonce((value) => value + 1) };
}