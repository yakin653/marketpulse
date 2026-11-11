"use client";

import { useEffect } from "react";

/** En développement, un ancien service worker peut servir un Navbar périmé. */
export default function DevSwReset() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.getRegistrations().then(async (registrations) => {
      if (registrations.length === 0) return;
      await Promise.all(registrations.map((registration) => registration.unregister()));
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      const flag = "mp-dev-sw-reset";
      if (!sessionStorage.getItem(flag)) {
        sessionStorage.setItem(flag, "1");
        window.location.reload();
      }
    }).catch(() => {});
  }, []);
  return null;
}
