import React from "react";
import { motion } from "framer-motion";
import {
  anomalyKPIs,
  anomalyScatterData,
  anomalyHeatmapData,
  anomalyTableData,
} from "../mockData/dashboardData";
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
  Calendar,
  Flame,
  Activity,
} from "lucide-react";

export const AnomalyDetection: React.FC = () => {
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

  const getHeatmapColor = (val: number) => {
    if (val === 0) return "bg-slate-900/5 dark:bg-slate-900/40 border border-border text-slate-500";
    if (val <= 2) return "bg-blue-950/40 border border-blue-900/25 text-blue-400";
    if (val <= 4) return "bg-purple-950/60 border border-purple-800/40 text-purple-400";
    return "bg-rose-950/80 border border-rose-800/60 text-rose-300 font-bold animate-pulse-slow";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

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
            Automated alerts indicating sudden changes in topic volumes, sentiments, or virality weights.
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Detected */}
        <div className="p-5 bg-gradient-to-br from-slate-900/40 to-slate-900/20 border border-slate-800 rounded-[18px] backdrop-blur-md flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full filter blur-xl group-hover:bg-blue-500/10 transition-colors" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detected Signals</span>
          <div className="flex justify-between items-baseline mt-4">
            <h3 className="text-3xl font-extrabold text-foreground">{anomalyKPIs.detected}</h3>
            <span className="text-[10px] text-slate-500 font-bold">Active today</span>
          </div>
        </div>

        {/* Critical */}
        <div className="p-5 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full filter blur-xl group-hover:bg-rose-500/10 transition-colors" />
          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Critical Severity</span>
          <div className="flex justify-between items-baseline mt-4">
            <h3 className="text-3xl font-extrabold text-rose-500">{anomalyKPIs.critical}</h3>
            <span className="text-[10px] text-rose-500 font-bold flex items-center space-x-1">
              <ShieldAlert className="w-3 h-3 text-rose-500" />
              <span>Immediate review</span>
            </span>
          </div>
        </div>

        {/* Medium */}
        <div className="p-5 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full filter blur-xl group-hover:bg-amber-500/10 transition-colors" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Medium Severity</span>
          <div className="flex justify-between items-baseline mt-4">
            <h3 className="text-3xl font-extrabold text-amber-500">{anomalyKPIs.medium}</h3>
            <span className="text-[10px] text-amber-500 font-bold flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span>Inspect feeds</span>
            </span>
          </div>
        </div>

        {/* Low */}
        <div className="p-5 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full filter blur-xl group-hover:bg-blue-500/10 transition-colors" />
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Low Severity</span>
          <div className="flex justify-between items-baseline mt-4">
            <h3 className="text-3xl font-extrabold text-blue-400">{anomalyKPIs.low}</h3>
            <span className="text-[10px] text-slate-500 font-bold">Standard drift</span>
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
              <span>Spike Severity vs Time of Day</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Scatter plots mapping time of event relative to estimated spike factor ratio.
            </p>
          </div>
          
          <div className="flex-1 w-full h-[280px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ left: -10, right: 20, top: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="time" name="Time" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis dataKey="spikeFactor" name="Spike Factor" unit="x" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <ZAxis dataKey="volume" range={[60, 400]} name="Volume" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                />
                {/* Critical anomalies */}
                <Scatter
                  name="Critical Alerts"
                  data={anomalyScatterData.filter((d) => d.severity === "Critical")}
                  fill="#EF4444"
                />
                {/* Medium anomalies */}
                <Scatter
                  name="Medium Alerts"
                  data={anomalyScatterData.filter((d) => d.severity === "Medium")}
                  fill="#F59E0B"
                />
                {/* Low anomalies */}
                <Scatter
                  name="Low Alerts"
                  data={anomalyScatterData.filter((d) => d.severity === "Low")}
                  fill="#3B82F6"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap Grid (5/12 width) */}
        <div className="lg:col-span-5 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[420px]">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Anomaly Density Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Inspection density counts by day of week across channels.
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center mt-4">
            <div className="w-full grid grid-cols-5 gap-2 text-center text-xs font-semibold">
              <div className="text-slate-500 text-left">Day</div>
              <div className="text-slate-400">Twitter</div>
              <div className="text-slate-400">News</div>
              <div className="text-slate-400">Reddit</div>
              <div className="text-slate-400">Google</div>
              
              {anomalyHeatmapData.map((row, index) => (
                <React.Fragment key={index}>
                  <div className="text-slate-400 text-left flex items-center">{row.day}</div>
                  <div className={`py-3 rounded-[8px] flex items-center justify-center ${getHeatmapColor(row.Twitter)}`}>
                    {row.Twitter}
                  </div>
                  <div className={`py-3 rounded-[8px] flex items-center justify-center ${getHeatmapColor(row.News)}`}>
                    {row.News}
                  </div>
                  <div className={`py-3 rounded-[8px] flex items-center justify-center ${getHeatmapColor(row.Reddit)}`}>
                    {row.Reddit}
                  </div>
                  <div className={`py-3 rounded-[8px] flex items-center justify-center ${getHeatmapColor(row.Google)}`}>
                    {row.Google}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Details Table */}
      <motion.div variants={itemVariants} className="p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Detected Anomalies Register</h3>
          <p className="text-xs text-slate-500">Chronological feed of automated alerts matching signal thresholds.</p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left text-slate-650 dark:text-slate-300">
            <thead className="text-xs font-bold text-slate-400 uppercase border-b border-border">
              <tr>
                <th className="py-3 px-4">Alert ID</th>
                <th className="py-3 px-4">Topic</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Spike Deviation</th>
                <th className="py-3 px-4">Time Detected</th>
                <th className="py-3 px-4">Trigger Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {anomalyTableData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition-all font-medium">
                  <td className="py-3.5 px-4 font-bold text-slate-500">{item.id}</td>
                  <td className="py-3.5 px-4 font-bold text-foreground">{item.topic}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getSeverityColor(item.severity)}`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-400">{item.source}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center space-x-1.5">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span>{item.spikeFactor}x</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-400">{item.time}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-400 max-w-sm font-medium leading-relaxed">
                    {item.reason}
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
