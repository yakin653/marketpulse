import type { ReactNode } from "react";

/** Fond de graphiques et carte centrée, comme un écran de connexion de plateforme. */
export default function AuthFrame({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-full overflow-hidden">
      <ChartBackdrop />
      <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-[440px] rounded-2xl border border-cyan-300/25 bg-[#0b1626]/80 p-7 shadow-[0_20px_80px_rgba(0,0,0,0.45),0_0_40px_rgba(34,211,238,0.12)] backdrop-blur-xl sm:p-8">
          {title && <h1 className="mb-5 text-center text-2xl font-semibold tracking-tight text-white">{title}</h1>}
          {children}
        </div>
      </main>
    </div>
  );
}

function ChartBackdrop() {
  const candles = [70, 150, 230, 310, 1040, 1120, 1200, 1280, 1360];
  return (
    <div className="pointer-events-none absolute inset-0 bg-[#07111d]" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(34,211,238,0.18),transparent_36%),radial-gradient(circle_at_82%_62%,rgba(37,99,235,0.22),transparent_40%)]" />
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: "linear-gradient(rgba(56,189,248,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.18) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <path d="M40 620 C 180 600, 260 430, 420 470 S 620 690, 780 560 S 980 300, 1180 380 S 1320 520, 1420 340" fill="none" stroke="#22d3ee" strokeWidth="3" opacity="0.85" />
        <path d="M20 700 C 200 680, 340 760, 520 640 S 760 480, 980 560 S 1200 720, 1420 600" fill="none" stroke="#34d399" strokeWidth="2" opacity="0.55" />
        {candles.map((x, index) => {
          const up = index % 2 === 0;
          const top = 180 + (index % 4) * 36;
          const height = 90 + (index % 3) * 28;
          return (
            <g key={x} opacity="0.55">
              <line x1={x + 8} x2={x + 8} y1={top - 24} y2={top + height + 24} stroke={up ? "#22d3ee" : "#67e8f9"} strokeWidth="2" />
              <rect x={x} y={top} width="16" height={height} rx="2" fill={up ? "#0891b2" : "#155e75"} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
