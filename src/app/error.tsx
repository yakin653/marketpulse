"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-start justify-center gap-4">
      <h1 className="text-3xl font-bold">Quelque chose s&apos;est interrompu</h1>
      <p className="text-gray-400">L&apos;écran n&apos;a pas pu s&apos;afficher. Les cours ne sont pas en cause.</p>
      <button type="button" onClick={reset} className="min-h-11 px-4 rounded-lg bg-[var(--accent)]">Réessayer</button>
    </div>
  );
}
