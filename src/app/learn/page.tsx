import Link from "next/link";
import ModelFacts from "@/components/ModelFacts";

export default function LearnPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Méthode</h1>
        <p className="text-gray-400 leading-relaxed">
          MarketPulse sépare ce qui est observé, ce que le modèle estime, et ce que les règles en concluent.
          Rien de tout cela n&apos;est un conseil d&apos;investissement.
        </p>
      </div>

      <section className="bg-[var(--surface)] p-6 rounded-xl border border-gray-800 space-y-3">
        <h2 className="text-xl font-bold">Pulse Score</h2>
        <p className="text-sm text-gray-300 leading-relaxed">
          Score de 0 à 100 calculé dans le navigateur à partir des indicateurs renvoyés par l&apos;API.
          Seuls les volets réellement disponibles entrent dans la moyenne, avec leurs poids renormalisés.
        </p>
        <ul className="text-sm text-gray-400 space-y-2 list-disc pl-5">
          <li>Position face aux moyennes (45 %) : écart du cours à la MM20, et écart de la MM20 à la MM50.</li>
          <li>Stabilité (30 %) : 100 si la volatilité annualisée est nulle, 0 à partir de 60 %.</li>
          <li>Repli maximal (25 %) : 100 sans repli, 0 si le repli atteint 40 % sur la fenêtre.</li>
        </ul>
        <p className="text-sm text-gray-400 leading-relaxed">
          La probabilité du modèle n&apos;est pas dans ce score. L&apos;évaluation du projet montre qu&apos;elle n&apos;apporte pas d&apos;avantage mesuré.
        </p>
      </section>

      <ModelFacts />

      <section className="bg-[var(--surface)] p-6 rounded-xl border border-gray-800 space-y-3">
        <h2 className="text-xl font-bold">Modèle local</h2>
        <p className="text-sm text-gray-300 leading-relaxed">
          La probabilité affichée est la sortie du RandomForest enregistré (best_model.pkl), classe « hausse ».
          Elle n&apos;apparaît que si les 50 séances et les sept variables du modèle sont calculables.
          Sinon la carte reste vide : aucune probabilité n&apos;est tirée au hasard.
        </p>
        <p className="text-sm text-gray-400 leading-relaxed">
          Sur l&apos;évaluation AAPL 2018–2026 documentée dans le projet, la baseline « toujours prédire une hausse » est à 52,9 %
          et la forêt aléatoire à 52,7 %. Le modèle ne la dépasse pas. Une probabilité n&apos;est donc pas un rendement attendu.
        </p>
      </section>

      <section className="bg-[var(--surface)] p-6 rounded-xl border border-gray-800 space-y-3">
        <h2 className="text-xl font-bold">Avis de l&apos;analyste</h2>
        <p className="text-sm text-gray-300 leading-relaxed">
          Python applique des règles fixes. Un achat n&apos;est émis que si le cours est au-dessus de la MM20, la MM20 au-dessus de la MM50,
          la probabilité du modèle est d&apos;au moins 60 %, et ni la volatilité (45 %) ni le repli (30 %) ne dépassent leur seuil.
          La vente est le symétrique. Tout désaccord, toute probabilité entre 40 % et 60 %, ou un risque trop haut, donne une conservation.
          Sans modèle, la règle de moyennes s&apos;applique seule et le texte le dit.
        </p>
        <p className="text-sm text-gray-400 leading-relaxed">
          llama3.2 reformule ensuite ce texte. S&apos;il est trop lent, s&apos;il refuse, ou s&apos;il introduit un pourcentage absent du calcul,
          l&apos;application garde le texte Python. La note sur 5 mesure la cohérence de ces signaux, pas un gain.
        </p>
      </section>

      <section className="bg-[var(--surface)] p-6 rounded-xl border border-gray-800 space-y-3">
        <h2 className="text-xl font-bold">Données et hors ligne</h2>
        <p className="text-sm text-gray-300 leading-relaxed">
          Les cours affichés comme Yahoo Finance viennent de l&apos;API publique de Yahoo et sont stockés dans PostgreSQL.
          Une série simulée, un jeu local ou une copie IndexedDB est badgée comme telle. La watchlist, elle, reste dans le navigateur.
        </p>
        <Link href="/asset/AAPL" className="inline-block text-[var(--accent)] hover:underline text-sm">
          Ouvrir la fiche AAPL
        </Link>
      </section>
    </div>
  );
}
