import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-start justify-center gap-4">
      <h1 className="text-3xl font-bold">Page introuvable</h1>
      <p className="text-gray-400">Cette adresse ne correspond à aucun écran de MarketPulse.</p>
      <Link href="/" className="min-h-11 inline-flex items-center text-[var(--accent)]">Retour à l&apos;accueil</Link>
    </div>
  );
}
