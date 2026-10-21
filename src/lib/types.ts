export interface Asset {
  symbol: string;
  prix_actuel: number;
  tendance: string;
  ma20: number;
  ma50: number;
  volatilite_annualisee_pct?: number;
  max_drawdown_pct?: number;
}

export interface Company {
  symbol: string;
  note: string;
  tags: string[];
  dateAjout: string;
}
