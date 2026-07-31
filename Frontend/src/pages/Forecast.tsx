import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  forecastCards,
  forecastTimelineData,
  predictionTableData,
} from "../mockData/dashboardData";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BrainCircuit,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  CalendarDays,
  Target,
  Sparkles,
} from "lucide-react";

export const Forecast: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(30); // 7, 14, or 30 days active view

  // Filter timeline data based on selected forecast timeframe
  const filteredTimeline = forecastTimelineData.filter((item) => {
    if (activeTab === 7) {
      // Return historical plus 7 days future prediction (up to Aug 08)
      const dateVal = new Date(item.date + " 2026");
      const cutOff = new Date("Aug 09 2026");
      return dateVal <= cutOff;
    } else if (activeTab === 14) {
      // Return historical plus 14 days future prediction (up to Aug 15)
      const dateVal = new Date(item.date + " 2026");
      const cutOff = new Date("Aug 16 2026");
      return dateVal <= cutOff;
    }
    return true; // Return all 30 days
  });

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case "UP":
        return <ArrowUp className="w-4 h-4 text-emerald-400" />;
      case "DOWN":
        return <ArrowDown className="w-4 h-4 text-rose-400" />;
      default:
        return <TrendingUp className="w-4 h-4 text-slate-400" />;
    }
  };

  const getConfidenceStyle = (conf: string) => {
    switch (conf) {
      case "High":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Low":
        return "bg-slate-800 text-slate-400 border-slate-700/50";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700/50";
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
            Machine learning projections for trend growth trajectories over 7, 14, and 30-day horizons.
          </p>
        </div>
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
                <span>{card.days} Days Forecast Target</span>
              </span>
              <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/10 dark:bg-slate-950 border border-border text-[10px] font-bold text-slate-400">
                <Target className="w-3 h-3 text-purple-400" />
                <span>{card.accuracy}% Model Accuracy</span>
              </div>
            </div>

            {/* Growth dynamic */}
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-2xl font-extrabold text-foreground">
                Trend Vector:
              </span>
              <div className="flex items-center space-x-1.5 bg-slate-950/10 dark:bg-slate-950/60 border border-border rounded-[8px] px-2 py-0.5 text-xs font-bold">
                {getDirectionIcon(card.direction)}
                <span className={card.direction === "UP" ? "text-emerald-400" : "text-rose-400"}>
                  {card.direction}
                </span>
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
              <span>Actual vs Predicted Volume (Confidence Bounds)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Shaded interval represents 95% forecast confidence limits.
            </p>
          </div>
          <div className="flex items-center bg-slate-950/10 dark:bg-slate-950 border border-border rounded-[10px] p-1 text-[11px] font-bold">
            <span className="px-2 py-1 text-slate-400">View range:</span>
            <span className="px-3 py-1 bg-slate-900/10 dark:bg-slate-900 text-purple-400 border border-border rounded-[8px]">
              {activeTab} Days Projections
            </span>
          </div>
        </div>

        {/* Recharts Area and Line */}
        <div className="flex-1 w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredTimeline} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
              <defs>
                {/* Gradient for confidence limits */}
                <linearGradient id="confidenceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.06} />
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
              
              {/* Confidence Interval represented as Area between lower and upper bound */}
              <Area
                type="monotone"
                dataKey="upperBound"
                stroke="none"
                fill="url(#confidenceFill)"
                name="95% Confidence Bounds"
              />
              <Area
                type="monotone"
                dataKey="lowerBound"
                stroke="none"
                fill="url(#confidenceFill)"
                name="Confidence Margin Lower"
              />

              {/* Predicted Values */}
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#A78BFA"
                strokeDasharray="4 4"
                strokeWidth={2}
                fill="none"
                name="Predicted Trend Line"
              />

              {/* Actual Values (plotted as line, stops where actual points run out) */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3B82F6"
                strokeWidth={2.5}
                dot={{ r: 4, stroke: "#3B82F6", strokeWidth: 1, fill: "#0F172A" }}
                activeDot={{ r: 6 }}
                name="Actual Trend Line"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Prediction List Table */}
      <motion.div variants={itemVariants} className="p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Specific Trend Prediction Details</h3>
          <p className="text-xs text-slate-500">
            Granular estimates of forecasted volumes, percentage growth targets, and model certainty.
          </p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left text-slate-650 dark:text-slate-300">
            <thead className="text-xs font-bold text-slate-400 uppercase border-b border-border">
              <tr>
                <th className="py-3 px-4">Keyword</th>
                <th className="py-3 px-4">Current Mentions</th>
                <th className="py-3 px-4">Forecast Target</th>
                <th className="py-3 px-4">Expected Value</th>
                <th className="py-3 px-4">Expected Growth</th>
                <th className="py-3 px-4">Confidence Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {predictionTableData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition-all font-medium">
                  <td className="py-3.5 px-4 font-bold text-foreground">{item.keyword}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-400">
                    {item.currentMentions.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-400">
                    {item.forecastDays} Days Proj.
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200">
                    ~{item.expectedValue.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">+{item.growth}%</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getConfidenceStyle(
                        item.confidence
                      )}`}
                    >
                      {item.confidence}
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
