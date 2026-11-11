"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = ["#3B82F6", "#0ECB81", "#F6465D", "#F5C16C"];

export default function CompareChart({ points, symbols }: { points: Record<string, string | number>[]; symbols: string[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <CartesianGrid stroke="#1f2937" vertical={false} />
          <XAxis dataKey="date" minTickGap={28} tick={{ fontSize: 12, fill: "#9ca3af" }} />
          <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} />
          <Tooltip />
          <Legend />
          {symbols.map((symbol, index) => <Line key={symbol} type="monotone" dataKey={symbol} dot={false} stroke={colors[index % colors.length]} />)}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
