"use client";

import { useEffect, useRef, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

const colors = ["#3B82F6", "#0ECB81", "#F6465D", "#F5C16C"];

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
    const t = window.setTimeout(apply, 120);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(apply) : null;
    ro?.observe(node);
    window.addEventListener("resize", apply);
    return () => {
      window.clearTimeout(t);
      ro?.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);

  return { ref, width };
}

export default function CompareChart({ points, symbols }: { points: Record<string, string | number>[]; symbols: string[] }) {
  const { ref, width } = useContainerWidth(320);
  const narrow = width < 420;

  return (
    <div ref={ref} className="h-72 w-full min-w-0 overflow-hidden">
      <LineChart width={Math.max(width, 280)} height={288} data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#1f2937" vertical={false} />
        <XAxis dataKey="date" minTickGap={narrow ? 36 : 28} tick={{ fontSize: narrow ? 10 : 12, fill: "#9ca3af" }} />
        <YAxis width={narrow ? 40 : 56} tick={{ fontSize: narrow ? 10 : 12, fill: "#9ca3af" }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: narrow ? 11 : 12 }} />
        {symbols.map((symbol, index) => (
          <Line
            key={symbol}
            type="monotone"
            dataKey={symbol}
            dot={false}
            stroke={colors[index % colors.length]}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </div>
  );
}
