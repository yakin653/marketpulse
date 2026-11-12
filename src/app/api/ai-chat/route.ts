import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";
import { createGoogle } from "@ai-sdk/google";
import {
  describeMarketSources,
  fetchFinancialContext,
  formatAssetContext,
} from "@/lib/financial-context";
import {
  assertGeminiConfigured,
  formatGeminiError,
  getGeminiFallbackModels,
  isGeminiOverloaded,
} from "@/lib/gemini-ready";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatBody = {
  messages: UIMessage[];
  symbol?: string;
  level?: string;
};

function buildSystemPrompt(
  symbol: string,
  level: string,
  contextBlock: string,
  dataNote: string
): string {
  return [
    "Tu es l'assistant financier pédagogique de MarketPulse (PWA universitaire).",
    `Entreprise sélectionnée: ${symbol}.`,
    `Niveau de réponse exigé: ${level} (adapte le vocabulaire: debutant=simple, standard=équilibré, expert=technique).`,
    "",
    "Règles strictes de formulation:",
    "- Utilise UNIQUEMENT les données financières fournies ci-dessous.",
    "- N'invente JAMAIS de cours boursiers, pourcentages, actualités ou dates.",
    "- Interdit absolu: les expressions « données officielles », « source officielle », « base officielle ».",
    "- Pour citer la provenance, utilise exactement la formulation_source_autorisee fournie (Finnhub et/ou Yahoo Finance, ou démonstration simulée).",
    "- Si updated_at est présent, mentionne la date/heure de mise à jour.",
    "- Si data_source=demo / is_demonstration=true: dis clairement que les chiffres sont simulés (démonstration pédagogique).",
    "- Si history_provider=yahoo_fallback: ne présente PAS tous les indicateurs comme provenant uniquement de Finnhub; précise Finnhub (cotation) + Yahoo Finance (historique/indicateurs).",
    "- Le Pulse Score est une heuristique pédagogique calculée par calculatePulseScore dans src/lib/pulse.ts (code MarketPulse), PAS par Gemini. Tu expliques seulement le score fourni.",
    "- Si une donnée manque, dis clairement qu'elle est absente ou indisponible.",
    "- Ce n'est pas un conseil d'investissement personnalisé.",
    "- Réponds en français.",
    "",
    `Statut des données: ${dataNote}`,
    "Données disponibles:",
    contextBlock || "(aucune donnée numérique fournie)",
  ].join("\n");
}

export async function POST(req: Request) {
  let body: ChatBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const messages = body.messages ?? [];
  const symbol = (body.symbol || "AAPL").toUpperCase().trim();
  const level = (body.level || "standard").toLowerCase().trim();

  if (!["debutant", "standard", "expert"].includes(level)) {
    return Response.json(
      { error: "Niveau invalide (debutant|standard|expert)." },
      { status: 400 }
    );
  }

  try {
    assertGeminiConfigured();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Configuration Gemini manquante.";
    return Response.json({ error: message }, { status: 503 });
  }

  const ctx = await fetchFinancialContext(symbol);
  const contextBlock = ctx.ok ? formatAssetContext(ctx.asset) : "";
  const dataNote = ctx.ok
    ? (() => {
        const srcPhrase = describeMarketSources(ctx.asset);
        const updated = ctx.asset.updated_at
          ? ` Mise à jour: ${ctx.asset.updated_at}.`
          : "";
        const demoExtra =
          ctx.asset.is_demonstration || ctx.asset.data_source === "demo"
            ? ` Motif repli: ${ctx.asset.fallback_reason ?? "démonstration pédagogique"}.`
            : "";
        return `Provenance à citer: ${srcPhrase}.${updated}${demoExtra} N'utilise jamais « données officielles ». Pulse Score = calculatePulseScore (pulse.ts), pas Gemini.`;
      })()
    : `ATTENTION: ${ctx.reason}`;

  const google = createGoogle({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
  const modelMessages = await convertToModelMessages(messages);
  const system = buildSystemPrompt(symbol, level, contextBlock, dataNote);
  const models = getGeminiFallbackModels();

  let lastError: unknown;

  for (let i = 0; i < models.length; i++) {
    const modelId = models[i];
    try {
      const result = streamText({
        model: google(modelId),
        system,
        messages: modelMessages,
        temperature: 0.3,
        maxRetries: 2,
        abortSignal: AbortSignal.timeout(55_000),
      });

      return result.toUIMessageStreamResponse({
        onError: (err) => formatGeminiError(err),
      });
    } catch (err) {
      lastError = err;
      if (isGeminiOverloaded(err) && i < models.length - 1) {
        continue;
      }
      return Response.json({ error: formatGeminiError(err) }, { status: 503 });
    }
  }

  return Response.json(
    { error: formatGeminiError(lastError) },
    { status: 503 }
  );
}
