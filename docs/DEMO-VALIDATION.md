# Scénario de démonstration — Modern Mobile Application

URL publique : https://marketpulse-zeta-jet.vercel.app

## Checklist exigée

| Exigence | Où le montrer | Statut |
| --- | --- | --- |
| PWA installable | Chrome → Installer l'application ; `manifest.webmanifest` | Prêt après `npm run build` / Vercel |
| Mode hors ligne | Couper le réseau ; bandeau ambre ; `/offline` ; watchlist IndexedDB | Prêt |
| Mobile first | Chrome DevTools iPhone / Pixel ; onglets bas | Prêt |
| CRUD | Watchlist (local) + Alertes (API) + Profil + Chat conversations | Prêt |
| Bonus IA | Chat (Ollama / repli Python) + Pulse Score + évaluation modèle | Prêt |
| Hébergement Vercel | URL publique du frontend | À déployer |

## Scénario 8 minutes

1. **Ouvrir l’URL Vercel** sur téléphone ou DevTools mobile. Montrer la carte de connexion.
2. **Connexion** : compte réel, ou bouton **Continuer en mode démo** (fonctionne même sans API). Dashboard ensuite.
3. **CRUD watchlist** : ajouter AAPL et MSFT, modifier une note, supprimer un symbole. Dire que c’est IndexedDB, donc utilisable hors ligne.
4. **CRUD alertes** : créer une alerte MM20 sur AAPL, la mettre en pause, la supprimer.
5. **Marchés / fiche actif** : ouvrir AAPL, montrer le graphique et le Pulse Score (45 / 30 / 25).
6. **Chat IA** : « C’est quoi un ETF ? » puis « Dois-je acheter AAPL ? » (refus hors périmètre).
7. **Hors ligne** : DevTools → Network Offline. Recharger : bandeau, watchlist encore visible, page `/offline` si une route absente du cache.
8. **Installation** : menu Chrome → Installer MarketPulse. Rouvrir en standalone.

## Phrases utiles

- « Ce n’est pas un conseil d’investissement. »
- « Le modèle fait ~52,7 % contre 52,9 % pour toujours hausse : aucun avantage prouvé. »
- « Le service worker est actif en production (`npm run build` / Vercel), pas en `npm run dev`. »

## Commandes locales avant la soutenance

```powershell
cd C:\Users\yakin\finsight
docker compose up -d

cd C:\Users\yakin\marketpulse
npm run build
npm start
```

Puis tester PWA sur http://localhost:3000 (pas `npm run dev`).
