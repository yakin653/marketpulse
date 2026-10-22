export function calculatePulseScore(asset: any): { score: number, composantes: any } {
  const prob = asset.probabilite_hausse_pct || 50; 
  const noteProb = prob;

  const sentiment = asset.sentiment_30j?.score_moyen || 0; 
  const noteSentiment = 50 + (sentiment * 50);

  const ma20 = asset.ma20 || 0;
  const ma50 = asset.ma50 || 0;
  const ecart = ma50 !== 0 ? (ma20 - ma50) / ma50 : 0;
  const noteTendance = Math.max(0, Math.min(100, 50 + (ecart * 500)));

  const vol = asset.volatilite_annualisee_pct || 0;
  const noteVol = Math.max(0, Math.min(100, 100 - (vol / 0.60) * 100));

  const dd = Math.abs(asset.max_drawdown_pct || 0);
  const noteDd = Math.max(0, Math.min(100, 100 - (dd / 0.50) * 100));

  const score = Math.round(
    (noteProb * 0.30) + (noteSentiment * 0.25) + (noteTendance * 0.20) + (noteVol * 0.15) + (noteDd * 0.10)
  );

  return { score, composantes: { prob: noteProb, sentiment: noteSentiment, tendance: noteTendance, volatilite: noteVol, drawdown: noteDd } };
}