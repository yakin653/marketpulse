import axios from 'axios';
import mockData from '../mock/data.json';
import { Asset } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000,
});

export const getAssets = async (): Promise<string[]> => {
  try {
    const { data } = await api.get('/assets');
    return data;
  } catch (error) {
    console.warn("Backend non disponible, utilisation des données mock.");
    return mockData.assets;
  }
};

export const getAsset = async (symbol: string): Promise<Asset | null> => {
  try {
    const { data } = await api.get(`/assets/${symbol}`);
    return data;
  } catch (error) {
    console.warn(`Backend non disponible pour ${symbol}, utilisation du mock.`);
    return (mockData as any)[symbol] || null;
  }
};

export default api;
