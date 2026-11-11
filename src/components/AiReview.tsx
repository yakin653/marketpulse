import { Star } from "lucide-react";

export default function AiReview({ stars, verdict, description }: { stars: number, verdict: string, description: string }) {
  return (
    <div className="bg-[var(--surface)] p-6 rounded-xl border border-gray-800 mt-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        🧠 Avis de l&apos;Intelligence Artificielle
      </h2>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="flex text-yellow-400">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} size={24} fill={star <= stars ? "currentColor" : "none"} className={star <= stars ? "text-yellow-400" : "text-gray-600"} />
          ))}
        </div>
        <span className="font-semibold text-lg ml-2">{stars}/5</span>
      </div>

      <p className="text-[var(--positive)] font-medium mb-4 text-lg">{verdict}</p>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </div>
  );
}