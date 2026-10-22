'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PriceChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-500">Aucune donnée</div>;
  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#4b5563" />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} stroke="#4b5563" />
          <Tooltip contentStyle={{ backgroundColor: '#161A1E', borderColor: '#374151' }} itemStyle={{ color: '#EAECEF' }} />
          <Line type="monotone" dataKey="close" stroke="#3B82F6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}