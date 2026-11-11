"use client";

import AuthGate from "@/components/AuthGate";

export default function RegisterPage() {
  return <AuthGate initialMode="signup" />;
}