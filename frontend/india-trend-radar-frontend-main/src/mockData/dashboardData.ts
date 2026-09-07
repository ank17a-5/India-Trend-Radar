// TypeScript interface definitions and mock data for India Trend Radar frontend dashboard

export interface KPICardData {
  title: string;
  value: string | number;
  change: number; // percentage change
  isPositive: boolean;
  timeframe: string;
  gradient: string;
}

export interface TrendTimelineItem {
  date: string;
  "AI Agents": number;
  "Electric Vehicles": number;
  "Hydrogen Fuel": number;
  "Quantum Computing": number;
  "UPI Global": number;
  "SpaceTech": number;
}

export interface SourceDistributionItem {
  name: string;
  value: number;
  color: string;
}

export interface TrendingTopic {
  rank: number;
  keyword: string;
  category: string;
  mentions: number;
  growth: number;
  sentiment: "Positive" | "Neutral" | "Negative";
  virality: "High" | "Medium" | "Low";
  status: "Active" | "Spike" | "Declining";
}

export interface ForecastItem {
  date: string;
  actual?: number;
  predicted: number;
  lowerBound: number;
  upperBound: number;
}

export interface ForecastCard {
  days: number;
  accuracy: number;
  direction: "UP" | "DOWN" | "STABLE";
  summary: string;
}

export interface TrendScoreItem {
  rank: number;
  keyword: string;
  score: number;
  growth: number;
  forecast: string;
  metrics: {
    subject: string;
    value: number;
    fullMark: number;
  }[];
}

export interface AnomalyItem {
  id: string;
  topic: string;
  severity: "Critical" | "Medium" | "Low";
  reason: string;
  time: string;
  volume: number;
  spikeFactor: number; // e.g., 3.5x
  source: string;
}

