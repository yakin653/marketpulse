"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";
import { ToastProvider } from "@/components/Toast";
import { TourProvider } from "@/components/tour/TourProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <TourProvider>{children}</TourProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
