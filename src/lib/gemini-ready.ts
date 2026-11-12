/** Vérifie que la clé API Gemini (Google AI Studio) est configurée côté serveur. */

export function assertGeminiConfigured(): void {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY est absente. Créez une clé gratuite sur https://aistudio.google.com/apikey, ajoutez-la dans .env.local, puis redémarrez le serveur Next.js."
    );
  }
}

export function getGeminiModelId(): string {
  // gemini-3.5-flash-lite répond vite sur la clé gratuite AI Studio ;
  // gemini-3.8-flash peut rester bloqué / timeout pour les nouveaux comptes.
  return process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";
}

/** Chaîne de secours si le modèle principal renvoie 503 (saturation). */
export function getGeminiFallbackModels(): string[] {
  const primary = getGeminiModelId();
  const candidates = [
    primary,
    "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite",
  ];
  return [...new Set(candidates.filter(Boolean))];
}

export function isGeminiOverloaded(err: unknown): boolean {
  const message =
    err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const lower = message.toLowerCase();
  return (
    lower.includes("high demand") ||
    lower.includes("unavailable") ||
    lower.includes("overloaded") ||
    lower.includes("503")
  );
}

/** Messages d'erreur lisibles pour les échecs Gemini courants. */
export function formatGeminiError(err: unknown): string {
  const message =
    err instanceof Error
      ? err.message
      : "Erreur inconnue lors de l'appel Gemini.";

  const lower = message.toLowerCase();
  if (
    lower.includes("incorrect api key") ||
    lower.includes("invalid api key") ||
    lower.includes("api key not valid") ||
    lower.includes("authentication") ||
    lower.includes("401") ||
    lower.includes("403")
  ) {
    return "Authentification Gemini échouée (clé API invalide ou révoquée). Vérifiez GOOGLE_GENERATIVE_AI_API_KEY sur Google AI Studio.";
  }
  if (
    lower.includes("quota") ||
    lower.includes("resource_exhausted") ||
    lower.includes("rate") ||
    lower.includes("429")
  ) {
    return "Quota Gemini dépassé (limite gratuite). Attendez un peu ou vérifiez les quotas sur Google AI Studio.";
  }
  if (
    lower.includes("high demand") ||
    lower.includes("unavailable") ||
    lower.includes("503")
  ) {
    return "Gemini est saturé pour le moment (503). Réessayez dans quelques secondes.";
  }
  if (
    lower.includes("timeout") ||
    lower.includes("aborted") ||
    lower.includes("abort")
  ) {
    return "Délai dépassé : Gemini n'a pas répondu à temps. Réessayez ou changez GEMINI_MODEL (ex. gemini-3.5-flash-lite).";
  }
  if (
    lower.includes("network") ||
    lower.includes("fetch failed") ||
    lower.includes("econnrefused")
  ) {
    return "Réseau indisponible : impossible de joindre l'API Gemini.";
  }

  return `L'API Gemini n'a pas pu générer de réponse : ${message}`;
}
