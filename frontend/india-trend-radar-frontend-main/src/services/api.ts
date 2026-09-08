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

export interface ApiFetchOptions {
  maxTimeoutMs?: number;
  attemptTimeoutMs?: number;
  onRetry?: (attempt: number, elapsedMs: number) => void;
}

export function resetBackendReadyState() {}

export async function ensureBackendReady(): Promise<boolean> {
  return true;
}

async function apiFetch<T>(
  path: string,
  errorMessage: string,
  options?: ApiFetchOptions
): Promise<T> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const isDev = import.meta.env.DEV;

  // Multi-candidate endpoint targets: same-origin Vercel proxy first (/api/...), then direct backend URL
  const candidates: string[] = [];
  
  if (import.meta.env.VITE_API_BASE_URL) {
    const customBase = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
    if (customBase.startsWith("http")) {
      candidates.push(`${customBase}${cleanPath}`);
    }
  }

  if (isDev) {
    candidates.push(`http://localhost:8000${cleanPath}`);
    candidates.push(`/api${cleanPath}`);
    candidates.push(`https://india-trend-radar-dvhs.onrender.com${cleanPath}`);
  } else {
    candidates.push(`/api${cleanPath}`);
    candidates.push(`https://india-trend-radar-dvhs.onrender.com${cleanPath}`);
  }

  let lastError: any = null;

  for (const targetUrl of candidates) {
    console.log(`[API Request] Attempting fetch from: ${targetUrl}`);
    const timeoutMs = options?.attemptTimeoutMs ?? 90000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(targetUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          console.warn(`[API Candidate Skip] ${targetUrl} returned HTML instead of JSON. Trying next candidate.`);
          continue;
        }
        const data = await res.json();
        console.log(`[API Response] Successfully loaded live data from: ${targetUrl}`);
        return data as T;
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;
      console.warn(`[API Candidate Error] Request failed for ${targetUrl}:`, err?.message || err);
    }
  }

  console.error(`[API Error] All candidates failed for ${path}:`, lastError?.message || lastError);
  throw lastError || new Error(`${errorMessage}: All backend API candidates failed.`);
}

export async function fetchRisingTrends(
  limitOrDateRange: number | string = 50,
  source: string = "all",
  options?: ApiFetchOptions
): Promise<RisingTrend[]> {
  let limit = 50;
  let dateRange = "7d";

  if (typeof limitOrDateRange === "number") {
    limit = limitOrDateRange;
  } else if (typeof limitOrDateRange === "string") {
    dateRange = limitOrDateRange;
  }

  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    date_range: dateRange,
    source: source,
  }).toString();

  return apiFetch<RisingTrend[]>(
    `/trends/rising?${queryParams}`,
    "Failed to fetch rising trends",
    options
  );
}

export async function fetchTopNiches(options?: ApiFetchOptions): Promise<TopNiche[]> {
  return apiFetch<TopNiche[]>("/niches/top", "Failed to fetch top niches", options);
}

export async function fetchForecast(
  topic: string = "overall",
  options?: ApiFetchOptions
): Promise<ForecastResponse> {
  const encodedTopic = encodeURIComponent(topic);
  return apiFetch<ForecastResponse>(
    `/trends/forecast/${encodedTopic}`,
    "Failed to fetch forecast",
    options
  );
}

export async function fetchAnomalies(
  limit: number = 20,
  options?: ApiFetchOptions
): Promise<AnomalyResponse> {
  return apiFetch<AnomalyResponse>(
    `/anomalies?limit=${limit}`,
    "Failed to fetch anomalies",
    options
  );
}

export async function fetchEvaluation(options?: ApiFetchOptions): Promise<EvaluationResponse> {
  return apiFetch<EvaluationResponse>(
    "/evaluation",
    "Failed to fetch evaluation metrics",
    options
  );
}