export interface ModelMetricItem {
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface ROCPoint {
  fpr: number;
  tpr: number;
}

export interface ConfusionMatrixCell {
  actual: string;
  predicted: string;
  value: number;
}

// -----------------------------------------
// DATA IMPLEMENTATION
// -----------------------------------------

export const kpiData: KPICardData[] = [
  {
    title: "Total Active Trends",
    value: "1,482",
    change: 12.4,
    isPositive: true,
    timeframe: "vs last week",
    gradient: "from-blue-600/20 to-blue-500/10 border-blue-500/30",
  },
  {
    title: "Trending Today",
    value: "47",
    change: 8.2,
    isPositive: true,
    timeframe: "vs yesterday",
    gradient: "from-purple-600/20 to-purple-500/10 border-purple-500/30",
  },
  {
    title: "Anomalies Detected",
    value: "12",
    change: -25.0,
    isPositive: true, // Decreasing anomalies is positive
    timeframe: "vs last week",
    gradient: "from-orange-600/20 to-orange-500/10 border-orange-500/30",
  },
  {
    title: "Forecast Accuracy",
    value: "94.2%",
    change: 0.8,
    isPositive: true,
    timeframe: "vs baseline model",
    gradient: "from-emerald-600/20 to-emerald-500/10 border-emerald-500/30",
  },
];

export const homeTrendTimeline: TrendTimelineItem[] = [
  { date: "Jul 15", "AI Agents": 40, "Electric Vehicles": 24, "Hydrogen Fuel": 10, "Quantum Computing": 5, "UPI Global": 30, "SpaceTech": 15 },
  { date: "Jul 18", "AI Agents": 48, "Electric Vehicles": 28, "Hydrogen Fuel": 12, "Quantum Computing": 8, "UPI Global": 32, "SpaceTech": 17 },
  { date: "Jul 21", "AI Agents": 52, "Electric Vehicles": 35, "Hydrogen Fuel": 45, "Quantum Computing": 10, "UPI Global": 35, "SpaceTech": 18 },
  { date: "Jul 24", "AI Agents": 65, "Electric Vehicles": 42, "Hydrogen Fuel": 60, "Quantum Computing": 11, "UPI Global": 37, "SpaceTech": 22 },
  { date: "Jul 27", "AI Agents": 78, "Electric Vehicles": 48, "Hydrogen Fuel": 28, "Quantum Computing": 13, "UPI Global": 40, "SpaceTech": 35 },
  { date: "Jul 30", "AI Agents": 92, "Electric Vehicles": 50, "Hydrogen Fuel": 22, "Quantum Computing": 15, "UPI Global": 45, "SpaceTech": 40 },
  { date: "Aug 01", "AI Agents": 110, "Electric Vehicles": 55, "Hydrogen Fuel": 18, "Quantum Computing": 16, "UPI Global": 48, "SpaceTech": 45 },
];

export const sourceDistribution: SourceDistributionItem[] = [
  { name: "Twitter/X", value: 45, color: "#2563EB" },
  { name: "News/Media", value: 25, color: "#7C3AED" },
  { name: "Reddit", value: 15, color: "#F97316" },
  { name: "Google Trends", value: 15, color: "#22C55E" },
];

export const topTrendingTopics: TrendingTopic[] = [
  { rank: 1, keyword: "AI Agents", category: "Technology", mentions: 12540, growth: 22.4, sentiment: "Positive", virality: "High", status: "Spike" },
  { rank: 2, keyword: "UPI Global Expansion", category: "Finance", mentions: 8920, growth: 18.7, sentiment: "Positive", virality: "High", status: "Active" },
  { rank: 3, keyword: "SpaceTech Funding", category: "Aerospace", mentions: 6420, growth: 25.0, sentiment: "Positive", virality: "High", status: "Spike" },
  { rank: 4, keyword: "Electric Vehicles (EV)", category: "Automotive", mentions: 5800, growth: 15.8, sentiment: "Positive", virality: "Medium", status: "Active" },
  { rank: 5, keyword: "Green Hydrogen", category: "Energy", mentions: 4900, growth: 34.1, sentiment: "Neutral", virality: "High", status: "Spike" },
  { rank: 6, keyword: "Quantum Computing Labs", category: "Technology", mentions: 3100, growth: 5.2, sentiment: "Positive", virality: "Low", status: "Active" },
  { rank: 7, keyword: "Smart City Infrastructure", category: "Civic", mentions: 2900, growth: 4.2, sentiment: "Neutral", virality: "Medium", status: "Active" },
  { rank: 8, keyword: "5G Telephony Rollout", category: "Telecom", mentions: 1800, growth: -2.1, sentiment: "Neutral", virality: "Low", status: "Declining" },
];

export const aiInsights = [
  { id: 1, text: "🔥 AI Agents mentions increased by 22.4% over the last 3 days, driven by open-source releases.", type: "spike" },
  { id: 2, text: "📈 Electric Vehicles entered the Top 5 trending topics for the first time this month.", type: "info" },
  { id: 3, text: "🚨 Hydrogen Fuel anomaly detected: abnormal activity spike on News channels (34.1%).", type: "anomaly" },
  { id: 4, text: "🔮 AI Agents are forecast to dominate discussions next week with high confidence (94.2%).", type: "forecast" },
];

// -----------------------------------------
// FORECAST DATA
// -----------------------------------------

export const forecastCards: ForecastCard[] = [
  { days: 7, accuracy: 96.5, direction: "UP", summary: "Strong upward movement expected for Tech and FinTech categories." },
  { days: 14, accuracy: 94.2, direction: "UP", summary: "Energy sectors expected to stabilize; SpaceTech to gain strong momentum." },
  { days: 30, accuracy: 89.8, direction: "STABLE", summary: "General consolidation across core sectors. AI topics remain high but steady." },
];

export const forecastTimelineData: ForecastItem[] = [
  { date: "Jul 25", actual: 80, predicted: 80, lowerBound: 80, upperBound: 80 },
  { date: "Jul 26", actual: 82, predicted: 81, lowerBound: 79, upperBound: 83 },
  { date: "Jul 27", actual: 85, predicted: 84, lowerBound: 81, upperBound: 87 },
  { date: "Jul 28", actual: 89, predicted: 87, lowerBound: 83, upperBound: 91 },
  { date: "Jul 29", actual: 91, predicted: 90, lowerBound: 85, upperBound: 95 },
  { date: "Jul 30", actual: 95, predicted: 93, lowerBound: 87, upperBound: 99 },
  { date: "Aug 01", actual: 110, predicted: 108, lowerBound: 98, upperBound: 118 },
  // Future Predictions
  { date: "Aug 02", predicted: 112, lowerBound: 101, upperBound: 123 },
  { date: "Aug 03", predicted: 115, lowerBound: 103, upperBound: 127 },
  { date: "Aug 04", predicted: 120, lowerBound: 106, upperBound: 134 },
  { date: "Aug 05", predicted: 124, lowerBound: 108, upperBound: 140 },
  { date: "Aug 06", predicted: 129, lowerBound: 112, upperBound: 146 },
  { date: "Aug 07", predicted: 135, lowerBound: 115, upperBound: 155 },
  { date: "Aug 08", predicted: 138, lowerBound: 117, upperBound: 159 },
  { date: "Aug 15", predicted: 152, lowerBound: 125, upperBound: 179 },
  { date: "Aug 22", predicted: 165, lowerBound: 132, upperBound: 198 },
  { date: "Aug 30", predicted: 180, lowerBound: 140, upperBound: 220 },
];

export const predictionTableData = [
  { keyword: "AI Agents", currentMentions: 12540, forecastDays: 30, expectedValue: 24200, growth: 93.0, confidence: "High" },
  { keyword: "UPI Global Expansion", currentMentions: 8920, forecastDays: 30, expectedValue: 14500, growth: 62.5, confidence: "High" },
  { keyword: "SpaceTech Funding", currentMentions: 6420, forecastDays: 30, expectedValue: 11000, growth: 71.3, confidence: "Medium" },
  { keyword: "Green Hydrogen", currentMentions: 4900, forecastDays: 14, expectedValue: 7100, growth: 44.9, confidence: "Medium" },
  { keyword: "Electric Vehicles (EV)", currentMentions: 5800, forecastDays: 30, expectedValue: 7800, growth: 34.5, confidence: "High" },
  { keyword: "Quantum Computing", currentMentions: 3100, forecastDays: 30, expectedValue: 3600, growth: 16.1, confidence: "Low" },
];

// -----------------------------------------
// INDIA TREND SCORE DATA
// -----------------------------------------

export const trendScoreData: TrendScoreItem[] = [
  {
    rank: 1,
    keyword: "AI Agents",
    score: 98.4,
    growth: 22.4,
    forecast: "Strong Spike",
    metrics: [
      { subject: "Virality", value: 98, fullMark: 100 },
      { subject: "Sentiment", value: 92, fullMark: 100 },
      { subject: "Volume", value: 99, fullMark: 100 },
      { subject: "Growth Rate", value: 95, fullMark: 100 },
      { subject: "Media Coverage", value: 96, fullMark: 100 },
    ],
  },
  {
    rank: 2,
    keyword: "UPI Global Expansion",
    score: 94.6,
    growth: 18.7,
    forecast: "Consistent Grow",
    metrics: [
      { subject: "Virality", value: 90, fullMark: 100 },
      { subject: "Sentiment", value: 97, fullMark: 100 },
      { subject: "Volume", value: 94, fullMark: 100 },
      { subject: "Growth Rate", value: 89, fullMark: 100 },
      { subject: "Media Coverage", value: 93, fullMark: 100 },
    ],
  },
  {
    rank: 3,
    keyword: "SpaceTech Funding",
    score: 89.2,
    growth: 25.0,
    forecast: "High Volatility",
    metrics: [
      { subject: "Virality", value: 95, fullMark: 100 },
      { subject: "Sentiment", value: 88, fullMark: 100 },
      { subject: "Volume", value: 78, fullMark: 100 },
      { subject: "Growth Rate", value: 97, fullMark: 100 },
      { subject: "Media Coverage", value: 86, fullMark: 100 },
    ],
  },
  {
    rank: 4,
    keyword: "Green Hydrogen",
    score: 86.8,
    growth: 34.1,
    forecast: "Short-term Spike",
    metrics: [
      { subject: "Virality", value: 93, fullMark: 100 },
      { subject: "Sentiment", value: 82, fullMark: 100 },
      { subject: "Volume", value: 68, fullMark: 100 },
      { subject: "Growth Rate", value: 98, fullMark: 100 },
      { subject: "Media Coverage", value: 85, fullMark: 100 },
    ],
  },
  {
    rank: 5,
    keyword: "Electric Vehicles (EV)",
    score: 82.5,
    growth: 15.8,
    forecast: "Steady Growth",
    metrics: [
      { subject: "Virality", value: 78, fullMark: 100 },
      { subject: "Sentiment", value: 89, fullMark: 100 },
      { subject: "Volume", value: 87, fullMark: 100 },
      { subject: "Growth Rate", value: 80, fullMark: 100 },
      { subject: "Media Coverage", value: 82, fullMark: 100 },
    ],
  },
];

export const scoreDistributionData = [
  { range: "0-20", count: 140 },
  { range: "21-40", count: 320 },
  { range: "41-60", count: 480 },
  { range: "61-80", count: 390 },
  { range: "81-100", count: 152 },
];

// -----------------------------------------
// ANOMALY DETECTION DATA
// -----------------------------------------

export const anomalyKPIs = {
  detected: 12,
  critical: 3,
  medium: 5,
  low: 4,
};

export const anomalyScatterData = [
  { time: "02:00", volume: 150, spikeFactor: 1.5, keyword: "UPI Limits", severity: "Low" },
  { time: "05:30", volume: 420, spikeFactor: 4.8, keyword: "Hydrogen Fuel", severity: "Critical" },
  { time: "08:15", volume: 220, spikeFactor: 2.1, keyword: "SpaceTech", severity: "Medium" },
  { time: "10:30", volume: 380, spikeFactor: 3.2, keyword: "AI Agents", severity: "Critical" },
  { time: "12:00", volume: 180, spikeFactor: 1.8, keyword: "Smart City", severity: "Low" },
  { time: "14:45", volume: 290, spikeFactor: 2.9, keyword: "UPI Global Expansion", severity: "Medium" },
  { time: "16:20", volume: 190, spikeFactor: 1.7, keyword: "Quantum Labs", severity: "Low" },
  { time: "18:00", volume: 450, spikeFactor: 5.2, keyword: "Defence Exports", severity: "Critical" },
  { time: "20:30", volume: 310, spikeFactor: 2.6, keyword: "Electric Vehicles (EV)", severity: "Medium" },
  { time: "22:15", volume: 280, spikeFactor: 2.3, keyword: "Green Tech", severity: "Medium" },
];

export const anomalyHeatmapData = [
  { day: "Mon", Twitter: 2, News: 1, Reddit: 4, Google: 1 },
  { day: "Tue", Twitter: 5, News: 3, Reddit: 1, Google: 2 },
  { day: "Wed", Twitter: 1, News: 4, Reddit: 2, Google: 0 },
  { day: "Thu", Twitter: 4, News: 2, Reddit: 3, Google: 1 },
  { day: "Fri", Twitter: 3, News: 5, Reddit: 5, Google: 3 },
  { day: "Sat", Twitter: 1, News: 0, Reddit: 2, Google: 1 },
  { day: "Sun", Twitter: 2, News: 1, Reddit: 1, Google: 2 },
];

export const anomalyTableData: AnomalyItem[] = [
  {
    id: "ANM-001",
    topic: "Green Hydrogen Fuel Cell",
    severity: "Critical",
    reason: "Mention frequency spiked by 34.1% in news channels within 3 hours.",
    time: "Today, 05:30 AM",
    volume: 4200,
    spikeFactor: 4.8,
    source: "News/Media",
  },
  {
    id: "ANM-002",
    topic: "AI Agents Open-Source Release",
    severity: "Critical",
    reason: "Reddit post viral load threshold exceeded with 300% mention spike.",
    time: "Today, 10:30 AM",
    volume: 8500,
    spikeFactor: 3.2,
    source: "Reddit",
  },
  {
    id: "ANM-003",
    topic: "Defence Cyber Security Exports",
    severity: "Critical",
    reason: "Sudden Twitter volume surge (5.2x baseline) regarding border defense IT contracts.",
    time: "Today, 06:00 PM",
    volume: 5100,
    spikeFactor: 5.2,
    source: "Twitter/X",
  },
  {
    id: "ANM-004",
    topic: "SpaceTech Launch Funding",
    severity: "Medium",
    reason: "Volume deviation above 2.5 standard deviations in specialized startup forums.",
    time: "Today, 08:15 AM",
    volume: 2400,
    spikeFactor: 2.1,
    source: "Google Trends",
  },
  {
    id: "ANM-005",
    topic: "UPI Global Singapore/UAE link",
    severity: "Medium",
    reason: "Sentiment polarity changed from 0.1 to 0.85 in banking forums.",
    time: "Today, 02:45 PM",
    volume: 3800,
    spikeFactor: 2.9,
    source: "Reddit",
  },
];

// -----------------------------------------
// MODEL EVALUATION DATA
// -----------------------------------------

export const modelKPIs = {
  accuracy: "94.2%",
  precision: "92.5%",
  recall: "91.8%",
  f1: "92.1%",
  mae: "3.4",
  rmse: "4.8",
};

export const modelComparisonData: ModelMetricItem[] = [
  { version: "v2.4 (Current)", accuracy: 94.2, precision: 92.5, recall: 91.8, f1: 92.1 },
  { version: "v2.3", accuracy: 91.8, precision: 89.6, recall: 89.2, f1: 89.4 },
  { version: "v2.2", accuracy: 88.5, precision: 87.2, recall: 86.5, f1: 86.8 },
  { version: "v2.0 (Baseline)", accuracy: 82.0, precision: 79.5, recall: 80.2, f1: 79.8 },
];

export const rocCurveData: ROCPoint[] = [
  { fpr: 0, tpr: 0 },
  { fpr: 0.02, tpr: 0.25 },
  { fpr: 0.05, tpr: 0.55 },
  { fpr: 0.1, tpr: 0.80 },
  { fpr: 0.15, tpr: 0.88 },
  { fpr: 0.25, tpr: 0.93 },
  { fpr: 0.4, tpr: 0.96 },
  { fpr: 0.6, tpr: 0.98 },
  { fpr: 0.8, tpr: 0.99 },
  { fpr: 1.0, tpr: 1.0 },
];

export const confusionMatrixData: ConfusionMatrixCell[] = [
  { actual: "Positive", predicted: "Positive", value: 242 },
  { actual: "Positive", predicted: "Neutral", value: 12 },
  { actual: "Positive", predicted: "Negative", value: 6 },
  { actual: "Neutral", predicted: "Positive", value: 15 },
  { actual: "Neutral", predicted: "Neutral", value: 198 },
  { actual: "Neutral", predicted: "Negative", value: 11 },
  { actual: "Negative", predicted: "Positive", value: 5 },
  { actual: "Negative", predicted: "Neutral", value: 9 },
  { actual: "Negative", predicted: "Negative", value: 156 },
];

export const modelMetricTrends = [
  { epoch: 10, Accuracy: 78.5, Loss: 0.48 },
  { epoch: 20, Accuracy: 82.1, Loss: 0.38 },
  { epoch: 30, Accuracy: 85.9, Loss: 0.29 },
  { epoch: 40, Accuracy: 89.2, Loss: 0.22 },
  { epoch: 50, Accuracy: 91.5, Loss: 0.18 },
  { epoch: 60, Accuracy: 92.8, Loss: 0.15 },
  { epoch: 70, Accuracy: 93.6, Loss: 0.12 },
  { epoch: 80, Accuracy: 94.2, Loss: 0.10 },
];
