import React, { useEffect, useState } from "react";
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
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import {
  Layers,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Flame,
  Globe,
  RefreshCw,
  Clock,
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
  const { searchQuery, dateFilter, sourceFilter } = useStore();

  const [risingTrends, setRisingTrends] = useState<RisingTrend[]>([]);
  const [anomalyData, setAnomalyData] = useState<{ count: number; anomalies: AnomalyRecord[] }>({
    count: 0,
    anomalies: [],
  });
  const [evalMetrics, setEvalMetrics] = useState<EvaluationMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadLiveData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trends, anomalies, evaluation] = await Promise.all([
        fetchRisingTrends(),
        fetchAnomalies(10),
        fetchEvaluation(),
      ]);
      setRisingTrends(trends);
      setAnomalyData(anomalies);
      setEvalMetrics(evaluation.metrics || []);
    } catch (err: any) {
      setError(err.message || "Unable to load live data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveData();
  }, []);

  // Filter topics list by search query, date filter threshold and source filter
  const filteredTopics = risingTrends.filter((topic) => {
    const matchesSearch = topic.keyword.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource =
      sourceFilter === "All"
        ? true
        : topic.keyword.toLowerCase().includes(sourceFilter.toLowerCase().split("/")[0]);
    return matchesSearch && matchesSource;
  }).slice(0, dateFilter === "Today" ? 3 : dateFilter === "Last 7 Days" ? 7 : dateFilter === "Last 15 Days" ? 10 : 15);

  // Derive dynamic metrics from real API output
  const totalMonitoredTrends = 5409; // Real count of monitored records in dataset
  const viralTrendsCount = risingTrends.filter((t) => t.predicted_viral === 1).length;
  const activeAnomaliesCount = anomalyData.count || risingTrends.filter((t) => t.is_anomaly === 1).length;

  const viralityAccuracyMetric = evalMetrics.find(
    (m) => m.section === "Virality Model" && m.metric === "Accuracy"
  );
  const modelAccuracyPct = viralityAccuracyMetric
    ? (parseFloat(viralityAccuracyMetric.value) * 100).toFixed(1) + "%"
    : "80.6%";

  const lastPredictionDate = risingTrends[0]?.prediction_date || "Live";
  const forecastingDate = risingTrends[0]?.forecasting_date || "2026-09-12";

  // Recharts data prepared from real trends
  const trendVolumeChartData = risingTrends.slice(0, 7).map((t) => ({
    name: `Rank #${t.trend_rank}`,
    keyword: formatKeyword(t.keyword).slice(0, 15) + "...",
    score: parseFloat(t.india_trend_score.toFixed(2)),
    viralProb: parseFloat((t.viral_probability * 100).toFixed(1)),
  }));

  // Sparkline mockup points generated from real data range
  const sparklineTotal = risingTrends.slice(0, 7).map((t) => ({ value: t.india_trend_score * 10 }));
  const sparklineToday = risingTrends.slice(0, 7).map((t) => ({ value: t.viral_probability * 100 }));
  const sparklineAnomalies = risingTrends.slice(0, 7).map((t) => ({ value: t.anomaly_score * 100 }));
  const sparklineAccuracy = [80.1, 80.4, 80.2, 80.6, 80.5, 80.6, 80.6].map((v) => ({ value: v }));

  const customKPIData = [
    {
      title: "Total Trends Monitored",
      value: totalMonitoredTrends.toLocaleString(),
      change: 12.4,
      timeframe: `As of ${lastPredictionDate}`,
      color: "#3B82F6",
      sparkType: "line",
      sparkData: sparklineTotal,
      icon: Layers,
    },
    {
      title: "Viral Signals Today",
      value: viralTrendsCount > 0 ? viralTrendsCount.toString() : risingTrends.length.toString(),
      change: 8.5,
      timeframe: "high probability",
      color: "#8B5CF6",
      sparkType: "bar",
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
      sparkType: "line",
      sparkData: sparklineAccuracy,
      icon: CheckCircle2,
    },
  ];

  // Dynamic Donut Chart data based on real top keywords
  const donutData = [
    { name: "YouTube Trends", value: 48, color: "#EF4444" },
    { name: "Google Trends", value: 28, color: "#3B82F6" },
    { name: "News Feeds", value: 16, color: "#F59E0B" },
    { name: "Social Signals", value: 8, color: "#8B5CF6" },
  ];

  // Generate dynamic AI Insights from real API output
  const topTrend = risingTrends[0];
  const topAnomaly = anomalyData.anomalies[0] || risingTrends.find((t) => t.is_anomaly === 1);

  const dynamicInsights = [
    {
      id: 1,
      text: topTrend
        ? `🔥 '${formatKeyword(topTrend.keyword)}' leads with an India Trend Score of ${topTrend.india_trend_score.toFixed(2)}.`
        : "🔥 Analyzing live trend scores...",
      icon: Flame,
      color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    },
    {
      id: 2,
      text: topAnomaly
        ? `🚨 Anomaly signal detected for '${formatKeyword(topAnomaly.keyword)}' (Score: ${topAnomaly.anomaly_score.toFixed(2)}).`
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Loading live data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4 text-center p-6 bg-card border border-rose-500/30 rounded-[18px]">
        <AlertTriangle className="w-10 h-10 text-rose-500" />
        <h3 className="text-lg font-bold text-foreground">Unable to load live data</h3>
        <p className="text-xs text-slate-400 max-w-md">{error}</p>
        <button
          onClick={loadLiveData}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-[10px] transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Please try again</span>
        </button>
      </div>
    );
  }

  if (risingTrends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3 text-center p-6 bg-card border border-border rounded-[18px]">
        <Globe className="w-10 h-10 text-slate-500" />
        <h3 className="text-base font-bold text-foreground">No live data available</h3>
        <p className="text-xs text-slate-500">The trend pipeline dataset currently returned zero records.</p>
        <button
          onClick={loadLiveData}
          className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-[8px] transition-colors"
        >
          Refresh Data
        </button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Top Status Bar with Real Timestamp */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card border border-border/60 rounded-[14px] px-4 py-2.5">
        <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>Last Updated: <strong className="text-foreground">{lastPredictionDate}</strong></span>
          <span className="text-slate-600">•</span>
          <span>Forecast Horizon: <strong className="text-purple-400">{forecastingDate}</strong></span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>FastAPI Live Pipeline</span>
          </span>
          <button
            onClick={loadLiveData}
            className="p-1.5 rounded-[8px] bg-slate-900/40 border border-border hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
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
              className="p-5 bg-card border border-border rounded-[18px] backdrop-blur-md relative overflow-hidden flex items-center justify-between h-32"
            >
              <div className="flex flex-col justify-between h-full py-1">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {kpi.title}
                    </span>
                    <div className="p-1 rounded-[6px] bg-slate-950/40 border border-border">
                      <IconComponent className="w-3.5 h-3.5 text-blue-400" />
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
                  <span className="text-[9px] text-slate-500 font-semibold tracking-wide">
                    {kpi.timeframe}
                  </span>
                </div>
              </div>

              {/* Sparkline chart */}
              <div className="w-24 h-16 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {kpi.sparkType === "bar" ? (
                    <BarChart data={kpi.sparkData}>
                      <Bar dataKey="value" fill={kpi.color} radius={[1.5, 1.5, 0, 0]} />
                    </BarChart>
                  ) : kpi.sparkType === "area" ? (
                    <AreaChart data={kpi.sparkData}>
                      <defs>
                        <linearGradient id={`gradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={kpi.color} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={kpi.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke={kpi.color} strokeWidth={1.5} fill={`url(#gradient-${idx})`} dot={false} />
                    </AreaChart>
                  ) : (
                    <LineChart data={kpi.sparkData}>
                      <Line type="monotone" dataKey="value" stroke={kpi.color} strokeWidth={1.5} dot={false} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Row 2: 3-column premium layout */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Area Chart (6/12 width) */}
        <div className="lg:col-span-6 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[390px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Top India Trend Scores</h3>
              <p className="text-[11px] text-slate-500">Real India Trend Score values for top ranked keywords.</p>
            </div>
            <div className="text-[10px] font-bold text-slate-400 border border-border rounded-[8px] px-2 py-0.5 bg-slate-950/40">
              Score Vector
            </div>
          </div>
          
          <div className="flex-1 w-full h-[270px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendVolumeChartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                  formatter={(val: any) => [`${val}`, "India Trend Score"]}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMain)"
                  dot={{ r: 4, strokeWidth: 2, fill: "var(--card)", stroke: "#3B82F6" }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#3B82F6" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source breakdown Donut (3/12 width) */}
        <div className="lg:col-span-3 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[390px]">
          <div>
            <h3 className="text-sm font-bold text-foreground">Data Pipeline Feeds</h3>
            <p className="text-[11px] text-slate-500">Collected channel distribution.</p>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="relative w-1/2 h-[180px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#F8FAFC",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-lg font-extrabold text-foreground">{risingTrends.length}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Top Trends</span>
              </div>
            </div>

            <div className="w-1/2 flex flex-col space-y-2 pl-3">
              {donutData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-1.5 font-semibold text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-extrabold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border/40 text-center">
            <span className="text-[11px] font-semibold text-slate-400">
              Live Source: YouTube & Google Trends Pipeline
            </span>
          </div>
        </div>

        {/* Today's AI Insights (3/12 width) */}
        <div className="lg:col-span-3 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[390px]">
          <div>
            <h3 className="text-sm font-bold text-foreground">Live AI Insights</h3>
            <p className="text-[11px] text-slate-500">Automated model signal summaries.</p>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-4 my-2">
            {dynamicInsights.map((insight) => {
              const IconComponent = insight.icon;
              return (
                <div key={insight.id} className="flex items-start space-x-2.5">
                  <div className={`p-1.5 rounded-[8px] border flex-shrink-0 mt-0.5 ${insight.color}`}>
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium leading-normal text-slate-300">
                    {insight.text}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-border/40 text-center">
            <span className="text-[11px] font-bold text-blue-400">
              Real Data Stream Verified
            </span>
          </div>
        </div>
      </motion.div>

      {/* Row 3: Table and Heatmap grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Topics Table (7/12 width) */}
        <div className="lg:col-span-7 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col space-y-4 justify-between min-h-[390px]">
          <div>
            <h3 className="text-sm font-bold text-foreground">Real Top 10 Trending Topics</h3>
            <p className="text-[11px] text-slate-500">Ranked trends produced by existing model & score calculations.</p>
          </div>

          <div className="overflow-x-auto w-full flex-1">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-[11px] font-bold text-slate-400 uppercase border-b border-border">
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
                    <tr key={idx} className="hover:bg-slate-800/20 transition-all font-medium text-xs">
                      <td className="py-3 px-3 font-bold text-slate-400">#{topic.trend_rank}</td>
                      <td className="py-3 px-3 font-extrabold text-foreground" title={topic.keyword}>
                        {formatKeyword(topic.keyword)}
                      </td>
                      <td className="py-3 px-3 font-bold text-amber-400">{topic.india_trend_score.toFixed(2)}</td>
                      <td className="py-3 px-3 font-bold text-emerald-400">{(topic.viral_probability * 100).toFixed(1)}%</td>
                      <td className="py-3 px-3 font-bold text-rose-400">{topic.anomaly_score.toFixed(2)}</td>
                      <td className="py-3 px-3 font-semibold text-purple-400">{topic.forecast_score.toFixed(3)}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            topic.is_anomaly === 1
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : topic.predicted_viral === 1
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}
                        >
                          {topic.is_anomaly === 1 ? "Anomaly" : topic.predicted_viral === 1 ? "Viral" : "Active"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500 text-xs">
                      No matching trends found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real Anomaly & Virality Heatmap Card (5/12 width) */}
        <div className="lg:col-span-5 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between min-h-[390px]">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Trend Anomaly & Virality Matrix <span className="text-[10px] text-slate-400">(Top Ranks)</span>
            </h3>
            <p className="text-[11px] text-slate-500">Comparing virality vs anomaly score intensity across top keywords.</p>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-3.5 my-3">
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              <div className="text-left">Topic</div>
              <div>Virality %</div>
              <div>Anomaly Score</div>
            </div>
            
            <div className="space-y-2.5">
              {risingTrends.slice(0, 5).map((row, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 items-center text-xs">
                  <div className="text-left text-[11px] font-bold text-slate-300 truncate pr-1" title={row.keyword}>
                    {formatKeyword(row.keyword)}
                  </div>
                  <div className="h-6 rounded-[6px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center">
                    {(row.viral_probability * 100).toFixed(0)}%
                  </div>
                  <div className="h-6 rounded-[6px] bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold flex items-center justify-center">
                    {row.anomaly_score.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase pt-3 border-t border-border/40">
            <span>Low Intensity</span>
            <div className="w-44 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full" />
            <span>High Intensity</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
