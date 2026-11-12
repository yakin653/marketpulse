"use client";

import { CartesianGrid, Legend, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { date?: string; close?: number | null; ma20?: number | null; ma50?: number | null };

export default function PriceChart({ data, anomalies = [] }: { data: Point[]; anomalies?: string[] }) {
  const points = (data || []).filter((point) => typeof point.close === "number");
  if (points.length === 0) {
    return (
      <div data-tour="price-chart" className="h-64 flex items-center justify-center text-gray-500 bg-[#0B0E11] rounded-lg border border-gray-800 text-center px-4">
        Pas assez de cours pour tracer le graphique.
      </div>
    );
  }

  return (
    <div data-tour="price-chart" className="h-72 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#1f2937" vertical={false} />
          <XAxis dataKey="date" minTickGap={28} tick={{ fontSize: 12, fill: "#9ca3af" }} stroke="#4b5563" tickFormatter={(value) => String(value).slice(5)} />
          <YAxis
            domain={["auto", "auto"]}
            width={56}
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            stroke="#4b5563"
            tickFormatter={(value) => Number(value).toFixed(0)}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#161A1E", borderColor: "#374151", borderRadius: 8 }}
            labelStyle={{ color: "#EAECEF" }}
            formatter={(value, name) => {
              const numeric = typeof value === "number" ? value : Number(value);
              const label = numeric == null || Number.isNaN(numeric) ? "—" : `${numeric.toFixed(2)} USD`;
              return [label, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="close" name="Clôture" stroke="#3B82F6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="ma20" name="MM20" stroke="#F5C16C" strokeWidth={1.5} dot={false} connectNulls />
          <Line type="monotone" dataKey="ma50" name="MM50" stroke="#A78BFA" strokeWidth={1.5} dot={false} connectNulls />
          {points.filter((point) => point.date && anomalies.includes(point.date)).map((point) => (
            <ReferenceDot key={point.date} x={point.date} y={point.close ?? 0} r={4} fill="#ef4444" stroke="none" />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
