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

console.log(`[API Config] Resolved API Base URL: "${API_BASE}"`);

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

// Global state to track whether backend health has been established
let backendIsReady = false;
let activeHealthCheckPromise: Promise<boolean> | null = null;

/**
 * Pings backend /health endpoint to wake up Render free tier container safely
 * before executing heavier data endpoints. Uses controlled exponential backoff.
 */

export function resetBackendReadyState() {
  backendIsReady = false;
  activeHealthCheckPromise = null;
}

export async function ensureBackendReady(
  onRetry?: (attempt: number, elapsedMs: number) => void,
  maxTimeoutMs: number = 120000
): Promise<boolean> {
  if (backendIsReady) return true;

  if (activeHealthCheckPromise) {
    return activeHealthCheckPromise;
  }

  activeHealthCheckPromise = (async () => {
    const healthUrl = `${API_BASE}/health`;
    const startTime = Date.now();
    let attempt = 0;
    const maxAttempts = 15;

    console.log(`[API Init] Pinging backend health check at: ${healthUrl}`);

    while (Date.now() - startTime < maxTimeoutMs && attempt < maxAttempts) {
      attempt++;
      const elapsed = Date.now() - startTime;
      console.log(`[API Init] Health check ping attempt #${attempt} (${Math.round(elapsed / 1000)}s elapsed)...`);

      const controller = new AbortController();
      const attemptTimeout = setTimeout(() => controller.abort(), 12000);

      try {
        const res = await fetch(healthUrl, { signal: controller.signal });
        clearTimeout(attemptTimeout);

        if (res.ok) {
          console.log(`[API Init] Backend is healthy & online! (Status ${res.status})`);
          backendIsReady = true;
          activeHealthCheckPromise = null;
          return true;
        }
      } catch (err: any) {
        clearTimeout(attemptTimeout);
        console.warn(`[API Init] Health ping #${attempt} pending:`, err?.message || err);
      }

      if (onRetry) {
        onRetry(attempt, Date.now() - startTime);
      }

      // Controlled exponential backoff (3s, 4s, 5s, 6s...)
      const delayMs = Math.min(3000 + attempt * 500, 6000);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    activeHealthCheckPromise = null;
    throw new Error(`Backend connection is taking longer than expected. Please check that the analytics server is online at ${API_BASE}.`);
  })();

  return activeHealthCheckPromise;
}

async function apiFetch<T>(
  path: string,
  errorMessage: string,
  options?: ApiFetchOptions
): Promise<T> {
  const maxTimeoutMs = options?.maxTimeoutMs ?? 120000;

  // Step 1: Ensure backend is healthy first
  await ensureBackendReady(options?.onRetry, maxTimeoutMs);

  // Step 2: Execute actual API data request
  const url = `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  console.log(`[API Request] Fetching data: ${url}`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options?.attemptTimeoutMs ?? 30000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status >= 400 && res.status < 500) {
        throw new Error(`${errorMessage}: Endpoint error (HTTP ${res.status} ${res.statusText}).`);
      }
      throw new Error(`${errorMessage}: Server error (HTTP ${res.status} ${res.statusText}).`);
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      throw new Error(`${errorMessage}: Received HTML response instead of JSON. Check backend routing.`);
    }

    const data = await res.json();
    console.log(`[API Response] Successfully loaded data from: ${path}`);
    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error(`[API Error] Request failed for ${path}:`, err);
    throw err;
  }
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
