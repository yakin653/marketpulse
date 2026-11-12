# Soutenance publique

Lien à ouvrir : **https://marketpulse-zeta-jet.vercel.app**

## État actuel (chemin qui marche)

Chaîne temporaire (PC allumé) :

**Vercel (site) → tunnel Cloudflare → Docker FastAPI local → Postgres local**

- Compte démo : `yakinnmiri@gmail.com` / `yyyyyyyy` (8 lettres y)
- API publique via `/api/health` et login : OK tant que Docker + `cloudflared` tournent
- Chat serveur (Python) : menu **Chat** → `/chat`
- Chat Gemini (Fatime) : bouton sur une fiche actif → `/chat/AAPL` (nécessite `GOOGLE_GENERATIVE_AI_API_KEY` sur Vercel)

## Jour J — checklist 10 minutes avant

1. Docker Desktop démarré ; dans `finsight` : `docker compose up -d`
2. Vérifier `http://127.0.0.1:8000/health` → `{"status":"ok",…}`
3. Tunnel public vers l’API locale (`ssh` localhost.run ou localtunnel) — le PC doit rester allumé
   - URL figée dans `next.config.ts` (fallback Vercel) : voir la valeur `trycloudflare` / `lhr.life` / `loca.lt` actuelle
   - Si tu **relances** le tunnel, l’URL change → mets à jour `API_PROXY_TARGET` sur Vercel **ou** le fallback dans `next.config.ts`, puis **Redeploy**
4. Smoke : ouvrir https://marketpulse-zeta-jet.vercel.app → login → dashboard → alertes → chat
5. Option Gemini : clé AI Studio dans Vercel (`GOOGLE_GENERATIVE_AI_API_KEY`, `FASTAPI_URL` = URL tunnel ou Render, `GEMINI_MODEL=gemini-3.5-flash-lite`) + Redeploy

## Cible durable (quand tu as 15 min Render)

**Vercel → Render (API) → Neon (Postgres)** — plus besoin du PC ni du tunnel.

1. https://dashboard.render.com → GitHub → Blueprint dépôt **finsight** (`render.yaml`)
2. `DATABASE_URL` = valeur `NEON_DATABASE_URL` de `finsight/.env` (déjà au format `postgresql+psycopg://…?sslmode=require`)
3. Sur Vercel : `API_PROXY_TARGET` = URL Render (sans slash) → Redeploy
4. 5 min avant la soutenance : ouvrir `/health` Render (réveil free tier)

## Smoke test public

1. Login avec le compte préparé
2. Dashboard + fiche AAPL (Pulse Score)
3. Alertes : créer / pause / supprimer
4. Chat `/chat` : « Quel est le prix de AAPL ? » puis « Dois-je acheter AAPL ? » (refus du conseil)
5. Option : `/chat/AAPL` Gemini si la clé est configurée
6. `/status` : API et base OK
7. Mode hors ligne (DevTools) + PWA installable

## Phrases utiles

- « Le navigateur ne parle qu’à `/api` sur le même site ; Next relaie vers FastAPI. »
- « Le Pulse Score est calculé en local (MM / volatilité / drawdown), pas par l’IA. »
- « Le chat serveur est déterministe (Python) ; Gemini explique les données fournies, sans inventer de cours. »
- « Ce n’est pas un conseil d’investissement. »

## Si l’API publique tombe

1. Dire : mode démo / cache / watchlist locale.
2. Relancer Docker + cloudflared, ou basculer sur Render si déjà déployé.
3. En salle : fallback local http://localhost:3000 (`npm start` après build).
