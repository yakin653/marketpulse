"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Toast = { id: number; tone: "ok" | "err"; text: string };

type ToastApi = {
  push: (text: string, tone?: "ok" | "err") => void;
};

const ToastContext = createContext<ToastApi>({ push: () => undefined });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((text: string, tone: "ok" | "err" = "ok") => {
    const id = Date.now();
    setItems((current) => [...current, { id, tone, text }]);
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 z-[80] flex flex-col gap-2 max-w-sm" aria-live="polite">
        {items.map((item) => (
          <p
            key={item.id}
            role="status"
            className={`rounded-lg px-4 py-3 text-sm shadow-lg ${item.tone === "err" ? "bg-red-950 text-red-100" : "bg-emerald-950 text-emerald-100"}`}
          >
            {item.text}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
