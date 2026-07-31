import React from "react";
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
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";
import {
  Layers,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Flame,
  Car,
  Globe,
} from "lucide-react";
import { useStore } from "../hooks/useStore";

// Sparklines Timeline Data points mapping
const sparklineData = {
  "Total Trends": [
    { value: 10000 }, { value: 10500 }, { value: 10200 }, { value: 11400 }, { value: 12000 }, { value: 11800 }, { value: 12458 }
  ],
  "Trending Today": [
    { value: 600 }, { value: 800 }, { value: 1200 }, { value: 900 }, { value: 1100 }, { value: 1000 }, { value: 1256 }
  ],
  "Anomalies Detected": [
    { value: 20 }, { value: 30 }, { value: 45 }, { value: 35 }, { value: 60 }, { value: 50 }, { value: 87 }
  ],
  "Forecast Accuracy": [
    { value: 90.5 }, { value: 91.2 }, { value: 90.8 }, { value: 91.9 }, { value: 92.1 }, { value: 91.8 }, { value: 92.4 }
  ],
};

const customKPIData = [
  {
    title: "Total Trends",
    value: "12,458",
    change: 18.6,
    timeframe: "vs last 7 days",
    color: "#3B82F6",
    sparkType: "line"
  },
  {
    title: "Trending Today",
    value: "1,256",
    change: 12.4,
    timeframe: "vs yesterday",
    color: "#8B5CF6",
    sparkType: "bar"
  },
  {
    title: "Anomalies Detected",
    value: "87",
    change: 23.1,
    timeframe: "vs yesterday",
    color: "#F59E0B",
    sparkType: "area"
  },
  {
    title: "Forecast Accuracy",
    value: "92.4%",
    change: 3.7,
    timeframe: "vs last 7 days",
    color: "#10B981",
    sparkType: "line"
  }
];

const homeTrendTimeline = [
  { date: "30 May", mentions: 5200 },
  { date: "31 May", mentions: 7800 },
  { date: "1 Jun", mentions: 10500 },
  { date: "2 Jun", mentions: 12842 },
  { date: "3 Jun", mentions: 11000 },
  { date: "4 Jun", mentions: 14200 },
  { date: "5 Jun", mentions: 16800 },
];

const donutData = [
  { name: "Twitter", value: 42, color: "#3B82F6" },
  { name: "YouTube", value: 26, color: "#EF4444" },
  { name: "News", value: 18, color: "#F59E0B" },
  { name: "Reddit", value: 9, color: "#8B5CF6" },
  { name: "Others", value: 5, color: "#10B981" },
];

const premiumInsights = [
  {
    id: 1,
    text: "AI Agents increased by 22% today.",
    icon: Flame,
    color: "text-orange-500 bg-orange-500/10 border-orange-500/20"
  },
  {
    id: 2,
    text: "Electric Vehicles entered the Top 5 trends.",
    icon: Car,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  },
  {
    id: 3,
    text: "Hydrogen Fuel detected as an anomaly.",
    icon: AlertTriangle,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
  },
  {
    id: 4,
    text: "AI Agents are forecasted to remain the top trend for the next 7 days.",
    icon: Sparkles,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20"
  }
];

const topTopicsData = [
  { rank: 1, keyword: "AI Agents", mentions: 18456, growth: 22.4, sentiment: "Positive", score: 95, source: "Twitter", status: "Trending" },
  { rank: 2, keyword: "Electric Vehicles", mentions: 15702, growth: 18.7, sentiment: "Positive", score: 92, source: "YouTube", status: "Trending" },
  { rank: 3, keyword: "Cricket World Cup", mentions: 12865, growth: 12.1, sentiment: "Neutral", score: 85, source: "Twitter", status: "Trending" },
  { rank: 4, keyword: "Hydrogen Fuel", mentions: 9456, growth: 45.2, sentiment: "Negative", score: 78, source: "Reddit", status: "Rising" },
  { rank: 5, keyword: "ISRO Mission", mentions: 8745, growth: 10.2, sentiment: "Positive", score: 74, source: "Google", status: "Rising" }
];

const heatmapRows = [
  { name: "AI Agents", values: [5, 6, 8, 4, 9, 7, 8] },
  { name: "EV", values: [2, 3, 2, 5, 4, 3, 6] },
  { name: "Cricket WC", values: [8, 9, 7, 6, 5, 8, 9] },
  { name: "Hydrogen Fuel", values: [1, 2, 4, 3, 2, 1, 3] },
  { name: "ISRO Mission", values: [4, 5, 6, 8, 7, 9, 8] }
];
const heatmapDates = ["30 May", "31 May", "1 Jun", "2 Jun", "3 Jun", "4 Jun", "5 Jun"];

