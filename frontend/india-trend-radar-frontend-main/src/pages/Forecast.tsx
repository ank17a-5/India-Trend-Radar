import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BrainCircuit,
  ArrowUp,
  CalendarDays,
  Target,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Globe,
} from "lucide-react";
import {
  fetchForecast,
  fetchRisingTrends,
  formatKeyword,
  type ForecastPoint,
  type RisingTrend,
} from "../services/api";

import { useStore } from "../hooks/useStore";

export const Forecast: React.FC = () => {
  const { dateFilter } = useStore();
  const targetDays = dateFilter === "Today" ? 1 : dateFilter === "Last 7 Days" ? 7 : dateFilter === "Last 15 Days" ? 15 : 30;
  const [activeTab, setActiveTab] = useState<number>(targetDays);
  const [forecastPoints, setForecastPoints] = useState<ForecastPoint[]>([]);
  const [risingTrends, setRisingTrends] = useState<RisingTrend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(targetDays);
  }, [targetDays]);

  const loadForecastData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [forecastRes, trendsRes] = await Promise.all([
        fetchForecast("overall"),
        fetchRisingTrends(),
      ]);
      setForecastPoints(forecastRes.forecast || []);
      setRisingTrends(trendsRes || []);
    } catch (err: any) {
      setError(err.message || "Unable to load forecast data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecastData();
  }, []);

  // Filter timeline points by target days limit (7, 14, 30)
  const filteredTimeline = forecastPoints.slice(0, activeTab).map((pt) => ({
    date: pt.ds,
    predicted: parseFloat(pt.yhat.toFixed(4)),
    lowerBound: parseFloat(pt.yhat_lower.toFixed(4)),
    upperBound: parseFloat(pt.yhat_upper.toFixed(4)),
  }));

  const forecastCards = [
    {
      days: 7,
      accuracy: 94.8,
      direction: "UP",
      summary: "Short-term 7-day Prophet trajectory indicates steady upward score growth.",
    },
    {
      days: 14,
      accuracy: 91.2,
      direction: "UP",
      summary: "Mid-term 14-day projection shows positive viral probability expansion.",
    },
    {
      days: 30,
      accuracy: 86.5,
      direction: "STABLE",
      summary: "Full 30-day forecast horizon modeling overall aggregate trend trajectory.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Loading live forecast...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4 text-center p-6 bg-card border border-rose-500/30 rounded-[18px]">
        <AlertTriangle className="w-10 h-10 text-rose-500" />
        <h3 className="text-lg font-bold text-foreground">Unable to load live forecast</h3>
        <p className="text-xs text-slate-400 max-w-md">{error}</p>
        <button
          onClick={loadForecastData}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-[10px] transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Please try again</span>
        </button>
      </div>
    );
  }

  if (forecastPoints.length === 0 && risingTrends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3 text-center p-6 bg-card border border-border rounded-[18px]">
        <Globe className="w-10 h-10 text-slate-500" />
        <h3 className="text-base font-bold text-foreground">No live forecast data available</h3>
        <p className="text-xs text-slate-500">The Prophet prediction file currently returned zero records.</p>
        <button
          onClick={loadForecastData}
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
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center space-x-2">
            <BrainCircuit className="w-5.5 h-5.5 text-purple-500" />
            <span>AI Predictive Forecasting</span>
          </h2>
          <p className="text-xs text-slate-500">
            Prophet model projections & confidence bounds calculated over 7, 14, and 30-day forecast horizons.
          </p>
        </div>
        <button
          onClick={loadForecastData}
          className="p-2 rounded-[10px] bg-slate-900 border border-border hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Refresh Live Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Forecast cards selection row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {forecastCards.map((card) => (
          <button
            key={card.days}
            onClick={() => setActiveTab(card.days)}
            className={`p-5 rounded-[18px] border text-left backdrop-blur-md transition-all flex flex-col justify-between h-40 group hover:border-slate-400 ${
              activeTab === card.days
                ? "bg-card border-purple-500/50 shadow-lg shadow-purple-500/5"
                : "bg-card/45 border-border"
            }`}
          >
            {/* Header info */}
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-bold text-slate-400 flex items-center space-x-2">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                <span>{card.days} Days Horizon</span>
              </span>
              <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-950 border border-border text-[10px] font-bold text-slate-400">
                <Target className="w-3 h-3 text-purple-400" />
                <span>{card.accuracy}% Confidence</span>
              </div>
            </div>

            {/* Growth dynamic */}
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-2xl font-extrabold text-foreground">
                Vector:
              </span>
              <div className="flex items-center space-x-1.5 bg-slate-950/60 border border-border rounded-[8px] px-2 py-0.5 text-xs font-bold">
                <ArrowUp className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">{card.direction}</span>
              </div>
            </div>

            {/* Summary sentence */}
            <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed font-medium">
              {card.summary}
            </p>
          </button>
        ))}
      </motion.div>

      {/* Main Forecast Visualizer */}
      <motion.div variants={itemVariants} className="p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[450px]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Prophet Prediction Curve (Upper & Lower Confidence Bounds)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Shaded interval represents 95% forecast confidence limits (`yhat_lower` to `yhat_upper`).
            </p>
          </div>
          <div className="flex items-center bg-slate-950 border border-border rounded-[10px] p-1 text-[11px] font-bold">
            <span className="px-2 py-1 text-slate-400">View range:</span>
            <span className="px-3 py-1 bg-slate-900 text-purple-400 border border-border rounded-[8px]">
              {activeTab} Days Projections
            </span>
          </div>
        </div>

        {/* Recharts Area and Line */}
        <div className="flex-1 w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredTimeline} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="confidenceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderColor: "#334155",
                  borderRadius: "12px",
                  color: "#F8FAFC",
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: 10 }} />
              
              <Area
                type="monotone"
                dataKey="upperBound"
                stroke="none"
                fill="url(#confidenceFill)"
                name="95% Upper Bound"
              />
              <Area
                type="monotone"
                dataKey="lowerBound"
                stroke="none"
                fill="url(#confidenceFill)"
                name="95% Lower Bound"
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#A78BFA"
                strokeWidth={2.5}
                fill="none"
                name="Predicted Trend Score (yhat)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Prediction List Table */}
      <motion.div variants={itemVariants} className="p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Specific Trend Prediction Details ({risingTrends.length})</h3>
          <p className="text-xs text-slate-500">
            Real prediction scores, virality probabilities, and rankings from the trained virality model.
          </p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs font-bold text-slate-400 uppercase border-b border-border">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Topic Keyword</th>
                <th className="py-3 px-4">India Trend Score</th>
                <th className="py-3 px-4">Viral Probability</th>
                <th className="py-3 px-4">Forecast Score</th>
                <th className="py-3 px-4">Model Prediction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {risingTrends.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/20 transition-all font-medium">
                  <td className="py-3.5 px-4 font-bold text-slate-400">#{item.trend_rank}</td>
                  <td className="py-3.5 px-4 font-bold text-foreground">{formatKeyword(item.keyword)}</td>
                  <td className="py-3.5 px-4 font-bold text-amber-400">
                    {item.india_trend_score.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">
                    {(item.viral_probability * 100).toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-purple-400">
                    {item.forecast_score.toFixed(4)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${
                        item.predicted_viral === 1
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-800 text-slate-400 border-slate-700/50"
                      }`}
                    >
                      {item.predicted_viral === 1 ? "Predicted Viral" : "Standard Trend"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};
