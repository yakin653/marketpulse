import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto mt-10 md:mt-20 text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[var(--text)]">
        Sentez le pouls des <span className="text-[var(--accent)]">marchés</span>.
      </h1>
      <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
        La PWA d'analyse financière qui vous parle, même hors ligne. 
        Analysez, comparez et comprenez vos entreprises favorites grâce à l'IA.
      </p>
      
      <Link 
        href="/markets" 
        className="inline-flex items-center gap-2 bg-[var(--accent)] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
      >
        Explorer les marchés
        <ArrowRight size={20} />
      </Link>
    </div>
  );
}
