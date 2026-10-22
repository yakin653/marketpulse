'use client';

import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

export default function PulseScore({ score }: { score: number }) {
  const data = [{ name: 'Score', value: score, fill: score >= 65 ? '#0ECB81' : score <= 34 ? '#F6465D' : '#94a3b8' }];
  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <RadialBarChart width={128} height={128} cx={64} cy={64} innerRadius={50} outerRadius={64} barSize={12} data={data} startAngle={90} endAngle={-270}>
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar background dataKey="value" cornerRadius={6} />
      </RadialBarChart>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{score}</span>
        <span className="text-[10px] text-gray-400">Pulse</span>
      </div>
    </div>
  );
}