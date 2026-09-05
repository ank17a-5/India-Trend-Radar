import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  RefreshCw,
  Search,
  SlidersHorizontal,
  Flame,
  AlertTriangle,
  Globe,
} from "lucide-react";
import { useStore } from "../hooks/useStore";
import {
  fetchRisingTrends,
  fetchForecast,
  formatKeyword,
  type RisingTrend,
  type ForecastPoint,
} from "../services/api";

export const TrendingNow: React.FC = () => {
  const { searchQuery, setSearchQuery } = useStore();
  const [trends, setTrends] = useState<RisingTrend[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [forecastPoints, setForecastPoints] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRisingTrends();
      setTrends(data);
      if (data.length > 0) {
        setSelectedTopic(data[0].keyword);
      }
    } catch (err: any) {
      setError(err.message || "Unable to load live data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedTopic) return;
    fetchForecast(selectedTopic)
      .then((res) => {
        setForecastPoints(res.forecast || []);
      })
      .catch(() => {
        setForecastPoints([]);
      });
  }, [selectedTopic]);

  // Column Helper definition for TanStack Table
  const columnHelper = createColumnHelper<RisingTrend>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("trend_rank", {
        header: () => <span className="text-xs font-bold">Rank</span>,
        cell: (info) => <span className="font-bold text-slate-400">#{info.getValue()}</span>,
      }),
      columnHelper.accessor("keyword", {
        header: () => <span className="text-xs font-bold">Topic Keyword</span>,
        cell: (info) => (
          <button
            onClick={() => setSelectedTopic(info.getValue())}
            className={`font-bold hover:text-blue-400 transition-colors text-left ${
              selectedTopic === info.getValue() ? "text-blue-500 underline decoration-2 underline-offset-4" : "text-white"
            }`}
            title={info.getValue()}
          >
            {formatKeyword(info.getValue())}
          </button>
        ),
      }),
      columnHelper.accessor("india_trend_score", {
        header: () => <span className="text-xs font-bold">Trend Score</span>,
        cell: (info) => <span className="font-bold text-amber-400">{info.getValue().toFixed(2)}</span>,
      }),
      columnHelper.accessor("viral_probability", {
        header: () => <span className="text-xs font-bold">Viral Prob</span>,
        cell: (info) => <span className="font-bold text-emerald-400">{(info.getValue() * 100).toFixed(1)}%</span>,
      }),
      columnHelper.accessor("anomaly_score", {
        header: () => <span className="text-xs font-bold">Anomaly Score</span>,
        cell: (info) => <span className="font-semibold text-rose-400">{info.getValue().toFixed(2)}</span>,
      }),
      columnHelper.accessor("forecast_score", {
        header: () => <span className="text-xs font-bold">Forecast Score</span>,
        cell: (info) => <span className="font-semibold text-purple-400">{info.getValue().toFixed(3)}</span>,
      }),
      columnHelper.accessor("is_anomaly", {
        header: () => <span className="text-xs font-bold">Status</span>,
        cell: (info) => {
          const isAnomaly = info.getValue() === 1;
          const isViral = info.row.original.predicted_viral === 1;
          const val = isAnomaly ? "Anomaly" : isViral ? "Viral Spike" : "Active";
          const color = isAnomaly
            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
            : isViral
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-blue-500/10 text-blue-400 border-blue-500/20";
          return <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${color}`}>{val}</span>;
        },
      }),
    ],
    [selectedTopic]
  );

  const { dateFilter, sourceFilter } = useStore();

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

  // Filter topics list by search, date range, and source filter
  const filteredData = useMemo(() => {
    const limit = dateFilter === "Today" ? 3 : dateFilter === "Last 7 Days" ? 7 : dateFilter === "Last 15 Days" ? 15 : 30;
    return trends
      .filter((topic) => {
        const matchesSearch = topic.keyword.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch && matchesSource(topic.keyword, sourceFilter);
      })
      .slice(0, limit);
  }, [trends, searchQuery, dateFilter, sourceFilter]);

  // TanStack Table Core configuration
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Timeline data mapping based on real forecast points
  const timelineChartData = useMemo(() => {
    if (forecastPoints.length === 0) return [];
    return forecastPoints.map((pt) => ({
      date: pt.ds,
      Predicted: parseFloat(pt.yhat.toFixed(4)),
      UpperLimit: parseFloat(pt.yhat_upper.toFixed(4)),
      LowerLimit: parseFloat(pt.yhat_lower.toFixed(4)),
    }));
  }, [forecastPoints]);

  // Keyword score comparisons for bar chart
  const frequencyData = useMemo(() => {
    return (filteredData.length > 0 ? filteredData : trends.slice(0, 10)).map((t) => ({
      name: formatKeyword(t.keyword).slice(0, 14) + "...",
      Score: parseFloat(t.india_trend_score.toFixed(2)),
    }));
  }, [trends, filteredData]);

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
        <p className="text-sm font-semibold text-muted-foreground">Loading live data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4 text-center p-6 bg-card border border-rose-500/30 rounded-[18px]">
        <AlertTriangle className="w-10 h-10 text-rose-500" />
        <h3 className="text-lg font-bold text-foreground">Unable to load live data</h3>
        <p className="text-xs text-muted-foreground max-w-md">{error}</p>
        <button
          onClick={loadData}
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
        <Globe className="w-10 h-10 text-muted-foreground" />
        <h3 className="text-base font-bold text-foreground">No live data available</h3>
        <p className="text-xs text-muted-foreground">The trend pipeline dataset currently returned zero records.</p>
        <button
          onClick={loadData}
          className="px-4 py-1.5 text-xs font-bold text-foreground bg-card hover:bg-muted border border-border rounded-[8px] transition-colors"
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
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center space-x-2">
            <Flame className="w-5 h-5 text-red-500 animate-pulse" />
            <span>Live Trending Analytics</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Real viral growth predictions and Prophet forecast curves from live dataset.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Quick Local Search */}
          <div className="relative flex-grow sm:flex-grow-0">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="w-4 h-4 text-muted-foreground" />
            </span>
            <input
              type="text"
              placeholder="Filter topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 pl-9 pr-3 py-1.5 text-xs bg-card border border-border rounded-[10px] text-foreground focus:outline-none placeholder:text-muted-foreground"
            />
          </div>

          <button
            onClick={loadData}
            className="p-2 rounded-[10px] bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Graphs Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Timeline Chart (7/12 width) */}
        <div className="lg:col-span-7 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[380px]">
          <div>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">
              {formatKeyword(selectedTopic) || "Overall Forecast"}
            </span>
            <h3 className="text-sm font-bold text-foreground">Prophet Forecast Timeline (Predicted Trend Trajectory)</h3>
          </div>
          <div className="flex-1 w-full h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineChartData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Predicted"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPredicted)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Keyword Trend Score Comparison (5/12 width) */}
        <div className="lg:col-span-5 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[380px]">
          <div>
            <h3 className="text-sm font-bold text-foreground">India Trend Score Comparison</h3>
            <p className="text-[11px] text-slate-500">Score comparison for top live trends.</p>
          </div>
          <div className="flex-1 w-full h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyData} layout="vertical" margin={{ left: 20, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                />
                <Bar dataKey="Score" fill="#7C3AED" radius={[0, 6, 6, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Trending Topics TanStack Table */}
      <motion.div variants={itemVariants} className="p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-foreground">Live Active Trends List ({filteredData.length})</h3>
            <p className="text-xs text-slate-500">Select any keyword in the list to inspect its forecast curve.</p>
          </div>
          <div className="flex items-center space-x-1 bg-slate-950/60 border border-border rounded-[10px] px-2.5 py-1 text-xs text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Interactive Table</span>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs font-bold text-slate-400 uppercase border-b border-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="py-3 px-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border/60">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-800/20 transition-all font-medium ${
                      selectedTopic === row.original.keyword ? "bg-slate-800/20 border-l-2 border-blue-500" : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3.5 px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="py-6 text-center text-slate-500 text-xs">
                    No matching trends found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};
