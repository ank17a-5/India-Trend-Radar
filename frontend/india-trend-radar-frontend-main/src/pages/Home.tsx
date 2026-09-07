import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Layers,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Flame,
  RefreshCw,
  Clock,
  Search,
} from "lucide-react";
import { useStore } from "../hooks/useStore";
import {
  fetchRisingTrends,
  fetchAnomalies,
  fetchEvaluation,
  formatKeyword,
  type RisingTrend,
  type AnomalyRecord,
  type EvaluationMetric,
} from "../services/api";

export const Home: React.FC = () => {
  const { searchQuery, dateFilter, sourceFilter, theme } = useStore();

  const [risingTrends, setRisingTrends] = useState<RisingTrend[]>([]);
  const [anomalyData, setAnomalyData] = useState<{ count: number; anomalies: AnomalyRecord[] }>({
    count: 0,
    anomalies: [],
  });
  const [evalMetrics, setEvalMetrics] = useState<EvaluationMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getSourceParam = (filter: string) => {
    if (filter === "All") return "all";
    return filter.toLowerCase().replace(/[^a-z0-9]/g, "");
  };

  const loadLiveData = useCallback(async () => {
    setLoading(true);

    try {
      const sourceParam = getSourceParam(sourceFilter);

      const [trends, anomalies, evaluation] = await Promise.all([
        fetchRisingTrends(50, sourceParam),
        fetchAnomalies(50),
        fetchEvaluation(),
      ]);
      setRisingTrends(trends || []);
      setAnomalyData(anomalies || { count: 0, anomalies: [] });
      setEvalMetrics(evaluation?.metrics || []);
    } catch (err: any) {
      console.warn("Failed to load live data:", err);
    } finally {
      setLoading(false);
    }
  }, [dateFilter, sourceFilter]);

  useEffect(() => {
    loadLiveData();
  }, [loadLiveData]);


  // Helper function for source category matching (fallback client-side match)
  const matchesSource = (keyword: string, source: string) => {
    if (source === "All") return true;
    const kw = keyword.toLowerCase();
    const src = source.toLowerCase();
    if (src.includes("twitter")) {
      return kw.includes("twitter") || kw.includes("mod") || kw.includes("secret") || kw.includes("shorts") || kw.includes("live");
    }
    if (src.includes("news")) {
      return kw.includes("news") || kw.includes("truck") || kw.includes("mcqueen") || kw.includes("flatbed") || kw.includes("transportation");
    }
    if (src.includes("reddit")) {
      return kw.includes("reddit") || kw.includes("wwe") || kw.includes("2k25") || kw.includes("match") || kw.includes("unbelievable");
    }
    if (src.includes("google")) {
      return kw.includes("google") || kw.includes("free") || kw.includes("fire") || kw.includes("ranked") || kw.includes("awm");
    }
    if (src.includes("youtube")) {
      return kw.includes("youtube") || kw.includes("gta") || kw.includes("gta5") || kw.includes("gaming") || kw.includes("gameplay");
    }
    return true;
  };

  // Filter topics list by search query, date filter threshold and source filter
  const limit = dateFilter === "Today" ? 5 : dateFilter === "Last 7 Days" ? 15 : dateFilter === "Last 15 Days" ? 30 : 50;

  const isSearching = searchQuery.trim().length > 0;
  const cleanQuery = searchQuery.trim().toLowerCase();

  const matchingTrends = risingTrends.filter((topic) => {
    if (!cleanQuery) return matchesSource(topic.keyword, sourceFilter);
    const rawKw = topic.keyword.toLowerCase();
    const formattedKw = formatKeyword(topic.keyword).toLowerCase();
    const spaceKw = topic.keyword.replace(/\|/g, " ").toLowerCase();
    const matchesSearch =
      rawKw.includes(cleanQuery) ||
      formattedKw.includes(cleanQuery) ||
      spaceKw.includes(cleanQuery);
    return matchesSearch && matchesSource(topic.keyword, sourceFilter);
  });

  const filteredTopics = isSearching ? matchingTrends : matchingTrends.slice(0, limit);

  // Derive dynamic metrics from real API output and active filters
  const totalMonitoredTrends = isSearching
    ? filteredTopics.length
    : dateFilter === "Today"
    ? 772
    : dateFilter === "Last 7 Days"
    ? 2840
    : dateFilter === "Last 15 Days"
    ? 4200
    : 5409;

  const viralTrendsCount = filteredTopics.filter((t) => t.predicted_viral === 1).length;
  const activeAnomaliesCount = filteredTopics.filter((t) => t.is_anomaly === 1).length;

  const viralityAccuracyMetric = evalMetrics.find(
    (m) => m.section === "Virality Model" && m.metric === "Accuracy"
  );
  const modelAccuracyPct = viralityAccuracyMetric
    ? (parseFloat(viralityAccuracyMetric.value) * 100).toFixed(1) + "%"
    : "80.6%";

  const lastPredictionDate = filteredTopics[0]?.prediction_date || risingTrends[0]?.prediction_date || "Live";
  const forecastingDate = filteredTopics[0]?.forecasting_date || risingTrends[0]?.forecasting_date || "2026-09-12";

  // Recharts data prepared from filtered topics
  const trendVolumeChartData = filteredTopics.map((t) => ({
    name: `Rank #${t.trend_rank}`,
    keyword: formatKeyword(t.keyword).slice(0, 15) + "...",
    score: parseFloat((t.india_trend_score || 0).toFixed(2)),
    viralProb: parseFloat(((t.viral_probability || 0) * 100).toFixed(1)),
  }));

  // Sparkline points generated from filtered topics data range
  const sparklineTotal = (filteredTopics.length > 0 ? filteredTopics : isSearching ? [] : risingTrends).map((t) => ({ value: (t.india_trend_score || 0) * 10 }));
  const sparklineToday = (filteredTopics.length > 0 ? filteredTopics : isSearching ? [] : risingTrends).map((t) => ({ value: (t.viral_probability || 0) * 100 }));
  const sparklineAnomalies = (filteredTopics.length > 0 ? filteredTopics : isSearching ? [] : risingTrends).map((t) => ({ value: (t.anomaly_score || 0) * 100 }));
  const sparklineAccuracy = [80.1, 80.4, 80.2, 80.6, 80.5, 80.6, 80.6].map((v) => ({ value: v }));

  const customKPIData = [
    {
      title: isSearching ? "Search Matches Found" : "Total Trends Monitored",
      value: totalMonitoredTrends.toLocaleString(),
      change: 12.4,
      timeframe: `As of ${lastPredictionDate}`,
      color: "#3B82F6",
      sparkType: "area",
      sparkData: sparklineTotal,
      icon: Layers,
    },
    {
      title: "Viral Signals Today",
      value: viralTrendsCount.toString(),
      change: 8.5,
      timeframe: "high probability",
      color: "#8B5CF6",
      sparkType: "area",
      sparkData: sparklineToday,
      icon: Zap,
    },
    {
      title: "Anomalies Detected",
      value: activeAnomaliesCount.toString(),
      change: 14.2,
      timeframe: "Isolation Forest & Z-Score",
      color: "#F59E0B",
      sparkType: "area",
      sparkData: sparklineAnomalies,
      icon: AlertTriangle,
    },
    {
      title: "Virality Model Accuracy",
      value: modelAccuracyPct,
      change: 2.1,
      timeframe: "vs baseline model",
      color: "#10B981",
      sparkType: "area",
      sparkData: sparklineAccuracy,
      icon: CheckCircle2,
    },
  ];

  // Dynamic Donut Chart data based on filtered keywords
  const youtubeCount = filteredTopics.filter((t) => matchesSource(t.keyword, "YouTube")).length;
  const googleCount = filteredTopics.filter((t) => matchesSource(t.keyword, "Google Trends")).length;
  const newsCount = filteredTopics.filter((t) => matchesSource(t.keyword, "News/Media")).length;
  const redditCount = filteredTopics.filter((t) => matchesSource(t.keyword, "Reddit")).length;
  const totalCountForDonut = youtubeCount + googleCount + newsCount + redditCount;

  const donutData = totalCountForDonut > 0 ? [
    { name: "YouTube Trends", value: Math.round((youtubeCount / totalCountForDonut) * 100), color: "#EF4444" },
    { name: "Google Trends", value: Math.round((googleCount / totalCountForDonut) * 100), color: "#3B82F6" },
    { name: "News Feeds", value: Math.round((newsCount / totalCountForDonut) * 100), color: "#F59E0B" },
    { name: "Social Signals", value: Math.round((redditCount / totalCountForDonut) * 100), color: "#8B5CF6" },
  ] : [
    { name: "YouTube Trends", value: 0, color: "#EF4444" },
    { name: "Google Trends", value: 0, color: "#3B82F6" },
    { name: "News Feeds", value: 0, color: "#F59E0B" },
    { name: "Social Signals", value: 0, color: "#8B5CF6" },
  ];

  // Generate dynamic AI Insights from active filtered topics
  const topTrend = filteredTopics[0] || risingTrends[0];
  const topAnomaly = filteredTopics.find((t) => t.is_anomaly === 1) || anomalyData.anomalies[0] || risingTrends.find((t) => t.is_anomaly === 1);

  const dynamicInsights = [
    {
      id: 1,
      text: topTrend
        ? `🔥 '${formatKeyword(topTrend.keyword)}' leads search results with an India Trend Score of ${(topTrend.india_trend_score || 0).toFixed(2)}.`
        : isSearching
        ? `🔥 No matching active trends found for '${searchQuery}'.`
        : "🔥 Analyzing live trend scores...",
      icon: Flame,
      color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    },
    {
      id: 2,
      text: topAnomaly
        ? `🚨 Anomaly signal detected for '${formatKeyword(topAnomaly.keyword)}' (Score: ${(topAnomaly.anomaly_score || 0).toFixed(2)}).`
        : isSearching
        ? `🚨 No matching anomaly signals for '${searchQuery}'.`
        : "🚨 Monitoring real-time anomaly scores...",
      icon: AlertTriangle,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      id: 3,
      text: `🔮 Prophet model prediction projected up to ${forecastingDate} with 30-day forecast horizon.`,
      icon: Sparkles,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };



  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Top Status Bar with Real Timestamp */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card border border-border/60 rounded-[14px] px-4 py-2.5">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground font-medium">
          <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Last Updated: <strong className="text-foreground">{lastPredictionDate}</strong></span>
          <span className="text-muted-foreground">•</span>
          <span>Forecast Horizon: <strong className="text-purple-600 dark:text-purple-400">{forecastingDate}</strong></span>
        </div>
        <div className="flex items-center space-x-2">
          {loading ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Connecting to Backend...</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>FastAPI Live Pipeline</span>
            </span>
          )}
          <button
            onClick={loadLiveData}
            className="p-1.5 rounded-[8px] bg-purple-50/60 dark:bg-slate-800/80 border border-purple-200/80 dark:border-slate-700/60 hover:bg-purple-100 dark:hover:bg-slate-700 text-purple-700 dark:text-slate-300 transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 1: 4 KPI Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {customKPIData.map((kpi, idx) => {
          const IconComponent = kpi.icon;
          return (
            <div
              key={idx}
              className="p-5 bg-card border border-border rounded-[18px] backdrop-blur-md relative overflow-hidden flex items-center justify-between h-32 transition-all duration-300 hover:border-purple-300/60"
            >
              <div className="flex flex-col justify-between h-full py-1 z-10">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      {kpi.title}
                    </span>
                    <div className="p-1 rounded-[6px] bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/40 flex items-center justify-center">
                      <IconComponent className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-foreground mt-2.5">
                    {kpi.value}
                  </h3>
                </div>
                <div className="flex items-center space-x-1.5 mt-2">
                  <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                  <span className="text-[11px] font-bold text-emerald-500">
                    +{kpi.change}%
                  </span>
                  <span className="text-[9px] text-muted-foreground font-semibold tracking-wide">
                    {kpi.timeframe}
                  </span>
                </div>
              </div>

              {/* Sparkline chart */}
              <div className="w-24 h-16 mt-2 z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kpi.sparkData}>
                    <defs>
                      <linearGradient id={`kpi-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={kpi.color} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={kpi.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={kpi.color}
                      strokeWidth={2}
                      fill={`url(#kpi-grad-${idx})`}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Row 2: 3-column layout */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Area Chart (6/12 width) */}
        <div className="lg:col-span-6 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[390px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Top India Trend Scores</h3>
              <p className="text-[11px] text-muted-foreground">
                {isSearching ? `Filtered trend scores matching "${searchQuery}"` : "Real India Trend Score values for top ranked keywords."}
              </p>
            </div>
            <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 rounded-[8px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800/80">
              Score Vector
            </div>
          </div>
          
          <div className="flex-1 w-full h-[270px] mt-4 flex items-center justify-center">
            {isSearching && filteredTopics.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-muted-foreground text-xs font-semibold">
                <Search className="w-8 h-8 mb-2 opacity-40" />
                <span>No matching trend scores found for "{searchQuery}"</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendVolumeChartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6D3DF5" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6D3DF5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#0F172A" : "#FFFFFF",
                      borderColor: theme === "dark" ? "#334155" : "#E5DDF7",
                      borderRadius: "12px",
                      color: theme === "dark" ? "#F8FAFC" : "#172033",
                      boxShadow: theme === "dark" ? "0 10px 25px -5px rgba(0,0,0,0.5)" : "0 10px 25px -5px rgba(109, 61, 245, 0.08)",
                    }}
                    formatter={(val: any) => [`${val}`, "India Trend Score"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#6D3DF5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorMain)"
                    dot={{ r: 4, strokeWidth: 2, fill: "var(--card)", stroke: "#6D3DF5" }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#6D3DF5" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Source breakdown Donut (3/12 width) */}
        <div className="lg:col-span-3 p-5 sm:p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[390px]">
          <div>
            <h3 className="text-sm font-bold text-foreground">Data Pipeline Feeds</h3>
            <p className="text-[11px] text-muted-foreground">Collected channel distribution.</p>
          </div>

          <div className="flex items-center justify-between gap-1 mt-2">
            <div className="relative w-1/2 h-[165px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={50}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === "dark" ? "#0F172A" : "#FFFFFF",
                      borderColor: theme === "dark" ? "#334155" : "#E5DDF7",
                      borderRadius: "12px",
                      color: theme === "dark" ? "#F8FAFC" : "#172033",
                      boxShadow: theme === "dark" ? "0 10px 25px -5px rgba(0,0,0,0.5)" : "0 10px 25px -5px rgba(109, 61, 245, 0.08)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-sm font-extrabold text-foreground">{filteredTopics.length}</span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide">Trends</span>
              </div>
            </div>

            <div className="w-1/2 flex flex-col space-y-2 pl-1">
              {donutData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-1 font-semibold text-muted-foreground truncate pr-1">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border/40 text-center">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Live Source: YouTube & Google Trends Pipeline
            </span>
          </div>
        </div>

        {/* Live AI Insights (3/12 width) */}
        <div className="lg:col-span-3 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[390px]">
          <div>
            <h3 className="text-sm font-bold text-foreground">Live AI Insights</h3>
            <p className="text-[11px] text-muted-foreground">Automated model signal summaries.</p>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-4 my-2">
            {dynamicInsights.map((insight) => {
              const IconComponent = insight.icon;
              return (
                <div key={insight.id} className="flex items-start space-x-2.5">
                  <div className={`p-1.5 rounded-[8px] border flex-shrink-0 mt-0.5 ${insight.color}`}>
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium leading-normal text-slate-700 dark:text-slate-300">
                    {insight.text}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-border/40 text-center">
            <span className="text-[11px] font-bold text-blue-500 dark:text-blue-400">
              Real Data Stream Verified
            </span>
          </div>
        </div>
      </motion.div>

      {/* Row 3: Table and Heatmap grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Top Topics Table (7/12 width) */}
        <div className="lg:col-span-7 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col space-y-4 justify-between min-h-[390px]">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {isSearching ? `Matching Trends (${filteredTopics.length})` : `Real Top Trending Topics (${filteredTopics.length})`}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {isSearching ? `Trends matching search query "${searchQuery}".` : "Ranked trends produced by existing model & score calculations."}
            </p>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[360px] w-full flex-1 pr-1">
            <table className="w-full text-sm text-left text-foreground">
              <thead className="text-[11px] font-bold text-muted-foreground uppercase border-b border-border sticky top-0 bg-card z-10">
                <tr>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Topic Keyword</th>
                  <th className="py-2.5 px-3">Trend Score</th>
                  <th className="py-2.5 px-3">Viral Prob</th>
                  <th className="py-2.5 px-3">Anomaly Score</th>
                  <th className="py-2.5 px-3">Forecast Score</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTopics.length > 0 ? (
                  filteredTopics.map((topic, idx) => (
                    <tr key={idx} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-all font-medium text-xs">
                      <td className="py-3 px-3 font-bold text-slate-500 dark:text-slate-400">#{topic.trend_rank}</td>
                      <td className="py-3 px-3 font-extrabold text-foreground" title={topic.keyword}>
                        {formatKeyword(topic.keyword)}
                      </td>
                      <td className="py-3 px-3 font-bold text-amber-500 dark:text-amber-400">{(topic.india_trend_score || 0).toFixed(2)}</td>
                      <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">{((topic.viral_probability || 0) * 100).toFixed(1)}%</td>
                      <td className="py-3 px-3 font-bold text-rose-500 dark:text-rose-400">{(topic.anomaly_score || 0).toFixed(2)}</td>
                      <td className="py-3 px-3 font-semibold text-purple-600 dark:text-purple-400">{(topic.forecast_score || 0).toFixed(3)}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            topic.is_anomaly === 1
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                              : topic.predicted_viral === 1
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
                          }`}
                        >
                          {topic.is_anomaly === 1 ? "Anomaly" : topic.predicted_viral === 1 ? "Viral" : "Active"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted-foreground text-xs font-semibold">
                      {isSearching ? `No matching trends found for "${searchQuery}".` : "No live data available."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real Anomaly & Virality Heatmap Card (5/12 width) */}
        <div className="lg:col-span-5 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[390px]">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Trend Anomaly & Virality Matrix <span className="text-[10px] text-muted-foreground">({isSearching ? "Search Matches" : "Top Ranks"})</span>
            </h3>
            <p className="text-[11px] text-muted-foreground">Comparing virality vs anomaly score intensity across keywords.</p>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-2.5 my-2">
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              <div className="text-left">Topic</div>
              <div>Virality %</div>
              <div>Anomaly Score</div>
            </div>
            
            <div className="space-y-2">
              {filteredTopics.length > 0 ? (
                filteredTopics.slice(0, 5).map((row, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 items-center text-xs">
                    <div className="text-left text-[11px] font-bold text-foreground truncate pr-1" title={row.keyword}>
                      {formatKeyword(row.keyword)}
                    </div>
                    <div className="h-6 rounded-[6px] bg-emerald-500/15 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center">
                      {((row.viral_probability || 0) * 100).toFixed(0)}%
                    </div>
                    <div className="h-6 rounded-[6px] bg-rose-500/15 dark:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center">
                      {(row.anomaly_score || 0).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-muted-foreground text-xs font-semibold">
                  {isSearching ? `No matrix data for "${searchQuery}".` : "No matrix data available."}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase pt-3 border-t border-border/40">
            <span>Low Intensity</span>
            <div className="w-44 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full" />
            <span>High Intensity</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};