export const Home: React.FC = () => {
  const { searchQuery } = useStore();

  const filteredTopics = topTopicsData.filter((topic) => {
    const matchesSearch = topic.keyword
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getKPIIcon = (title: string) => {
    switch (title) {
      case "Total Trends":
        return <Layers className="w-4 h-4 text-blue-500" />;
      case "Trending Today":
        return <Zap className="w-4 h-4 text-purple-500" />;
      case "Anomalies Detected":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "Forecast Accuracy":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const getHeatmapCellColor = (val: number) => {
    if (val <= 2) return "bg-blue-500/10 dark:bg-blue-500/5 border border-border/30";
    if (val <= 4) return "bg-blue-500/25 dark:bg-blue-500/15";
    if (val <= 6) return "bg-blue-500/45 dark:bg-blue-500/35";
    if (val <= 8) return "bg-blue-500/70 dark:bg-blue-500/60";
    return "bg-blue-600 dark:bg-blue-500";
  };

  const renderSourceIcon = (source: string) => {
    switch (source) {
      case "Twitter":
        return (
          <svg className="w-3.5 h-3.5 text-blue-500 fill-current" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        );
      case "YouTube":
        return (
          <svg className="w-3.5 h-3.5 text-red-500 fill-current" viewBox="0 0 24 24">
            <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case "Reddit":
        return <Globe className="w-3.5 h-3.5 text-orange-500" />;
      case "Google":
        return <Globe className="w-3.5 h-3.5 text-blue-500" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Trending":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Rising":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const getSentimentBadgeStyle = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Neutral":
        return "bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 border-border";
      case "Negative":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 border-border";
    }
  };

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="bg-[#0F172A] border border-[#334155] rounded-[12px] p-3 text-xs text-[#F8FAFC] shadow-xl">
          <p className="font-bold text-slate-400 mb-1">{label} 2024</p>
          <p className="font-extrabold text-sm flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            <span>{val.toLocaleString()} Mentions</span>
          </p>
          <p className="text-[10px] text-emerald-400 font-bold mt-1">
            +18.0% vs baseline
          </p>
        </div>
      );
    }
    return null;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
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
      {/* Row 1: 4 KPI Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {customKPIData.map((kpi, idx) => {
          const sparkData = sparklineData[kpi.title as keyof typeof sparklineData] || [];
          return (
            <div
              key={idx}
              className="p-5 bg-card border border-border rounded-[18px] backdrop-blur-md relative overflow-hidden flex items-center justify-between h-32"
            >
              <div className="flex flex-col justify-between h-full py-1">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider block">
                      {kpi.title}
                    </span>
                    <div className="p-1 rounded-[6px] bg-slate-950/5 dark:bg-slate-950/40 border border-border">
                      {getKPIIcon(kpi.title)}
                    </div>
                  </div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-foreground mt-2.5">
                    {kpi.value}
                  </h3>
                </div>
                <div className="flex items-center space-x-1.5 mt-2">
                  {kpi.change >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-rose-500" />
                  )}
                  <span className={`text-[11px] font-bold ${kpi.change >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {kpi.change >= 0 ? `+${kpi.change}%` : `${kpi.change}%`}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide">
                    {kpi.timeframe}
                  </span>
                </div>
              </div>

              {/* Sparkline chart on the right */}
              <div className="w-24 h-16 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {kpi.sparkType === "bar" ? (
                    <BarChart data={sparkData}>
                      <Bar dataKey="value" fill={kpi.color} radius={[1.5, 1.5, 0, 0]} />
                    </BarChart>
                  ) : kpi.sparkType === "area" ? (
                    <AreaChart data={sparkData}>
                      <defs>
                        <linearGradient id={`gradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={kpi.color} stopOpacity={0.2} />
                          <stop offset="100%" stopColor={kpi.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke={kpi.color} strokeWidth={1.5} fill={`url(#gradient-${idx})`} dot={false} />
                    </AreaChart>
                  ) : (
                    <LineChart data={sparkData}>
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
              <h3 className="text-sm font-bold text-foreground">Trend Volume Over Time</h3>
              <p className="text-[11px] text-slate-500">Mentions timeline tracking absolute volume aggregates.</p>
            </div>
            <div className="text-[10px] font-bold text-slate-450 dark:text-slate-400 border border-border rounded-[8px] px-2 py-0.5 bg-slate-950/5 dark:bg-slate-950/40">
              Mentions
            </div>
          </div>
          
          <div className="flex-1 w-full h-[270px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={homeTrendTimeline} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="mentions"
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
            <h3 className="text-sm font-bold text-foreground">Source Distribution</h3>
            <p className="text-[11px] text-slate-500">Platform share metrics.</p>
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
              {/* Donut Center text */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-foreground">12,458</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Total</span>
              </div>
            </div>

            {/* Custom Vertical Legend */}
            <div className="w-1/2 flex flex-col space-y-2 pl-3">
              {donutData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-1.5 font-semibold text-slate-650 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-extrabold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border/40 text-center">
            <a href="#" className="text-xs font-bold text-blue-500 hover:underline inline-flex items-center">
              View all sources &rarr;
            </a>
          </div>
        </div>

        {/* Today's AI Insights (3/12 width) */}
        <div className="lg:col-span-3 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[390px]">
          <div>
            <h3 className="text-sm font-bold text-foreground">Today's AI Insights</h3>
            <p className="text-[11px] text-slate-500">Automated signal summaries.</p>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-4 my-2">
            {premiumInsights.map((insight) => {
              const IconComponent = insight.icon;
              return (
                <div key={insight.id} className="flex items-start space-x-2.5">
                  <div className={`p-1.5 rounded-[8px] border flex-shrink-0 mt-0.5 ${insight.color}`}>
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium leading-normal text-slate-650 dark:text-slate-300">
                    {insight.text}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-border/40 text-center">
            <a href="#" className="text-xs font-bold text-blue-500 hover:underline inline-flex items-center">
              View all Insights &rarr;
            </a>
          </div>
        </div>
      </motion.div>

      {/* Row 3: Table and Heatmap grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Topics Table (7/12 width) */}
        <div className="lg:col-span-7 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col space-y-4 justify-between min-h-[390px]">
          <div>
            <h3 className="text-sm font-bold text-foreground">Top 10 Trending Topics</h3>
            <p className="text-[11px] text-slate-500">Ranked topics based on absolute growth scores.</p>
          </div>

          <div className="overflow-x-auto w-full flex-1">
            <table className="w-full text-sm text-left text-slate-650 dark:text-slate-300">
              <thead className="text-[11px] font-bold text-slate-450 dark:text-slate-455 uppercase border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Topic</th>
                  <th className="py-2.5 px-3">Mentions</th>
                  <th className="py-2.5 px-3">Growth</th>
                  <th className="py-2.5 px-3">Sentiment</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTopics.length > 0 ? (
                  filteredTopics.map((topic, idx) => (
                    <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition-all font-medium text-xs">
                      <td className="py-3 px-3 font-bold text-slate-400">#{topic.rank}</td>
                      <td className="py-3 px-3 font-extrabold text-foreground">{topic.keyword}</td>
                      <td className="py-3 px-3 font-bold text-slate-700 dark:text-slate-200">{topic.mentions.toLocaleString()}</td>
                      <td className="py-3 px-3 text-emerald-500 font-bold">+{topic.growth}%</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getSentimentBadgeStyle(topic.sentiment)}`}>
                          {topic.sentiment}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-foreground">{topic.score}</td>
                      <td className="py-3 px-3">{renderSourceIcon(topic.source)}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadgeStyle(topic.status)}`}>
                          {topic.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-500 text-xs">
                      No matching trends found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Heatmap Card (5/12 width) */}
        <div className="lg:col-span-5 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between min-h-[390px]">
          <div>
            <h3 className="text-sm font-bold text-foreground">Trend Heatmap <span className="text-[10px] text-slate-400">(Last 7 Days)</span></h3>
            <p className="text-[11px] text-slate-500">Drift density counts across channels.</p>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-3.5 my-3">
            <div className="grid grid-cols-8 gap-2 text-center text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              <div className="text-left">Topic</div>
              {heatmapDates.map((date) => (
                <div key={date}>{date}</div>
              ))}
            </div>
            
            <div className="space-y-2.5">
              {heatmapRows.map((row) => (
                <div key={row.name} className="grid grid-cols-8 gap-2 items-center">
                  <div className="text-left text-[11px] font-bold text-slate-650 dark:text-slate-400 truncate pr-1">
                    {row.name}
                  </div>
                  {row.values.map((val, idx) => (
                    <div
                      key={idx}
                      className={`h-6 rounded-[4px] transition-all hover:scale-105 ${getHeatmapCellColor(val)}`}
                      title={`Volume density: ${val}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap low-to-high gradient footer bar */}
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase pt-3 border-t border-border/40">
            <span>Low</span>
            <div className="w-44 h-1.5 bg-gradient-to-r from-blue-500/10 via-blue-500/50 to-blue-600 rounded-full" />
            <span>High</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
