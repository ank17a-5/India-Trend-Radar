// API Service for consuming real India Trend Radar FastAPI endpoints

export interface RisingTrend {
  keyword: string;
  prediction_date: string;
  forecasting_date: string;
  forecast_score: number;
  predicted_viral: number;
  viral_probability: number;
  is_anomaly: number;
  anomaly_score: number;
  india_trend_score: number;
  trend_rank: number;
}

export interface TopNiche {
  keyword: string;
  india_trend_score: number;
  viral_probability: number;
  trend_rank: number;
}

export interface ForecastPoint {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

export interface ForecastResponse {
  topic: string;
  forecast_type: string;
  forecast: ForecastPoint[];
  error?: string;
}

export interface AnomalyRecord {
  keyword: string;
  trend_score: number;
  trend_rank: number;
  iso_score: number;
  iso_anomaly: number;
  z_score_max: number;
  z_anomaly: number;
  is_anomaly: number;
  anomaly_score: number;
}

export interface AnomalyResponse {
  count: number;
  anomalies: AnomalyRecord[];
  error?: string;
}

export interface EvaluationMetric {
  section: string;
  metric: string;
  value: string;
}

export interface EvaluationResponse {
  metrics: EvaluationMetric[];
  error?: string;
}

const API_BASE = "/api";

export const formatKeyword = (rawKeyword: string): string => {
  if (!rawKeyword) return "";
  const parts = rawKeyword
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return rawKeyword;
  return parts
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" • ");
};

export async function fetchRisingTrends(): Promise<RisingTrend[]> {
  const res = await fetch(`${API_BASE}/trends/rising`);
  if (!res.ok) {
    throw new Error(`Failed to fetch rising trends: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchTopNiches(): Promise<TopNiche[]> {
  const res = await fetch(`${API_BASE}/niches/top`);
  if (!res.ok) {
    throw new Error(`Failed to fetch top niches: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchForecast(topic: string = "overall"): Promise<ForecastResponse> {
  const encodedTopic = encodeURIComponent(topic);
  const res = await fetch(`${API_BASE}/trends/forecast/${encodedTopic}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch forecast: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchAnomalies(limit: number = 20): Promise<AnomalyResponse> {
  const res = await fetch(`${API_BASE}/anomalies?limit=${limit}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch anomalies: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchEvaluation(): Promise<EvaluationResponse> {
  const res = await fetch(`${API_BASE}/evaluation`);
  if (!res.ok) {
    throw new Error(`Failed to fetch evaluation metrics: ${res.statusText}`);
  }
  return res.json();
}
