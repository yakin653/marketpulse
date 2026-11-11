"use client";

import AuthGate from "@/components/AuthGate";

export default function HomePage() {
  return <AuthGate initialMode="login" />;
}
