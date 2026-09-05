import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AlertOctagon,
  ShieldAlert,
  AlertTriangle,
  Flame,
  Activity,
  RefreshCw,
  Globe,
} from "lucide-react";
import {
  fetchAnomalies,
  formatKeyword,
  type AnomalyRecord,
} from "../services/api";

import { useStore } from "../hooks/useStore";

export const AnomalyDetection: React.FC = () => {
  const { dateFilter, sourceFilter, searchQuery } = useStore();
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function for source filtering matching existing categories
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

  const filteredAnomalies = useMemo(() => {
    const limit = dateFilter === "Today" ? 5 : dateFilter === "Last 7 Days" ? 15 : dateFilter === "Last 15 Days" ? 30 : 50;
    return anomalies
      .filter((item) => {
        const matchesSearch = item.keyword.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch && matchesSource(item.keyword, sourceFilter);
      })
      .slice(0, limit);
  }, [anomalies, searchQuery, dateFilter, sourceFilter]);

  const loadAnomalyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAnomalies(50);
      setAnomalies(res.anomalies || []);
      setTotalCount(res.count || 0);
    } catch (err: any) {
      setError(err.message || "Unable to load live anomaly data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnomalyData();
  }, []);

  // Compute severity KPI breakdowns from real anomaly scores
  const kpis = useMemo(() => {
    let critical = 0;
    let medium = 0;
    let low = 0;
    anomalies.forEach((item) => {
      if (item.anomaly_score >= 0.7) critical++;
      else if (item.anomaly_score >= 0.4) medium++;
      else low++;
    });
    return {
      detected: totalCount || anomalies.length,
      critical,
      medium,
      low,
    };
  }, [anomalies, totalCount]);

  // Scatter plot points from real anomalies (Z-Score vs Anomaly Score)
  const scatterPoints = useMemo(() => {
    return filteredAnomalies.map((item) => {
      const severity =
        item.anomaly_score >= 0.7 ? "Critical" : item.anomaly_score >= 0.4 ? "Medium" : "Low";
      return {
        keyword: formatKeyword(item.keyword),
        zScore: parseFloat(item.z_score_max.toFixed(1)),
        anomalyScore: parseFloat(item.anomaly_score.toFixed(3)),
        trendScore: parseFloat(item.trend_score.toFixed(2)),
        rank: item.trend_rank,
        severity,
      };
    });
  }, [filteredAnomalies]);

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "Critical":
        return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      case "Medium":
        return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "Low":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      default:
        return "text-slate-400 bg-slate-800 border-slate-700/50";
    }
  };

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
        <p className="text-sm font-semibold text-slate-400">Loading live anomaly data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4 text-center p-6 bg-card border border-rose-500/30 rounded-[18px]">
        <AlertTriangle className="w-10 h-10 text-rose-500" />
        <h3 className="text-lg font-bold text-foreground">Unable to load live anomalies</h3>
        <p className="text-xs text-slate-400 max-w-md">{error}</p>
        <button
          onClick={loadAnomalyData}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-[10px] transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Please try again</span>
        </button>
      </div>
    );
  }

  if (anomalies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3 text-center p-6 bg-card border border-border rounded-[18px]">
        <Globe className="w-10 h-10 text-slate-500" />
        <h3 className="text-base font-bold text-foreground">No live anomalies available</h3>
        <p className="text-xs text-slate-500">The anomaly detection pipeline currently returned zero records.</p>
        <button
          onClick={loadAnomalyData}
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
            <AlertOctagon className="w-5.5 h-5.5 text-rose-500" />
            <span>Real-time Anomaly Detection</span>
          </h2>
          <p className="text-xs text-slate-500">
            Isolation Forest and Z-score deviation model detection output.
          </p>
        </div>
        <button
          onClick={loadAnomalyData}
          className="p-2 rounded-[10px] bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh Live Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Cards Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Detected */}
        <div className="p-5 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full filter blur-xl group-hover:bg-blue-500/10 transition-colors" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Detected Anomalies</span>
          <div className="flex justify-between items-baseline mt-4">
            <h3 className="text-3xl font-extrabold text-foreground">{kpis.detected}</h3>
            <span className="text-[10px] text-muted-foreground font-bold">in dataset</span>
          </div>
        </div>

        {/* Critical */}
        <div className="p-5 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full filter blur-xl group-hover:bg-rose-500/10 transition-colors" />
          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Critical Severity (≥0.70)</span>
          <div className="flex justify-between items-baseline mt-4">
            <h3 className="text-3xl font-extrabold text-rose-500">{kpis.critical}</h3>
            <span className="text-[10px] text-rose-500 font-bold flex items-center space-x-1">
              <ShieldAlert className="w-3 h-3 text-rose-500" />
              <span>High score</span>
            </span>
          </div>
        </div>

        {/* Medium */}
        <div className="p-5 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full filter blur-xl group-hover:bg-amber-500/10 transition-colors" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Medium Severity</span>
          <div className="flex justify-between items-baseline mt-4">
            <h3 className="text-3xl font-extrabold text-amber-500">{kpis.medium}</h3>
            <span className="text-[10px] text-amber-500 font-bold flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span>Medium score</span>
            </span>
          </div>
        </div>

        {/* Low */}
        <div className="p-5 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full filter blur-xl group-hover:bg-blue-500/10 transition-colors" />
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Low Severity</span>
          <div className="flex justify-between items-baseline mt-4">
            <h3 className="text-3xl font-extrabold text-blue-400">{kpis.low}</h3>
            <span className="text-[10px] text-muted-foreground font-bold">Low deviation</span>
          </div>
        </div>
      </motion.div>

      {/* Primary Graphs Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Scatter Plot (7/12 width) */}
        <div className="lg:col-span-7 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[420px]">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
              <Activity className="w-4 h-4 text-rose-500" />
              <span>Anomaly Score vs Z-Score Max Deviation</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Mapping real statistical Z-score deviation against model Anomaly Score.
            </p>
          </div>
          
          <div className="flex-1 w-full h-[280px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ left: -10, right: 20, top: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="zScore" name="Z-Score Max" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis dataKey="anomalyScore" name="Anomaly Score" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <ZAxis dataKey="trendScore" range={[60, 400]} name="Trend Score" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                  formatter={(val: any, name: any) => [`${val}`, name]}
                />
                <Scatter
                  name="Critical Anomalies"
                  data={scatterPoints.filter((d) => d.severity === "Critical")}
                  fill="#EF4444"
                />
                <Scatter
                  name="Medium Anomalies"
                  data={scatterPoints.filter((d) => d.severity === "Medium")}
                  fill="#F59E0B"
                />
                <Scatter
                  name="Low Anomalies"
                  data={scatterPoints.filter((d) => d.severity === "Low")}
                  fill="#3B82F6"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Anomaly Distribution Grid (5/12 width) */}
        <div className="lg:col-span-5 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[420px]">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>Top Detected Anomalies Highlight</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Top anomaly records ranked by model anomaly score.
            </p>
          </div>
          <div className="flex-1 flex flex-col justify-center space-y-3.5 my-3">
            {filteredAnomalies.slice(0, 5).map((item, idx) => {
              const sev = item.anomaly_score >= 0.7 ? "Critical" : item.anomaly_score >= 0.4 ? "Medium" : "Low";
              return (
                <div key={idx} className="p-3 bg-muted/30 border border-border rounded-[12px] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-foreground block truncate max-w-[180px]" title={item.keyword}>
                      {formatKeyword(item.keyword)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Rank #{item.trend_rank} • Z-Score: {item.z_score_max.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-rose-400">{item.anomaly_score.toFixed(3)}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getSeverityColor(sev)}`}>
                      {sev}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-border/40 text-center">
            <span className="text-[11px] font-bold text-slate-400">
              Isolation Forest & Z-Score Ensemble Model
            </span>
          </div>
        </div>
      </motion.div>

      {/* Details Table */}
      <motion.div variants={itemVariants} className="p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Detected Anomalies Register ({filteredAnomalies.length})</h3>
          <p className="text-xs text-slate-500">Live feed of detected anomalies sorted by model anomaly score.</p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs font-bold text-slate-400 uppercase border-b border-border">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Topic Keyword</th>
                <th className="py-3 px-4">Anomaly Score</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Z-Score Max</th>
                <th className="py-3 px-4">Iso Score</th>
                <th className="py-3 px-4">Trend Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredAnomalies.map((item, idx) => {
                const sev = item.anomaly_score >= 0.7 ? "Critical" : item.anomaly_score >= 0.4 ? "Medium" : "Low";
                return (
                  <tr key={idx} className="hover:bg-slate-800/20 transition-all font-medium">
                    <td className="py-3.5 px-4 font-bold text-slate-400">#{item.trend_rank}</td>
                    <td className="py-3.5 px-4 font-bold text-foreground">{formatKeyword(item.keyword)}</td>
                    <td className="py-3.5 px-4 font-bold text-rose-400">{item.anomaly_score.toFixed(3)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getSeverityColor(sev)}`}>
                        {sev}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-amber-400">{item.z_score_max.toFixed(1)}</td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-purple-400">{item.iso_score.toFixed(4)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-200">{item.trend_score.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};
