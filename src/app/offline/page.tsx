export default function OfflinePage() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 gap-3">
      <h1 className="text-2xl font-semibold">Vous êtes hors ligne</h1>
      <p className="text-gray-400 max-w-sm">
        Cette page n'a pas encore été visitée. Connectez-vous ou retournez sur une page déjà consultée.
      </p>
    </main>
  );
}