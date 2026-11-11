import axios from "axios";

/** Client unique : le cookie de session est httpOnly, donc withCredentials est obligatoire. */
export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 20000,
  withCredentials: true,
});

export function errorText(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}
