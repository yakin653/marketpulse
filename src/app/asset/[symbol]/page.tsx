"use client";

import { use } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useResource } from "@/hooks/useResource";
import { calculatePulseScore } from "@/lib/pulse";
import { formatPct, formatPrice, trendLabel } from "@/lib/format";
import dynamic from "next/dynamic";
import PulseDetails from "@/components/PulseDetails";

const PulseScore = dynamic(() => import("@/components/PulseScore"), { ssr: false });
const PriceChart = dynamic(() => import("@/components/PriceChart"), { ssr: false, loading: () => <div className="h-72 animate-pulse bg-[#0B0E11] rounded-lg" /> });
import SourceBadge from "@/components/SourceBadge";
import DataOrigin from "@/components/DataOrigin";
import MlCard from "@/components/MlCard";
import AiReviewInteractive from "@/components/AiReviewInteractive";
import ChatDock from "@/components/ChatDock";
import PulseLab from "@/components/PulseLab";
import mockData from "@/mock/data.json";

type MarketAsset = {
  nom?: string | null;
  prix_actuel?: number | null;
  date?: string | null;
  variation_1j_pct?: number | null;
  tendance?: string | null;
  ma20?: number | null;
  ma50?: number | null;
  volatilite_annualisee_pct?: number | null;
  max_drawdown_pct?: number | null;
  origine?: string | null;
  nb_observations?: number | null;
  probabilite_hausse_pct?: number | null;
  baseline_toujours_hausse_pct?: number | null;
  precision_modele_pct?: number | null;
  ml_message?: string | null;
};

type HistoryPayload = { points?: { date?: string; close?: number | null; ma20?: number | null; ma50?: number | null }[] };

type Insight = {
  probabilite_hausse_pct?: number | null;
  ml_disponible?: boolean;
  message?: string | null;
  baseline_toujours_hausse_pct?: number | null;
  precision_modele_pct?: number | null;
  nb_observations?: number | null;
  avertissement?: string | null;
};

export default function AssetPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = use(params);
  const mockAsset = (mockData as Record<string, unknown>)[symbol] ?? null;

  const { data: asset, source: sourceAsset, loading: loadingAsset } = useResource<MarketAsset | null>(
    `asset-${symbol}`,
    `/assets/${symbol}`,
    (mockAsset as MarketAsset | null)
  );
  const { data: history, source: sourceHistory, loading: loadingHistory } = useResource<HistoryPayload>(
    `history-${symbol}`,
    `/assets/${symbol}/history?limit=120`,
    { points: [] }
  );
  const { data: anomalies } = useResource<{ dates?: string[] } | null>(
    `anomalies-${symbol}`,
    `/anomalies/${symbol}`,
    null
  );
  const { data: insight, loading: loadingInsight } = useResource<Insight | null>(
    `insight-${symbol}`,
    `/insight/${symbol}`,
    null
  );

  if (loadingAsset || loadingHistory) {
    return (
      <div className="flex justify-center mt-20" role="status">
        <Loader2 className="animate-spin" size={40} />
        <span className="sr-only">Chargement de {symbol}</span>
      </div>
    );
  }

  if (!asset || asset.prix_actuel == null) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center space-y-3">
        <h1 className="text-2xl font-bold">{symbol}</h1>
        <p className="text-gray-400">Aucune série de cours n&apos;est disponible pour ce symbole. Aucun prix n&apos;a été inventé.</p>
        <Link href="/markets" className="text-[var(--accent)] hover:underline">Retour aux marchés</Link>
      </div>
    );
  }

  const pulse = calculatePulseScore(asset);
  const change = asset.variation_1j_pct as number | null | undefined;
  const changeTone = change == null ? "text-gray-400" : change > 0 ? "text-[var(--positive)]" : change < 0 ? "text-[var(--negative)]" : "text-gray-300";
  const origine = sourceAsset === "mock" ? "mock" : asset.origine;

  return (
    <div className="max-w-5xl mx-auto space-y-6 print:bg-white print:text-black">
      <div className="bg-[var(--surface)] p-6 rounded-xl border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="min-w-0">
              <h1 className="text-4xl font-bold tracking-tight">{symbol}</h1>
              {asset.nom && <p className="text-sm text-gray-300">{asset.nom}</p>}
            </div>
            <DataOrigin origine={origine} asOf={asset.date} />
            {sourceAsset === "cache" && <SourceBadge source="cache" />}
          </div>
          <p className="text-3xl font-semibold num">
            {formatPrice(asset.prix_actuel)} <span className="text-lg text-gray-400">USD</span>
          </p>
          <p className={`mt-2 text-sm font-medium num ${changeTone}`}>
            {change == null ? "Variation sur une séance non calculée" : `${formatPct(change)} sur la séance précédente`}
          </p>
          <p className="text-sm text-gray-400 mt-1">{trendLabel(asset.tendance)}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-4 text-sm text-gray-400">
            <p>MM20 <span className="text-[var(--text)] num">{asset.ma20 == null ? "—" : formatPrice(asset.ma20)}</span></p>
            <p>MM50 <span className="text-[var(--text)] num">{asset.ma50 == null ? "—" : formatPrice(asset.ma50)}</span></p>
            <p>Volatilité <span className="text-[var(--text)] num">{asset.volatilite_annualisee_pct == null ? "—" : `${Number(asset.volatilite_annualisee_pct).toFixed(1)} %`}</span></p>
            <p>Repli max. <span className="text-[var(--text)] num">{asset.max_drawdown_pct == null ? "—" : `${Number(asset.max_drawdown_pct).toFixed(1)} %`}</span></p>
          </div>
        </div>
        <PulseScore score={pulse.score} />
      </div>

      <PulseDetails score={pulse.score} parts={pulse.composantes} explication={pulse.explication} />
      <PulseLab parts={pulse.composantes} />

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <MlCard
            probability={!loadingInsight && insight ? insight.probabilite_hausse_pct : asset.probabilite_hausse_pct}
            baseline={!loadingInsight && insight ? insight.baseline_toujours_hausse_pct : asset.baseline_toujours_hausse_pct}
            accuracy={!loadingInsight && insight ? insight.precision_modele_pct : asset.precision_modele_pct}
            message={!loadingInsight && insight ? insight.message : asset.ml_message}
            observations={!loadingInsight && insight ? insight.nb_observations : asset.nb_observations}
          />
        </div>
        <div className="lg:col-span-2 bg-[var(--surface)] p-6 rounded-xl border border-gray-800">
          <h2 className="text-lg font-bold mb-3">Ce que mesurent les moyennes</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            La MM20 est la moyenne des 20 dernières clôtures, la MM50 celle des 50 dernières. Elles ne sont affichées que si la fenêtre est complète.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed mt-3">
            {asset.origine === "yahoo"
              ? `${asset.nb_observations ?? "—"} séances Yahoo Finance servent à ces calculs.`
              : `${asset.nb_observations ?? "—"} séances servent à ces calculs.`}
          </p>
        </div>
      </div>

      <div className="bg-[var(--surface)] p-6 rounded-xl border border-gray-800">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
          <h2 className="text-xl font-bold">Historique des clôtures</h2>
          {sourceHistory !== "network" && <SourceBadge source={sourceHistory} />}
        </div>
        <p className="text-sm text-gray-500 mb-2">MM20 en doré, MM50 en violet. Les moyennes commencent dès que la fenêtre est pleine.</p>
        <PriceChart data={history?.points || []} anomalies={anomalies?.dates || []} />
      </div>

      <AiReviewInteractive key={symbol} symbol={symbol} />
      <ChatDock symbol={symbol} />
    </div>
  );
}
