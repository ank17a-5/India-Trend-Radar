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

const RAW_API_URL = import.meta.env.VITE_API_URL || "/api";
const API_BASE = RAW_API_URL.replace(/\/$/, "");

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

async function apiFetch<T>(path: string, errorMessage: string): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 502) {
        throw new Error(
          `${errorMessage}: Bad Gateway (502). The backend API server is offline or unreachable. Please verify backend server status.`
        );
      }
      if (res.status === 504) {
        throw new Error(`${errorMessage}: Gateway Timeout (504). The backend server took too long to respond.`);
      }
      if (res.status === 404) {
        throw new Error(`${errorMessage}: Endpoint not found (404) at ${url}.`);
      }
      throw new Error(`${errorMessage}: HTTP ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      throw new Error(
        `${errorMessage}: Received HTML response instead of JSON. Check backend routing or VITE_API_URL configuration.`
      );
    }

    return (await res.json()) as T;
  } catch (err: any) {
    if (err instanceof TypeError && err.message.toLowerCase().includes("failed to fetch")) {
      throw new Error(
        `${errorMessage}: Network connection failed. Please ensure backend server is running.`
      );
    }
    throw err;
  }
}

export async function fetchRisingTrends(): Promise<RisingTrend[]> {
  return apiFetch<RisingTrend[]>("/trends/rising", "Failed to fetch rising trends");
}

export async function fetchTopNiches(): Promise<TopNiche[]> {
  return apiFetch<TopNiche[]>("/niches/top", "Failed to fetch top niches");
}

export async function fetchForecast(topic: string = "overall"): Promise<ForecastResponse> {
  const encodedTopic = encodeURIComponent(topic);
  return apiFetch<ForecastResponse>(`/trends/forecast/${encodedTopic}`, "Failed to fetch forecast");
}

export async function fetchAnomalies(limit: number = 20): Promise<AnomalyResponse> {
  return apiFetch<AnomalyResponse>(`/anomalies?limit=${limit}`, "Failed to fetch anomalies");
}

export async function fetchEvaluation(): Promise<EvaluationResponse> {
  return apiFetch<EvaluationResponse>("/evaluation", "Failed to fetch evaluation metrics");
}
