# Validation — ce qui a été vérifié

Relevé du 2026-11-11, version taguée `v1.0-validation` dans les deux dépôts (`marketpulse` et `finsight`).
Chaque ligne donne la commande et le résultat observé. Ce qui n'a pas été vérifié est listé à la fin.

## Exigences du module

| Exigence | État | Preuve |
| --- | --- | --- |
| PWA installable | Vérifié | `/manifest.webmanifest` répond 200 en local et sur Vercel : `display: standalone`, `start_url: /`, icônes 192 et 512. `/sw.js` répond 200. |
| Mode hors ligne | Vérifié par requêtes | Service worker Serwist généré (`src/app/sw.ts`), page `/offline` (200), données relues depuis IndexedDB (`src/lib/data.ts`). Le passage hors ligne dans le navigateur se rejoue à la main (`docs/CHECKLIST_VEILLE.md`). |
| CRUD | Vérifié côté API | Alertes : test `backend/tests/test_alerts_crud.py` (création, liste, pause, suppression). Watchlist dans IndexedDB (`src/lib/db.ts`), à rejouer à la main. |
| Mobile d'abord | Présent dans le code | Onglets en bas sous 768 px (`src/components/AppShell.tsx`), `viewport` dans `src/app/layout.tsx`. |
| Bonus IA | Vérifié | Banc de 60 questions, 100 % par mode (`finsight/docs/chat-evaluation.md`). |
| Hébergement Vercel | Vérifié, démo sans API | Voir « Site public ». |

## Site (`marketpulse`)

| Contrôle | Commande | Résultat |
| --- | --- | --- |
| Lint, types, test, build | `npm run check` | code de sortie 0 : eslint 0 erreur et 1 avertissement connu, `tsc --noEmit` sans erreur, 2 tests sur 2, build de 22 pages |
| Service worker généré | présence de `public/sw.js` après le build | présent, non suivi par Git |
| Clone vierge depuis GitHub | `git clone`, `copy .env.example .env.local`, `npm ci`, `npm run lint`, `npx tsc --noEmit`, test du Pulse Score, `npm run build` | code de sortie 0 à chaque étape, `public/sw.js` généré, `git status` propre |
| Site local (`npm start`) | `curl.exe` sur `/`, `/login`, `/manifest.webmanifest`, `/sw.js`, `/offline`, `/api/health` | 200 partout |

## API (`finsight`)

| Contrôle | Commande | Résultat |
| --- | --- | --- |
| Tests | `python -m pytest -q` dans `backend` | 53 réussis |
| Tests sans effet de bord | `git status` après pytest | aucun fichier modifié |
| Lint | `ruff check .` | aucune erreur |
| Intégration continue GitHub | workflow `CI` sur le commit `99d7e5e` | « Tests + Lint » et « Docker build » réussis |
| Clone vierge depuis GitHub | `git clone`, `copy .env.example .env`, venv Python 3.13 neuf, `pip install -r requirements.txt pytest`, `pytest -q` | 53 réussis, `git status` propre |
| Dépendances | `requirements.txt` | 14 paquets à version fixe, dont `pywebpush` |

## Pile locale

| Contrôle | Commande | Résultat |
| --- | --- | --- |
| Conteneurs | `docker compose --profile mail ps` | `finsight-backend`, `finsight-db`, `finsight-mailpit` démarrés |
| Santé | `GET /health` | `{"status":"ok","service":"marketpulse"}` |
| Base utilisée | hôte lu dans le conteneur | `db` (PostgreSQL local dans Docker). Aucune variable Neon n'est transmise au conteneur. |
| Fraîcheur des cours | `GET /status`, `max(date)` de `market_data` | dernière cotation 2026-11-11, 10 symboles, 1287 lignes depuis le 2026-05-11 |
| Code de connexion | `POST /auth/forgot-password` sur un compte de test, puis lecture de Mailpit | un message « ton code de connexion » reçu, 6 chiffres, 10 minutes ; `GET /auth/providers` répond `"mail":"local"` |

## Site public

https://marketpulse-zeta-jet.vercel.app, interrogé en lecture seule avec `curl.exe` :

| Chemin | Code |
| --- | --- |
| `/` | 200 |
| `/login` | 200 |
| `/manifest.webmanifest` | 200 |
| `/sw.js` | 200 |
| `/offline` | 200 |
| `/api/health` | 404 |

**C'est une démonstration sans API.** Les pages, le manifest et le service worker sont servis, mais `/api` n'aboutit nulle part : pas de compte, pas d'alertes serveur, pas de chat. On y montre l'installation, le hors ligne et le mode démo.

Le projet Vercel est relié à GitHub : chaque `git push` sur `main` déclenche un nouveau déploiement (statut « Vercel » visible sur le commit).

## Secrets

- `git ls-files` des deux dépôts : aucun `.env` autre que `.env.example`, aucun dump, aucune clé.
- Historique des deux dépôts balayé (mots de passe, chaînes de connexion, jetons, clés privées) : rien trouvé. Les seules valeurs présentes sont les valeurs locales documentées de `.env.example`.
- `.gitignore` des deux dépôts : `.env`, `.env.*`, `!.env.example`, `*.bak`.

## Points ouverts, connus

- **SonarCloud : porte qualité en échec sur les deux dépôts**, déjà avant cette version. Site : 12 remarques de fiabilité (boutons sans attribut `type`, zones cliquables sans gestion du clavier, une promesse sans `catch`). API : le mot de passe PostgreSQL local de développement, présent dans `docker-compose.yml`, `backend/app/database.py` et la CI, est signalé comme secret ; c'est une valeur locale documentée, à changer avant tout hébergement. L'alerte `IndexError` de `market_refresh.py` est un faux positif (l'indice est borné sur la ligne même).
- **`npm audit`** : 37 avis sur l'arbre complet, dont 7 dans les dépendances de production (5 élevés, 2 modérés, aucun critique), surtout par `@serwist/next`. Non corrigé : le correctif proposé change de version majeure.
- Un avertissement eslint (`react-hooks/exhaustive-deps`, `src/hooks/useResource.ts`).

## Non vérifié

- Construction de l'image Docker sur la machine de développement à partir d'un clone vierge : moins de 10 Go libres sur `C:`. La même construction réussit dans l'intégration continue GitHub.
- Réception du code dans une vraie boîte mail (aucun compte d'envoi configuré).
- Notifications push réelles (pas de clés VAPID) et connexion Google (jamais rejouée contre Google).
- Déploiement de l'API sur Render et base Neon : jamais appliqués.
- Installation de la PWA sur un téléphone physique.
- Reformulation par Ollama dans le délai de 30 secondes : 0 sur 60 sur cette machine.
