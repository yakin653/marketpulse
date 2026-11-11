# Audit Phase V — gel de version (2026-11-11)

> **Document historique.** L'état à jour est dans `docs/VALIDATION.md`. Depuis cet audit :
> le backend complet a été commité et poussé (`finsight`, commit `99d7e5e`), la suite compte
> 53 tests, `public/sw.js` n'est plus suivi par Git, l'ancien README de `finsight` a été déplacé
> dans `legacy/`, et la construction Docker sur dépôt vierge réussit dans l'intégration continue GitHub.

Préparation à la revue de code universitaire. Aucune fonctionnalité ajoutée,
aucun commit effectué pendant l'audit : toutes les corrections ci-dessous sont
dans l'arbre de travail, à committer par l'auteur.

## Défaut bloquant (action auteur)

- **Le backend FinSight actuel n'est pas commité dans Git** (57 changements :
  modules knowledge.py, chat_engine.py, compare_calc.py, jobs.py,
  passwords.py, dossier knowledge/, tests récents, déplacements vers legacy/).
  Un correcteur qui clone `finsight` obtient l'ancien backend. Vérifié par
  `git status` et par un clone local de contrôle. À committer par l'auteur
  avant la remise ; l'audit n'avait pas le droit de le faire.

## V1 — Secrets

- `git ls-files` des deux dépôts : aucun `.env`, certificat, clé ou dump suivi
  (seul `.env.example`, placeholders uniquement).
- Recherche code + historique Git (token, secret, api_key, password=,
  BEGIN PRIVATE KEY, VAPID, SMTP_PASSWORD, GOOGLE_CLIENT_SECRET) :
  aucun vrai secret, uniquement des noms de variables et des valeurs vides.
- Défaut corrigé : `public/sw.js` (généré par Serwist) était suivi par Git.
  Ajout de `public/sw.js`, `public/workbox-*.js`, `public/sw.js.map` au
  `.gitignore`. Au prochain commit : `git rm --cached public/sw.js`.

## V2 — Test sur dépôt vierge (clones locaux temporaires, supprimés depuis)

- Site (clone, commit ceb6206) : `npm ci` OK, `npm run lint` OK (1 warning
  préexistant dans useResource.ts), `npx tsc --noEmit` OK, `npm run build` OK.
- API (clone) : le clone contient l'ancien backend (voir défaut bloquant) ;
  `pytest` y échoue (exit 4, hôte `db` injoignable hors Docker). Le résultat
  ne reflète pas le code actuel.
- `docker build` du clone : NON VÉRIFIÉ (disque C: saturé pendant l'essai ;
  une image résiduelle `mp-api-phasev-clone` existe mais n'est pas validée).

## V3 — Code mort et dette

- `npx knip` (après purge du cache npx corrompu) : faux positifs écartés après
  vérification (`src/app/sw.ts` et `serwist` branchés par la configuration,
  exports `getDB`, `clearEntered`, `PULSE_EXPLICATION` utilisés en interne).
- Supprimés (référencés nulle part, tsc + build revérifiés ensuite) :
  `src/lib/api.ts`, `src/lib/types.ts` (ancien client axios remplacé par
  `src/lib/http.ts` et `src/lib/data.ts`), et les SVG scaffold de create-next-app
  `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`.
- Aucun SQL construit par concaténation/f-string dans le code vivant Python
  (reste uniquement dans `legacy/`, non importé, documenté). Aucun
  console.log/TODO/FIXME dans `src`. Les `print` Python sont de la
  journalisation opérationnelle ; le lien de réinitialisation n'est journalisé
  que hors production.
- À décider par l'auteur : le README de `finsight` contient, après la doc
  actuelle (lignes 1 à ~51), l'ancien README du projet d'origine
  (FinBERT, chandeliers ; badge CI GitHub). Contradictoire par endroits ;
  non supprimé pendant le gel.

## V4 — Sécurité

Détail point par point (a à j) : voir `finsight/docs/securite.md`.
Preuve par les tests : `python -m pytest -q` → 42 passed (2026-11-11, après
redémarrage de Docker). Tous les points OK dans le code ; risques résiduels
honnêtes listés dans le document (JWT_SECRET par défaut de développement,
push web non configuré faute de clés VAPID, Google OAuth non testé en réel).

## V5 — Données et IA

- Rafraîchissement Yahoo : au démarrage si les données datent d'avant le
  dernier jour de bourse, planifié lun–ven 21:30 UTC, forçable par
  `POST /assets/refresh`. Vérifié : dernier cours en base 2026-11-11,
  `GET /status` cohérent (âge affiché, Ollama OK, modèle 52,7 % contre
  52,9 % de baseline, aucun avantage prouvé).
- Chat : banc de 60 questions à 100 % par mode sans Ollama (pytest) et avec
  Ollama (relevé manuel) ; mais 0/60 réponses reformulées par le modèle sur
  cette machine (génération trop lente pour le timeout de 30 s, sortie de
  toute façon rejetée par la validation). Détail : `finsight/docs/chat-evaluation.md`.

## V6–V8 — PWA, hébergement, documentation

- URL publique https://marketpulse-zeta-jet.vercel.app vérifiée par curl le
  2026-11-11 : `/`, `/login`, `/offline`, `/manifest.webmanifest`, `/sw.js`,
  icônes 192/512, `/chat`, `/academy`, `/dashboard` → HTTP 200. Manifest
  complet (standalone, maskable). `/apple-touch-icon.png` en 404 n'est pas un
  défaut : aucun lien ne le référence.
- PowerShell `Invoke-WebRequest` échoue sur ce domaine (IPv6 NAT64) :
  utiliser curl pour les contrôles.
- README des deux dépôts relus : étapes et variables exactes (`.env.example`
  présents, `npm run check` existe, `scripts/gen_vapid.py` existe).
  `docs/DEMO-VALIDATION.md` : statut Vercel passé à « Déployé ».

## NON VÉRIFIÉ

- `docker build` sur dépôt vierge (disque saturé pendant l'essai).
- Google OAuth et Web Push en conditions réelles (non configurés).
- Comportement du chat avec Ollama sur une machine plus rapide.
- Installation PWA réelle sur téléphone (contrôlée sur la build et l'URL
  publique, pas sur un appareil physique pendant cette phase).
