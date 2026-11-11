# Checklist — la veille et le matin

## La veille

- [ ] Brancher le chargeur. Vérifier qu'il reste au moins 5 Go libres sur `C:`.
- [ ] Démarrer Docker Desktop, puis dans `finsight` : `docker compose --profile mail up -d`.
- [ ] http://127.0.0.1:8000/health répond `{"status":"ok","service":"marketpulse"}`.
- [ ] http://127.0.0.1:8000/status répond en moins de 5 secondes, `database` à `ok`, âge des cours inférieur à 2 jours ouvrés.
- [ ] Dans `marketpulse` : `npm run build`, puis `npm start`. Ouvrir http://localhost:3000.
- [ ] Se connecter avec le compte de démonstration. Noter l'e-mail et le mot de passe sur papier, pas dans un fichier du dépôt.
- [ ] Dérouler `docs/DEMO.md` une fois en entier, chronomètre en main.
- [ ] Essayer « Mot de passe oublié » : le message arrive sur http://localhost:8025.
- [ ] Couper le réseau dans DevTools : bandeau, watchlist, page `/offline`.
- [ ] Installer la PWA depuis Chrome, la rouvrir, la désinstaller pour pouvoir refaire le geste.
- [ ] `ollama list` montre `llama3.2:3b` (facultatif : le chat fonctionne sans).
- [ ] Ouvrir https://marketpulse-zeta-jet.vercel.app : la page de connexion s'affiche (plan B).
- [ ] `git status` propre dans les deux dépôts, tag `v1.0-validation` présent (`git tag --list`).
- [ ] Relire `docs/QUESTIONS_JURY.md`.

## Le matin

- [ ] Démarrer Docker Desktop **en premier** et attendre qu'il soit prêt.
- [ ] `docker compose --profile mail up -d` dans `finsight`, puis vérifier `/health` et `/status`.
- [ ] Si `/status` ne répond pas en 10 secondes : `docker desktop restart`, puis de nouveau `docker compose --profile mail up -d`. Ne jamais utiliser `down -v`.
- [ ] `npm start` dans `marketpulse` (refaire `npm run build` avant seulement si le code a changé).
- [ ] Onglets ouverts dans cet ordre : site local, Mailpit, `/status`, lien Vercel.
- [ ] DevTools ouvert en vue téléphone, onglet Network prêt.
- [ ] Fermer les applications qui consomment de la mémoire. Couper les notifications du système.
- [ ] Éditeur ouvert sur `src/app/sw.ts`, `src/lib/data.ts`, `src/lib/db.ts`, `src/app/alerts/page.tsx` et, côté API, `backend/app/routers/auth.py`.

## Si quelque chose casse pendant la présentation

Voir « Plans B » dans `docs/DEMO.md`. Dans tous les cas : le dire, montrer le repli, continuer.
