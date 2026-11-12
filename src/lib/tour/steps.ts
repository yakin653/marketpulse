import type { TourStep } from "./types.ts";

/** Symbole de secours si aucune carte n'est encore chargée (données de démo). */
export const TOUR_DEFAULT_SYMBOL = "AAPL";

export const TOUR_VERSION = 1;

/**
 * Parcours complet (12) : debutant.
 * Les étapes avec express:true forment le parcours court (6).
 */
export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Bienvenue",
    body: "MarketPulse est un outil de lecture de marché pédagogique, pas un conseil en investissement. Cette visite montre où trouver Pulse, le chat et la watchlist.",
    placement: "center",
    required: true,
    express: true,
  },
  {
    id: "nav",
    target: "nav-main",
    title: "Navigation",
    body: "Le menu latéral (ordinateur) ou la barre du bas (téléphone) mène au dashboard, aux marchés, au chat et aux alertes. Tu peux changer de page à tout moment.",
    placement: "right",
    required: true,
    express: true,
  },
  {
    id: "search",
    target: "global-search",
    title: "Recherche",
    body: "La barre du haut cherche un symbole ou un nom d'entreprise. Sur grand écran, Ctrl+K ouvre aussi la palette de commandes.",
    placement: "bottom",
    required: false,
  },
  {
    id: "mood",
    route: "/dashboard",
    target: "market-mood",
    title: "Market Mood et cartes",
    body: "Le Market Mood résume les Pulse Scores du jour. Chaque carte montre le cours, la variation, la position vs MM20 et la probabilité du modèle quand elle est disponible.",
    placement: "left",
    required: true,
    express: true,
  },
  {
    id: "pulse",
    /** Remplacé dynamiquement par /asset/<symbole> dans le provider. */
    route: `/asset/${TOUR_DEFAULT_SYMBOL}`,
    target: "pulse-gauge",
    title: "Jauge Pulse",
    body: "Le Pulse Score synthétise tendance, stabilité et repli sur 100. Ce n'est pas un signal d'achat : c'est une lecture pédagogique de la série.",
    placement: "left",
    required: true,
    express: true,
  },
  {
    id: "lab",
    target: "pulse-lab",
    title: "Pourquoi ce score ?",
    body: "Les curseurs recalculent le score dans le navigateur pour comprendre le poids de chaque composante. Ils ne prédisent pas un cours futur.",
    placement: "top",
    required: false,
  },
  {
    id: "chart",
    target: "price-chart",
    title: "Graphique",
    body: "L'historique des clôtures affiche aussi les moyennes mobiles. Les points rouges marquent des séances inhabituelles détectées sur la série.",
    placement: "top",
    required: false,
  },
  {
    id: "model",
    target: "model-card",
    title: "Carte du modèle",
    body: "Le modèle n'a pas d'avantage prouvé face à une baseline naïve. La page Méthode détaille les chiffres et les limites sans inventer de résultat.",
    placement: "top",
    required: false,
  },
  {
    id: "chat",
    route: "/chat",
    target: "chat-suggestions",
    title: "Chat pédagogique",
    body: "Le bouton flottant d'une fiche ouvre le chat. Les questions suggérées et l'explication des faits utilisés aident à comprendre une réponse, sans conseil d'investissement.",
    placement: "bottom",
    required: true,
    express: true,
  },
  {
    id: "watchlist",
    route: "/watchlist",
    target: "watchlist-add",
    title: "Watchlist",
    body: "Ajoute des symboles et des notes ici. La watchlist reste utilisable hors ligne grâce au stockage local de l'appareil.",
    placement: "bottom",
    required: false,
  },
  {
    id: "alerts",
    target: "notif-bell",
    title: "Notifications",
    body: "La cloche ouvre les notifications et les alertes liées à ton compte. L'indicateur en ligne / hors ligne rappelle l'état du réseau.",
    placement: "bottom",
    required: false,
  },
  {
    id: "end",
    title: "Fin de la visite",
    body: "Tu peux relancer cette visite depuis le menu d'aide, le menu utilisateur ou la palette Ctrl+K (« Lancer la visite guidée »).",
    placement: "center",
    required: true,
    express: true,
  },
];
