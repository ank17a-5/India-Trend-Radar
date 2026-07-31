import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  topTrendingTopics,
  homeTrendTimeline,
} from "../mockData/dashboardData";
import type { TrendingTopic } from "../mockData/dashboardData";
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
} from "lucide-react";
import { useStore } from "../hooks/useStore";

export const TrendingNow: React.FC = () => {
  const { searchQuery, setSearchQuery } = useStore();
  const [selectedTopic, setSelectedTopic] = useState<string>("AI Agents");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  // 1. Column Helper definition for TanStack Table
  const columnHelper = createColumnHelper<TrendingTopic>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("rank", {
        header: () => <span className="text-xs font-bold">Rank</span>,
        cell: (info) => <span className="font-bold text-slate-400">#{info.getValue()}</span>,
      }),
      columnHelper.accessor("keyword", {
        header: () => <span className="text-xs font-bold">Keyword</span>,
        cell: (info) => (
          <button
            onClick={() => setSelectedTopic(info.getValue())}
            className={`font-bold hover:text-blue-400 transition-colors text-left ${
              selectedTopic === info.getValue() ? "text-blue-500 underline decoration-2 underline-offset-4" : "text-white"
            }`}
          >
            {info.getValue()}
          </button>
        ),
      }),
      columnHelper.accessor("category", {
        header: () => <span className="text-xs font-bold">Category</span>,
        cell: (info) => <span className="text-xs font-semibold text-slate-400">{info.getValue()}</span>,
      }),
      columnHelper.accessor("mentions", {
        header: () => <span className="text-xs font-bold">Mentions</span>,
        cell: (info) => <span className="font-semibold text-slate-700 dark:text-slate-200">{info.getValue().toLocaleString()}</span>,
      }),
      columnHelper.accessor("growth", {
        header: () => <span className="text-xs font-bold">Growth</span>,
        cell: (info) => <span className="text-emerald-400 font-medium">+{info.getValue()}%</span>,
      }),
      columnHelper.accessor("sentiment", {
        header: () => <span className="text-xs font-bold">Sentiment</span>,
        cell: (info) => {
          const val = info.getValue();
          const color =
            val === "Positive"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : val === "Neutral"
              ? "bg-slate-850 dark:bg-slate-800 text-foreground dark:text-slate-300 border-border"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20";
          return <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${color}`}>{val}</span>;
        },
      }),
      columnHelper.accessor("virality", {
        header: () => <span className="text-xs font-bold">Virality</span>,
        cell: (info) => {
          const val = info.getValue();
          const color =
            val === "High" ? "bg-red-500" : val === "Medium" ? "bg-amber-500" : "bg-slate-500";
          return (
            <span className="flex items-center space-x-1">
              <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
              <span>{val}</span>
            </span>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: () => <span className="text-xs font-bold">Status</span>,
        cell: (info) => {
          const val = info.getValue();
          const color =
            val === "Spike"
              ? "bg-red-500/10 text-red-400 border-red-500/20"
              : val === "Active"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : "bg-slate-700/20 text-slate-400 border-slate-700/30";
          return <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${color}`}>{val}</span>;
        },
      }),
    ],
    [selectedTopic]
  );

  // Filter topics list
  const filteredData = useMemo(() => {
    return topTrendingTopics.filter((topic) => {
      const matchesSearch = topic.keyword
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery]);

  // 2. TanStack Table Core configuration
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Timeline data mapping based on selected keyword
  const timelineData = useMemo(() => {
    // Return relative curves
    return homeTrendTimeline.map((item) => ({
      date: item.date,
      "Mentions (Index)":
        selectedTopic === "AI Agents"
          ? item["AI Agents"] * 120
          : selectedTopic === "Electric Vehicles (EV)"
          ? item["Electric Vehicles"] * 105
          : selectedTopic === "Green Hydrogen"
          ? item["Hydrogen Fuel"] * 180
          : selectedTopic === "Quantum Computing Labs"
          ? item["Quantum Computing"] * 240
          : selectedTopic === "UPI Global Expansion"
          ? item["UPI Global"] * 160
          : selectedTopic === "SpaceTech Funding"
          ? item["SpaceTech"] * 200
          : item["AI Agents"] * 90,
    }));
  }, [selectedTopic]);

  // Keyword frequencies for bar chart representation
  const frequencyData = useMemo(() => {
    return topTrendingTopics.map((t) => ({
      name: t.keyword,
      Mentions: t.mentions,
    }));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
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
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center space-x-2">
            <Flame className="w-5 h-5 text-red-500 animate-pulse" />
            <span>Trending Analytics</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time viral growth curves and source break-outs for active signals.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Quick Local Search */}
          <div className="relative flex-grow sm:flex-grow-0">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="w-4 h-4 text-slate-500" />
            </span>
            <input
              type="text"
              placeholder="Filter topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 pl-9 pr-3 py-1.5 text-xs bg-slate-900/10 dark:bg-slate-900 border border-border rounded-[10px] text-slate-200 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-[10px] bg-slate-900/10 dark:bg-slate-900 border border-border hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Primary Graphs Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Timeline Chart (7/12 width) */}
        <div className="lg:col-span-7 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[380px]">
          <div>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
              {selectedTopic}
            </span>
            <h3 className="text-sm font-bold text-foreground">Trend Timeline (Volume Over Time)</h3>
          </div>
          <div className="flex-1 w-full h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMentions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
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
                <Area
                  type="monotone"
                  dataKey="Mentions (Index)"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMentions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Keyword Frequency Bar Chart (5/12 width) */}
        <div className="lg:col-span-5 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[380px]">
          <div>
            <h3 className="text-sm font-bold text-foreground">Keyword Frequency Comparison</h3>
            <p className="text-[11px] text-slate-500">Mentions volume comparisons for top active signals.</p>
          </div>
          <div className="flex-1 w-full h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyData.slice(0, 5)} layout="vertical" margin={{ left: 20, right: 10, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={9} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                />
                <Bar dataKey="Mentions" fill="#7C3AED" radius={[0, 6, 6, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Trending Topics TanStack Table */}
      <motion.div variants={itemVariants} className="p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-foreground">Top Active Trends List</h3>
            <p className="text-xs text-slate-500">Select any keyword in the list to inspect its timeline growth curve.</p>
          </div>
          <div className="flex items-center space-x-1 bg-slate-950/10 dark:bg-slate-950/60 border border-border rounded-[10px] px-2.5 py-1 text-xs text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Interactive Table</span>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left text-slate-650 dark:text-slate-300">
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
                    className={`hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition-all font-medium ${
                      selectedTopic === row.original.keyword ? "bg-slate-100 dark:bg-slate-800/10" : ""
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
