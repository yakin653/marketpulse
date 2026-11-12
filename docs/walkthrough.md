# Visite guidée MarketPulse

Walkthrough maison (sans librairie tierce) : moteur pur + overlay accessible.

## Fonctionnement

1. `src/lib/tour/steps.ts` décrit les étapes (titre, texte, `data-tour`, route).
2. `src/lib/tour/engine.ts` choisit le parcours (12 débutant / 6 express), place la bulle, lit/écrit `localStorage` (`mp_tour_v1:<userId|demo|guest>`).
3. `TourProvider` (dans `Providers.tsx`) démarre la visite, navigue, gère l’invitation toast.
4. `TourOverlay` affiche halo + bulle (dialog, clavier, focus trap).

## Lancer / rejouer

- Menu **Aide** → « Lancer la visite guidée »
- Bouton **Visite** dans l’en-tête
- Menu mobile **Plus**
- Palette **Ctrl+K** → « Lancer la visite guidée »
- Après l’onboarding : démarrage auto sur `/dashboard` (drapeau `sessionStorage`)
- Compte existant jamais passé : toast « Découvrir MarketPulse en 2 minutes ? »

Jamais sur `/`, `/login`, `/register`, `/onboarding`.

## Ajouter une étape

1. Ajouter un objet dans `TOUR_STEPS` (`steps.ts`).
2. Poser `data-tour="…"` sur l’élément UI (une ligne).
3. Si parcours express : `express: true`.
4. Lancer `npm test` : le garde-fou vérifie que chaque `data-tour` existe.

## Limites

- Cible absente après ~3 s → carte centrée sans halo (pas d’échec silencieux).
- Surbrillance = `getBoundingClientRect` + box-shadow ; pas de « hole punching » SVG.
- Persistance locale uniquement (pas d’IndexedDB, pas d’API).
- `TOUR_VERSION` : incrémenter pour reproposer une nouvelle visite.
