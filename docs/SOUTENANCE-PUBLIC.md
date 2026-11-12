# Soutenance publique (hors local)

Objectif : présenter sur **https://marketpulse-zeta-jet.vercel.app** avec comptes, alertes et chat réels.

Chaîne : **Vercel (site) → Render (API) → Neon (PostgreSQL)**.

## Déjà prêt

- Site Vercel en ligne (pages, PWA, mode démo).
- Code API sur GitHub (`finsight`, `render.yaml`).
- Base Neon créée (`my-first-project`) — tables créées au 1er démarrage Render.
- Chaîne Neon au format Render (`postgresql+psycopg://…?sslmode=require`) : **dans le presse-papiers** (ou `NEON_DATABASE_URL` dans `finsight/.env`).

## À faire une fois (toi : connexion GitHub)

### 1. Render — déployer l’API

1. Ouvre https://dashboard.render.com et connecte-toi avec **GitHub**.
2. **New → Blueprint** → dépôt **`finsight`** (branche `main`, fichier `render.yaml`).
3. Quand `DATABASE_URL` est demandée : **Ctrl+V** (valeur déjà dans le presse-papiers).
4. **Apply**. Attends la fin du build (plusieurs minutes).
5. Note l’URL du service (ex. `https://marketpulse-api.onrender.com`).
6. Vérifie : `https://TON-URL/health` → `{"status":"ok",…}`.

Option soutenance (codes « mot de passe oublié » dans les logs) : sur le service Render, ajoute `DEV_LOG_RESET_LINKS=true`, redémarre. Retire-la après.

### 2. Vercel — brancher l’API

1. Projet **marketpulse** → **Settings → Environment Variables**.
2. Production : `API_PROXY_TARGET` = URL Render **sans** slash final.
3. Garde `NEXT_PUBLIC_API_URL` = `/api` si déjà présent.
4. **Deployments → Redeploy** (obligatoire : les rewrites sont figés au build).

### 3. Smoke test (lien public)

Sur https://marketpulse-zeta-jet.vercel.app :

1. `/register` → créer un compte.
2. Login → dashboard avec cours.
3. Alertes : créer / supprimer.
4. Chat : « Quel est le prix de AAPL ? »
5. `/status` : API et base OK.

## Jour J

1. 5 minutes avant : ouvrir `https://TON-API.onrender.com/health` (réveil du free tier, ~1 min au 1er coup).
2. Présenter sur le **lien Vercel** (téléphone ou DevTools mobile).
3. Dire clairement : chat = texte déterministe Python (pas d’Ollama sur Render).

## Si Render n’est pas encore prêt

Le lien Vercel reste utilisable en **mode démo** (PWA, hors ligne, watchlist locale) — sans comptes ni chat serveur. Dire : « L’API publique se déploie ; en salle on peut aussi basculer en local. »
