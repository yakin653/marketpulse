# Démonstration en 5 minutes

À montrer **en local** (http://localhost:3000, lancé par `npm run build` puis `npm start`).
Le lien Vercel n'a pas d'API : il ne sert qu'au plan B « API en panne » et à prouver l'hébergement.

Avant de commencer : `docs/CHECKLIST_VEILLE.md`.

## Scénario

| Temps | Geste | Ce que ça prouve | Phrase |
| --- | --- | --- | --- |
| 0:00 | Ouvrir http://localhost:3000 dans Chrome, DevTools en vue téléphone. Se connecter avec le compte préparé. | Mobile d'abord, session par cookie | « Le navigateur ne parle qu'à `/api` sur le site, Next relaie vers FastAPI. » |
| 0:40 | Tableau de bord puis fiche AAPL : graphique, Pulse Score, encart du modèle. | Données Yahoo réelles, score expliqué | « Le score pèse moyennes mobiles 45, stabilité 30, repli 25. Le modèle fait 52,7 % contre 52,9 % pour toujours hausse : aucun avantage prouvé, donc il n'entre pas dans le score. » |
| 1:30 | Watchlist : ajouter MSFT, écrire une note, supprimer. | CRUD local (IndexedDB) | « Créer, lire, modifier, supprimer, sans réseau. » |
| 2:10 | Alertes : créer une alerte sur AAPL, la mettre en pause, la supprimer. | CRUD serveur (PostgreSQL) | « Ici c'est l'API : `POST`, `PATCH`, `DELETE` sur `/me/alerts`. » |
| 2:50 | Chat : « C'est quoi un ETF ? », puis « Dois-je acheter AAPL ? ». | Bonus IA, refus du conseil | « La réponse est calculée en Python à partir des fiches et de la base. Ollama ne fait que reformuler, et sa sortie est rejetée si elle ne passe pas le contrôle. » |
| 3:40 | DevTools → Network → Offline, recharger. Ouvrir la watchlist, puis une adresse jamais visitée. | Hors ligne : bandeau, données en cache, page `/offline` | « Le service worker sert les pages précachées ; les données viennent d'IndexedDB. » |
| 4:20 | Repasser en ligne. Icône d'installation de Chrome → Installer MarketPulse, rouvrir en fenêtre autonome. | PWA installable | « Manifest `standalone`, icônes 192 et 512. » |
| 4:30 | Profil : cocher « Recevoir aussi mes notifications par e-mail », Enregistrer, « Envoyer une notification de test », ouvrir Mailpit. | Notifications par e-mail, même déconnecté | « Le serveur envoie ; pas besoin d'être connecté. En local, le message arrive dans Mailpit. » |
| 4:50 | Ouvrir `/status`. | Transparence | « État de l'API, de la base, d'Ollama et âge des cours. » |

## Plans B

**Le réseau de la salle tombe.** Rien à changer : tout est local. Seul le rafraîchissement Yahoo échoue, les cours en base restent affichés avec leur date.

**L'API ne répond plus** (page qui tourne, `/status` en erreur).
1. Dire : « L'API est arrêtée, le site passe sur son cache. » Montrer le bandeau et la watchlist qui restent utilisables.
2. Dans un terminal : `docker desktop restart`, attendre que Docker soit prêt, puis dans `finsight` : `docker compose --profile mail up -d`. Compter une à deux minutes. Ne jamais ajouter `-v`.
3. En attendant, se déconnecter et cliquer « Continuer en mode démo » : le site fonctionne avec le jeu local étiqueté « Données de démonstration », et les alertes se créent sur l'appareil.

**Ollama est éteint ou trop lent.** Aucun geste : après 30 secondes au plus, le chat sert la réponse Python. Le dire : « Sans modèle, la réponse reste la même, c'est voulu : le modèle ne décide de rien. » `/status` montre l'état d'Ollama.

**Montrer le code de « Mot de passe oublié ».**
1. Mailpit doit tourner : dans `finsight`, `docker compose --profile mail up -d`, puis ouvrir http://localhost:8025 dans un onglet.
2. Sur le site : Connexion → Mot de passe oublié → saisir l'e-mail du compte. La page indique où lire le code.
3. Dans Mailpit, ouvrir le message « MarketPulse — ton code de connexion » : 6 chiffres, valables 10 minutes, 5 essais.
4. Saisir le code : connexion directe, les autres sessions sont fermées.
5. Si Mailpit ne répond pas : `docker logs finsight-backend --tail 20` n'affiche le code que si `SMTP_HOST` est vide. Avec Mailpit configuré, relancer Mailpit plutôt que chercher dans les logs.

**Le site local ne démarre pas.** Ouvrir https://marketpulse-zeta-jet.vercel.app, « Continuer en mode démo » : installation, hors ligne et watchlist se montrent là. Dire clairement que ce lien n'a pas d'API : pas de compte, pas de chat, pas d'alertes serveur.

## À ne pas dire

- Que le lien public est le produit complet.
- Que le modèle prédit quoi que ce soit.
- Que les notifications push ou la connexion Google fonctionnent : elles ne sont ni configurées ni testées.
- Que le code arrive dans une vraie boîte mail, sauf si l'envoi réel a été configuré et essayé avant.
