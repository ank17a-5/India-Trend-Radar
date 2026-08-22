import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Star,
  Award,
  Compass,
  RefreshCw,
  AlertTriangle,
  Globe,
} from "lucide-react";
import {
  fetchRisingTrends,
  formatKeyword,
  type RisingTrend,
} from "../services/api";

import { useStore } from "../hooks/useStore";

export const IndiaTrendScore: React.FC = () => {
  const { dateFilter, sourceFilter, searchQuery } = useStore();
  const [trends, setTrends] = useState<RisingTrend[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const filteredTrends = useMemo(() => {
    const limit = dateFilter === "Today" ? 3 : dateFilter === "Last 7 Days" ? 7 : dateFilter === "Last 15 Days" ? 15 : 30;
    return trends
      .filter((topic) => {
        const matchesSearch = topic.keyword.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSource =
          sourceFilter === "All"
            ? true
            : topic.keyword.toLowerCase().includes(sourceFilter.toLowerCase().split("/")[0]);
        return matchesSearch && matchesSource;
      })
      .slice(0, limit);
  }, [trends, searchQuery, dateFilter, sourceFilter]);

  const loadTrendScoreData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRisingTrends();
      setTrends(data);
      if (data.length > 0) {
        setSelectedKeyword(data[0].keyword);
      }
    } catch (err: any) {
      setError(err.message || "Unable to load India Trend Score data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrendScoreData();
  }, []);

  const activeTopic = useMemo(() => {
    return trends.find((t) => t.keyword === selectedKeyword) || trends[0];
  }, [trends, selectedKeyword]);

  // Compute multi-dimensional radar metrics for the active selected topic
  const radarMetrics = useMemo(() => {
    if (!activeTopic) return [];
    const viralityVal = Math.min(100, Math.round(activeTopic.viral_probability * 100));
    const anomalyVal = Math.min(100, Math.round(activeTopic.anomaly_score * 100));
    const scoreVal = Math.min(100, Math.round(activeTopic.india_trend_score * 9));
    const forecastVal = Math.min(100, Math.round(activeTopic.forecast_score * 500));
    const rankVal = Math.max(10, 100 - activeTopic.trend_rank * 8);

    return [
      { subject: "Virality Prob", value: viralityVal, fullMark: 100 },
      { subject: "Anomaly Score", value: anomalyVal, fullMark: 100 },
      { subject: "Trend Score", value: scoreVal, fullMark: 100 },
      { subject: "Forecast Weight", value: forecastVal, fullMark: 100 },
      { subject: "Rank Priority", value: rankVal, fullMark: 100 },
    ];
  }, [activeTopic]);

  // Compute real score distribution buckets from trends
  const scoreDistributionData = useMemo(() => {
    let r1 = 0, r2 = 0, r3 = 0, r4 = 0, r5 = 0;
    trends.forEach((t) => {
      const s = t.india_trend_score;
      if (s <= 2) r1++;
      else if (s <= 4) r2++;
      else if (s <= 6) r3++;
      else if (s <= 8) r4++;
      else r5++;
    });
    return [
      { range: "0 - 2", count: r1 },
      { range: "2.1 - 4", count: r2 },
      { range: "4.1 - 6", count: r3 },
      { range: "6.1 - 8", count: r4 },
      { range: "8.1 - 11", count: r5 },
    ];
  }, [trends]);

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
        <p className="text-sm font-semibold text-slate-400">Loading India Trend Score leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4 text-center p-6 bg-card border border-rose-500/30 rounded-[18px]">
        <AlertTriangle className="w-10 h-10 text-rose-500" />
        <h3 className="text-lg font-bold text-foreground">Unable to load live leaderboard</h3>
        <p className="text-xs text-slate-400 max-w-md">{error}</p>
        <button
          onClick={loadTrendScoreData}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-[10px] transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Please try again</span>
        </button>
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3 text-center p-6 bg-card border border-border rounded-[18px]">
        <Globe className="w-10 h-10 text-slate-500" />
        <h3 className="text-base font-bold text-foreground">No live trend score data available</h3>
        <p className="text-xs text-slate-500">The trend pipeline dataset currently returned zero records.</p>
        <button
          onClick={loadTrendScoreData}
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center space-x-2">
            <Star className="w-5.5 h-5.5 text-amber-500 fill-amber-500/20" />
            <span>India Trend Score Leaderboard</span>
          </h2>
          <p className="text-xs text-slate-500">
            Composite score metric combining virality probabilities, anomaly weights, and forecast projections.
          </p>
        </div>
        <button
          onClick={loadTrendScoreData}
          className="p-2 rounded-[10px] bg-slate-900 border border-border hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Refresh Live Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Row containing Radar Analysis and Score Distribution */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radar Analysis (7/12 width) */}
        <div className="lg:col-span-7 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[400px]">
          <div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
                  {formatKeyword(activeTopic?.keyword || "")}
                </span>
                <h3 className="text-sm font-bold text-foreground">Trend Vector Dimensional Analysis</h3>
              </div>
              <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-[8px]">
                Score: {activeTopic?.india_trend_score.toFixed(2)}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Multi-parameter dimensional inspection for the selected trend.
            </p>
          </div>

          <div className="flex-1 w-full h-[260px] flex items-center justify-center mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarMetrics}>
                <PolarGrid stroke="hsl(var(--border))" opacity={0.3} />
                <PolarAngleAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--border))" fontSize={9} />
                <Radar
                  name={formatKeyword(activeTopic?.keyword || "")}
                  dataKey="value"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution (5/12 width) */}
        <div className="lg:col-span-5 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[400px]">
          <div>
            <h3 className="text-sm font-bold text-foreground">Trend Score Distribution</h3>
            <p className="text-xs text-slate-500">Frequency distribution of India Trend Scores in top rankings.</p>
          </div>
          <div className="flex-1 w-full h-[260px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistributionData} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
                <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Leaderboard Table */}
      <motion.div variants={itemVariants} className="p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-foreground">Active Leaderboard ({filteredTrends.length})</h3>
            <p className="text-xs text-slate-500">
              Click on any row to inspect its dimensional radar vector above.
            </p>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-[10px] bg-slate-950 border border-border text-xs font-semibold text-slate-400">
            <Compass className="w-4 h-4 text-amber-500" />
            <span>Click rows to analyze dimensions</span>
          </div>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTrends.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => setSelectedKeyword(item.keyword)}
                  className={`hover:bg-slate-800/20 transition-all font-medium cursor-pointer ${
                    selectedKeyword === item.keyword ? "bg-slate-800/30 border-l-2 border-amber-500" : ""
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-400">
                    <span className="flex items-center space-x-1.5">
                      <Award className={`w-4 h-4 ${idx === 0 ? "text-amber-400" : idx === 1 ? "text-slate-300" : "text-amber-700"}`} />
                      <span>#{item.trend_rank}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-foreground">{formatKeyword(item.keyword)}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-amber-400">{item.india_trend_score.toFixed(2)}</span>
                      <div className="w-24 bg-slate-800 rounded-full h-1.5 hidden md:block">
                        <div
                          className="bg-amber-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (item.india_trend_score / 11) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">{(item.viral_probability * 100).toFixed(1)}%</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-full border bg-purple-500/10 text-purple-400 border-purple-500/20">
                      {item.forecast_score.toFixed(3)}
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
