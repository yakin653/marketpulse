"use client";

import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

export default function PulseScore({ score }: { score: number | null }) {
  const known = score != null;
  const shown = known ? score : 0;
  const fill = score == null ? "#334155" : score >= 65 ? "#0ECB81" : score <= 34 ? "#F6465D" : "#94a3b8";
  const data = [{ name: "Score", value: shown, fill }];

  return (
    <div className="relative flex items-center justify-center w-32 h-32 shrink-0" aria-label={known ? `Pulse Score ${score} sur 100` : "Pulse Score indisponible"}>
      <RadialBarChart width={128} height={128} cx={64} cy={64} innerRadius={48} outerRadius={62} barSize={10} data={data} startAngle={90} endAngle={-270}>
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar background dataKey="value" cornerRadius={6} />
      </RadialBarChart>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold num">{known ? score : "—"}</span>
        <span className="text-[10px] text-gray-400">Pulse</span>
      </div>
    </div>
  );
}
