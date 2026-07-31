import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  trendScoreData,
  scoreDistributionData,
} from "../mockData/dashboardData";
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
} from "lucide-react";

export const IndiaTrendScore: React.FC = () => {
  const [selectedKeyword, setSelectedKeyword] = useState<string>("AI Agents");

  // Find the selected topic's metrics
  const activeTopic = trendScoreData.find((t) => t.keyword === selectedKeyword) || trendScoreData[0];

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
            <Star className="w-5.5 h-5.5 text-amber-500 fill-amber-500/20" />
            <span>India Trend Score Leaderboard</span>
          </h2>
          <p className="text-xs text-slate-500">
            Composite metrics tracking trend severity, virality weight, sentiment polarities, and media expansion rates.
          </p>
        </div>
      </div>

      {/* Row containing Radar Analysis and Score Distribution */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radar Analysis (7/12 width) */}
        <div className="lg:col-span-7 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[400px]">
          <div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                  {activeTopic.keyword}
                </span>
                <h3 className="text-sm font-bold text-foreground">Trend Vector Dimensional Analysis</h3>
              </div>
              <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-[8px]">
                Score: {activeTopic.score} / 100
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Inspection of underlying parameters representing structural strength.
            </p>
          </div>

          <div className="flex-1 w-full h-[260px] flex items-center justify-center mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={activeTopic.metrics}>
                <PolarGrid stroke="hsl(var(--border))" opacity={0.3} />
                <PolarAngleAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--border))" fontSize={9} />
                <Radar
                  name={activeTopic.keyword}
                  dataKey="value"
                  stroke="#F59E0B"
                  fill="#F59E0B"
                  fillOpacity={0.15}
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
            <p className="text-xs text-slate-500">Frequency distribution of monitored keywords.</p>
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
            <h3 className="text-sm font-bold text-foreground">Active Leaderboard</h3>
            <p className="text-xs text-slate-500">
              Click on a keyword row to populate the multi-dimensional radar analyzer above.
            </p>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-[10px] bg-slate-950/10 dark:bg-slate-950 border border-border text-xs font-semibold text-slate-400">
            <Compass className="w-4 h-4 text-amber-500 animate-spin" />
            <span>Click rows to analyze dimensions</span>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left text-slate-650 dark:text-slate-300">
            <thead className="text-xs font-bold text-slate-400 uppercase border-b border-border">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Keyword</th>
                <th className="py-3 px-4">Trend Score</th>
                <th className="py-3 px-4">Growth</th>
                <th className="py-3 px-4">Forecast Projection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {trendScoreData.map((item, idx) => (
                <tr
                  key={idx}
                  onClick={() => setSelectedKeyword(item.keyword)}
                  className={`hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition-all font-medium cursor-pointer ${
                    selectedKeyword === item.keyword ? "bg-slate-100 dark:bg-slate-800/10" : ""
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-400">
                    <span className="flex items-center space-x-1.5">
                      <Award className={`w-4 h-4 ${idx === 0 ? "text-amber-400" : idx === 1 ? "text-slate-400 dark:text-slate-300" : "text-amber-700"}`} />
                      <span>#{item.rank}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-foreground">{item.keyword}</td>
                  <td className="py-3.5 px-4">
                    {/* Visual Progress Bar representation of Score */}
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-amber-400">{item.score}</span>
                      <div className="w-24 bg-slate-800 rounded-full h-1.5 hidden md:block">
                        <div
                          className="bg-amber-500 h-1.5 rounded-full"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400">+{item.growth}%</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-full border bg-purple-500/10 text-purple-400 border-purple-500/20">
                      {item.forecast}
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
