import axios from 'axios';
import { API_BASE_URL } from './api-config';
import type { StockAnalysis, StockSearchResult } from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export async function fetchStockAnalysis(code: string): Promise<StockAnalysis> {
  const resp = await api.get<StockAnalysis>('/analyze', { params: { code } });
  return resp.data;
}

export async function searchStocks(keyword: string): Promise<StockSearchResult> {
  if (!keyword.trim()) return { stocks: [] };
  const resp = await api.get<StockSearchResult>('/search', { params: { keyword } });
  return resp.data;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const resp = await api.get('/health');
    return resp.data?.status === 'ok';
  } catch {
    return false;
  }
}
