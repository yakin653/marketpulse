"use client";
import { useEffect, useState } from "react";
import { loadData, type LoadResult } from "@/lib/data";

export function useResource<T>(cacheKey: string, path: string, mock: T) {
  const [state, setState] = useState<LoadResult<T> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    loadData<T>(cacheKey, path, mock).then((r) => {
      if (alive) { setState(r); setLoading(false); }
    });
    return () => { alive = false; };
  }, [cacheKey, path]);

  return { ...state, loading };
}