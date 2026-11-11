import axios from 'axios';
import mockData from '../mock/data.json';
import { Asset } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 10000,
  withCredentials: true,
});

export const getAssets = async (): Promise<string[]> => {
  try {
    const { data } = await api.get('/assets');
    return data;
  } catch {
    console.warn("Backend non disponible, utilisation des données mock.");
    return mockData.assets;
  }
};

export const getAsset = async (symbol: string): Promise<Asset | null> => {
  try {
    const { data } = await api.get(`/assets/${symbol}`);
    return data;
  } catch {
    console.warn(`Backend non disponible pour ${symbol}, utilisation du mock.`);
    const table = mockData as unknown as Record<string, Asset>;
    return table[symbol] ?? null;
  }
};

export default api;
