import axios from "axios";

/** Client unique : le cookie de session est httpOnly, donc withCredentials est obligatoire. */
export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 20000,
  withCredentials: true,
});

/** Vrai si l'API ne répond pas du tout (réseau coupé, hôte absent, 404/502/503/504 sans message de l'API). */
export function apiUnreachable(error: unknown) {
  if (!axios.isAxiosError(error)) return false;
  if (!error.response) return true;
  return [404, 502, 503, 504].includes(error.response.status) && typeof error.response.data?.detail !== "string";
}

export function errorText(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}
