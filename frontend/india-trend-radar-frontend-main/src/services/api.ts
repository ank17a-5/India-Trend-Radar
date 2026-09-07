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

const RAW_API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "/api";
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

export interface ApiFetchOptions {
  maxTimeoutMs?: number;
  attemptTimeoutMs?: number;
  onRetry?: (attempt: number, elapsedMs: number) => void;
}

async function apiFetch<T>(
  path: string,
  errorMessage: string,
  options?: ApiFetchOptions
): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  const maxTimeoutMs = options?.maxTimeoutMs ?? 90000;
  const attemptTimeoutMs = options?.attemptTimeoutMs ?? 20000;
  const startTime = Date.now();

  let attempt = 0;
  let lastError: Error | null = null;

  while (Date.now() - startTime < maxTimeoutMs) {
    attempt++;
    const controller = new AbortController();
    const remainingTime = maxTimeoutMs - (Date.now() - startTime);
    if (remainingTime <= 0) break;

    const currentAttemptTimeout = Math.min(attemptTimeoutMs, remainingTime);
    const timeoutId = setTimeout(() => controller.abort(), currentAttemptTimeout);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        // Cold start status codes (Render sleeping: 502, 503, 504)
        if (res.status === 502 || res.status === 503 || res.status === 504) {
          throw new Error(
            `${errorMessage}: Server waking up (HTTP ${res.status}).`
          );
        }
        // Permanent 4xx errors (404, 400, 401, 403) should fail immediately
        if (res.status >= 400 && res.status < 500) {
          throw new Error(`${errorMessage}: Endpoint error (HTTP ${res.status} ${res.statusText}).`);
        }
        throw new Error(`${errorMessage}: Server error (HTTP ${res.status} ${res.statusText}).`);
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        throw new Error(
          `${errorMessage}: Received HTML response instead of JSON. Check backend routing or VITE_API_URL configuration.`
        );
      }

      return (await res.json()) as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;

      // Fail fast on non-retryable 4xx or HTML errors
      if (err.message && (err.message.includes("Endpoint error") || err.message.includes("Received HTML"))) {
        throw err;
      }

      const elapsed = Date.now() - startTime;
      if (elapsed >= maxTimeoutMs) {
        break;
      }

      if (options?.onRetry) {
        options.onRetry(attempt, elapsed);
      }

      // Progressive delay before next retry attempt (3s to 5s)
      const delayMs = Math.min(3000 + attempt * 500, 5000);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw (
    lastError ||
    new Error(
      `${errorMessage}: Analytics engine took longer than 90 seconds to respond. Please check backend status.`
    )
  );
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

