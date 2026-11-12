"use client";

import { useEffect, useRef, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ReferenceDot, Tooltip, XAxis, YAxis } from "recharts";

type Point = { date?: string; close?: number | null; ma20?: number | null; ma50?: number | null };

/** Mesure la largeur réelle — ResponsiveContainer reste souvent à 0 px sur mobile (flex/overflow). */
function useContainerWidth(fallback = 320) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const apply = () => {
      const next = Math.floor(node.getBoundingClientRect().width);
      if (next > 0) setWidth(next);
    };

    apply();
    // Un second passage après layout mobile (barre d'adresse, clavier, etc.)
    const t1 = window.setTimeout(apply, 50);
    const t2 = window.setTimeout(apply, 300);

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(apply) : null;
    ro?.observe(node);
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      ro?.disconnect();
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
    };
  }, []);

  return { ref, width };
}

export default function PriceChart({ data, anomalies = [] }: { data: Point[]; anomalies?: string[] }) {
  const points = (data || []).filter((point) => typeof point.close === "number");
  const { ref, width } = useContainerWidth(320);
  const height = 288;
  const narrow = width < 420;

  if (points.length === 0) {
    return (
      <div data-tour="price-chart" className="h-64 flex items-center justify-center text-gray-500 bg-[#0B0E11] rounded-lg border border-gray-800 text-center px-4">
        Pas assez de cours pour tracer le graphique.
      </div>
    );
  }

  return (
    <div data-tour="price-chart" ref={ref} className="h-72 w-full min-w-0 mt-2 overflow-hidden">
      <LineChart
        width={Math.max(width, 280)}
        height={height}
        data={points}
        margin={{ top: 8, right: narrow ? 4 : 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid stroke="#1f2937" vertical={false} />
        <XAxis
          dataKey="date"
          minTickGap={narrow ? 36 : 28}
          tick={{ fontSize: narrow ? 10 : 12, fill: "#9ca3af" }}
          stroke="#4b5563"
          tickFormatter={(value) => String(value).slice(5)}
        />
        <YAxis
          domain={["auto", "auto"]}
          width={narrow ? 40 : 56}
          tick={{ fontSize: narrow ? 10 : 12, fill: "#9ca3af" }}
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
        <Legend wrapperStyle={{ fontSize: narrow ? 11 : 12 }} />
        <Line type="monotone" dataKey="close" name="Clôture" stroke="#3B82F6" strokeWidth={2} dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="ma20" name="MM20" stroke="#F5C16C" strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
        <Line type="monotone" dataKey="ma50" name="MM50" stroke="#A78BFA" strokeWidth={1.5} dot={false} connectNulls isAnimationActive={false} />
        {points.filter((point) => point.date && anomalies.includes(point.date)).map((point) => (
          <ReferenceDot key={point.date} x={point.date} y={point.close ?? 0} r={4} fill="#ef4444" stroke="none" />
        ))}
      </LineChart>
    </div>
  );
}
