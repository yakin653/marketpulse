# 15 questions probables du jury

Réponses courtes, avec le fichier à ouvrir pour les prouver. Les chemins `backend/…` sont dans le dépôt `finsight`.

## PWA et hors ligne

**1. Qu'est-ce qui rend l'application installable ?**
Un manifest (`src/app/manifest.ts` : `display: standalone`, `start_url`, icônes 192 et 512 dont une `maskable`), un service worker enregistré (`public/sw.js`, généré au build à partir de `src/app/sw.ts`) et un service en HTTPS ou sur `localhost`. `src/components/InstallPrompt.tsx` écoute `beforeinstallprompt` pour proposer l'installation.

**2. Que fait exactement le service worker ?**
`src/app/sw.ts`, avec Serwist : il précache les fichiers du build et la page `/offline`, applique les stratégies de cache par défaut de Serwist aux pages et aux fichiers statiques, laisse tout `/api` en `NetworkOnly`, et sert `/offline` quand une page demandée n'est ni joignable ni en cache.

**3. Pourquoi ne pas mettre `/api` en cache dans le service worker ?**
Les réponses de l'API dépendent du compte connecté. Les garder dans Cache Storage risquerait de montrer les données d'un compte à un autre sur le même appareil. Les données hors ligne passent par IndexedDB, vidée à la déconnexion (`logout` dans `src/lib/auth.tsx` efface IndexedDB et Cache Storage).

**4. Que voit l'utilisateur sans réseau ?**
Un bandeau (`src/components/OfflineBanner.tsx`, état lu par `src/hooks/useOnlineStatus.ts`), puis les dernières données enregistrées : `loadData` dans `src/lib/data.ts` essaie le réseau, sinon la copie IndexedDB, sinon un jeu local. L'origine est toujours affichée (`SourceBadge`, `DataOrigin`). La watchlist reste modifiable.

**5. Pourquoi le service worker est-il coupé en développement ?**
`next.config.ts` passe `disable: process.env.NODE_ENV === "development"` à Serwist : un cache actif pendant qu'on modifie le code servirait d'anciens fichiers. La PWA se teste avec `npm run build` puis `npm start`.

## CRUD et données

**6. Où est le CRUD ?**
Deux endroits. Local : la watchlist dans IndexedDB (`addWatch`, `listWatch`, `updateWatch`, `removeWatch` dans `src/lib/db.ts`). Serveur : les alertes (`GET`, `POST`, `PATCH`, `DELETE` sur `/me/alerts`, dans `backend/app/routers/auth.py`, appelées par `src/app/alerts/page.tsx`), plus les conversations du chat et le profil.

**7. Que se passe-t-il si je crée une alerte sans API ?**
`src/app/alerts/page.tsx` attrape l'échec et écrit l'alerte sur l'appareil (`src/lib/alertsLocal.ts`, identifiant `local-…`). Limite assumée : elle n'est pas renvoyée au serveur ensuite, il n'y a pas de file de synchronisation.

**8. D'où viennent les cours, et sont-ils à jour ?**
De Yahoo Finance, six mois par actif, stockés dans la table `market_data`. L'API les relit au démarrage si le dernier relevé est antérieur au dernier jour de bourse, puis du lundi au vendredi à 21:30 UTC. La page `/status` affiche l'âge du dernier relevé. Si Yahoo est injoignable sur une base vide, des séries simulées sont insérées et marquées comme telles.

## Sécurité

**9. Comment la session est-elle protégée ?**
Cookie `mp_session` `HttpOnly`, `SameSite=Lax`, `Secure` derrière HTTPS (`backend/app/security.py`). Il contient un jeton signé avec l'identifiant et un numéro de version ; changer ou réinitialiser le mot de passe incrémente ce numéro et ferme toutes les sessions. Les mots de passe sont hachés avec bcrypt. Les requêtes venant d'une autre origine sont refusées (`reject_foreign_origin` dans `backend/app/main.py`). Détail : `finsight/docs/securite.md`.

**10. Comment marche « Mot de passe oublié » ?**
Un code à 6 chiffres envoyé par e-mail, valable 10 minutes, à usage unique. Seule son empreinte SHA-256 liée au compte est en base. Il est détruit au cinquième essai raté, limité à 5 demandes par quart d'heure et par adresse, et un nouveau code annule l'ancien (`backend/app/passwords.py`). La réponse est la même que l'adresse existe ou non.

**11. Y a-t-il un secret dans le dépôt ?**
Non. `.env` et `.env.*` sont ignorés, seul `.env.example` est suivi avec des valeurs locales ou vides, et l'historique des deux dépôts a été balayé avant le gel. Le site n'a besoin d'aucun secret.

## IA

**12. Le chat peut-il inventer un chiffre ?**
La réponse est d'abord calculée en Python à partir de la base et des 76 fiches (`backend/app/chat_engine.py`). Ollama ne fait que la reformuler, et le texte reformulé n'est gardé que s'il passe `validate_chat_answer`, qui compare notamment les nombres à ceux des faits. Sinon, ou si Ollama ne répond pas en 30 secondes, la réponse Python est servie. Une demande de conseil d'achat est classée hors périmètre et refusée.

**13. Comment avez-vous évalué le chat ?**
Un banc de 60 questions réparties sur les quatre modes (données, connaissance, application, hors périmètre), rejoué par pytest : 100 % par mode sans Ollama (`finsight/docs/chat-evaluation.md`). Avec Ollama, même résultat, mais 0 réponse sur 60 réellement reformulée sur cette machine, faute de tenir dans le délai (`finsight/docs/chat-evaluation-ollama.md`). Le modèle de langue n'apporte donc rien de mesurable ici.

**14. Votre modèle de prédiction est-il utile ?**
Non, et l'application le dit. RandomForest : 52,7 % de précision contre 52,9 % pour la règle « toujours hausse » (`ml/models/evaluation.json` dans `finsight`). Il est affiché avec cette comparaison et n'entre pas dans le Pulse Score, qui ne repose que sur les moyennes mobiles, la volatilité et le repli maximal (`src/lib/pulse.ts`).

## Hébergement

**15. Le lien Vercel est-il l'application complète ?**
Non. Il sert le site, le manifest et le service worker, mais l'API n'est déployée nulle part : `/api` y répond 404. On y montre l'installation, le hors ligne et le mode démo. Pour le compléter, il faudrait héberger l'API (un `render.yaml` existe, jamais appliqué), une base PostgreSQL, puis renseigner `API_PROXY_TARGET` sur Vercel (`docs/DEPLOY-VERCEL.md`).
