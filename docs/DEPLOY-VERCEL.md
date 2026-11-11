# Déploiement Vercel (obligatoire)

Le frontend MarketPulse se déploie sur Vercel. L’API FastAPI (`finsight`) doit être joignable en HTTPS ; Next relaie `/api` vers elle.

## 1. Compte Vercel (une seule fois)

Dans PowerShell :

```powershell
cd C:\Users\yakin\marketpulse
.\scripts\deploy-vercel.ps1
```

Ou à la main :

```powershell
cd C:\Users\yakin\marketpulse
npx vercel login
npx vercel --prod --yes
```

Choisis **Continue with GitHub**, valide dans le navigateur, puis le script déploie.

## 2. Variables sur Vercel

Dans le projet Vercel → Settings → Environment Variables :

| Variable | Valeur |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `/api` |
| `API_PROXY_TARGET` | `https://TON-API-PUBLIQUE` (sans slash final) |

Exemple si l’API est sur Render : `https://marketpulse-api.onrender.com`

## 3. Côté API publique

Sur l’hôte de l’API (`finsight`) :

- `CORS_ORIGINS` doit contenir l’URL Vercel, ex. `https://marketpulse-xxx.vercel.app`
- `COOKIE_SECURE=true`
- `APP_PUBLIC_URL=https://marketpulse-xxx.vercel.app`
- `JWT_SECRET` long et unique

Sans API publique, la PWA s’installe quand même, mais login / alertes / chat échouent hors ligne sauf données déjà en cache.

## 4. Déployer

```powershell
cd C:\Users\yakin\marketpulse
npx vercel --prod
```

Note l’URL affichée (`https://….vercel.app`) et colle-la dans `docs/DEMO-VALIDATION.md`.

## 5. Vérifier le jour J

1. Ouvrir l’URL sur téléphone.
2. Chrome → Installer l’application.
3. Se connecter, CRUD watchlist + alertes.
4. Mode avion / Network Offline → bandeau + watchlist.
