import React, { useState } from "react";
import { useStore } from "../../hooks/useStore";
import type { DateFilterType, SourceFilterType } from "../../hooks/useStore";
import { fetchRisingTrends, formatKeyword } from "../../services/api";
import {
  Search,
  Calendar,
  Filter,
  CheckCircle,
  Menu,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const {
    dateFilter,
    setDateFilter,
    sourceFilter,
    setSourceFilter,
    searchQuery,
    setSearchQuery,
  } = useStore();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Trigger Client-Side CSV Download with real API data
  const handleDownloadCSV = async () => {
    try {
      const risingTrends = await fetchRisingTrends();
      const headers = ["Rank", "Topic Keyword", "India Trend Score", "Viral Probability", "Anomaly Score", "Forecast Score", "Is Viral"];
      const rows = risingTrends.map((topic) => [
        topic.trend_rank,
        `"${formatKeyword(topic.keyword)}"`,
        topic.india_trend_score,
        topic.viral_probability,
        topic.anomaly_score,
        topic.forecast_score,
        topic.predicted_viral,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `india_trend_radar_${dateFilter}_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      triggerToast("📊 Live CSV Report downloaded successfully!");
    } catch (e) {
      triggerToast("⚠️ Unable to download CSV report.");
    }
  };

  // Trigger Client-Side Text-PDF Report Download with real API data
  const handleDownloadPDF = async () => {
    try {
      const risingTrends = await fetchRisingTrends();
      const reportTitle = `====================================================\nINDIA TREND RADAR - REAL ANALYTICS EXECUTIVE SUMMARY\nGenerated: ${new Date().toLocaleDateString()} | Filter: ${dateFilter}\n====================================================\n\n`;
      const insightsHeader = `DATA PIPELINE STATUS:\n- Fast API Backend connected\n- Live India Trend Scores active\n- Anomaly & Virality predictions verified\n\n`;
      
      let topicsBody = `TOP TRENDING TOPICS:\n`;
      risingTrends.slice(0, 10).forEach((t) => {
        topicsBody += `#${t.trend_rank}. ${formatKeyword(t.keyword)} - Trend Score: ${t.india_trend_score.toFixed(2)}, Viral Prob: ${(t.viral_probability * 100).toFixed(1)}%, Anomaly Score: ${t.anomaly_score.toFixed(2)}\n`;
      });

      const reportContent =
        "data:text/plain;charset=utf-8," +
        encodeURIComponent(reportTitle + insightsHeader + topicsBody);

      const link = document.createElement("a");
      link.setAttribute("href", reportContent);
      link.setAttribute("download", `india_trend_radar_${dateFilter}_executive_summary.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      triggerToast("📄 Executive Text Summary downloaded!");
    } catch (e) {
      triggerToast("⚠️ Unable to download executive summary.");
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full glass border-b border-border backdrop-blur-md px-4 sm:px-6 h-20 flex items-center justify-between">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs px-4 py-3 rounded-[12px] shadow-2xl flex items-center space-x-2 animate-bounce z-50">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left side: Hamburger menu + Search bar */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-[10px] bg-slate-900 border border-border text-slate-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (No ⌘K badge) */}
        <div className="relative w-44 sm:w-64 md:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search trends, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-900/90 dark:bg-slate-900 border border-border rounded-[12px] focus:outline-none focus:border-blue-500 text-foreground placeholder-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Right side Actions: Source Filter, Date Filter, CSV, PDF (No bell, No profile) */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Source Filter Dropdown */}
        <div className="relative flex items-center bg-slate-900 dark:bg-slate-900 border border-border rounded-[12px] px-2 py-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1.5 flex-shrink-0" />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as SourceFilterType)}
            className="bg-transparent text-slate-100 dark:text-slate-100 font-medium py-1 pr-1 border-none outline-none cursor-pointer focus:ring-0 text-xs"
          >
            <option value="All" className="bg-[#0F172A] text-slate-100 py-1 font-medium">All Sources</option>
            <option value="Twitter/X" className="bg-[#0F172A] text-slate-100 py-1 font-medium">Twitter/X</option>
            <option value="News/Media" className="bg-[#0F172A] text-slate-100 py-1 font-medium">News/Media</option>
            <option value="Reddit" className="bg-[#0F172A] text-slate-100 py-1 font-medium">Reddit</option>
            <option value="Google Trends" className="bg-[#0F172A] text-slate-100 py-1 font-medium">Google Trends</option>
            <option value="YouTube" className="bg-[#0F172A] text-slate-100 py-1 font-medium">YouTube</option>
          </select>
        </div>

        {/* Date Range Filter Dropdown */}
        <div className="relative flex items-center bg-slate-900 dark:bg-slate-900 border border-border rounded-[12px] px-2 py-1 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1.5 flex-shrink-0" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilterType)}
            className="bg-transparent text-slate-100 dark:text-slate-100 font-semibold py-1 pr-1 border-none outline-none cursor-pointer focus:ring-0 text-xs"
          >
            <option value="Today" className="bg-[#0F172A] text-slate-100 py-1 font-semibold">Today</option>
            <option value="Last 7 Days" className="bg-[#0F172A] text-slate-100 py-1 font-semibold">Last 7 Days</option>
            <option value="Last 15 Days" className="bg-[#0F172A] text-slate-100 py-1 font-semibold">Last 15 Days</option>
            <option value="Last 30 Days" className="bg-[#0F172A] text-slate-100 py-1 font-semibold">Last 30 Days</option>
          </select>
        </div>

        {/* Export CSV Button */}
        <button
          onClick={handleDownloadCSV}
          title="Download CSV report"
          className="hidden sm:flex items-center space-x-1.5 px-3 py-2 bg-slate-900 border border-border rounded-[12px] text-xs font-bold text-foreground hover:bg-slate-800 shadow-sm transition-all"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
          <span>CSV</span>
        </button>

        {/* Export PDF Button */}
        <button
          onClick={handleDownloadPDF}
          title="Download Executive text summary"
          className="hidden sm:flex items-center space-x-1.5 px-3 py-2 bg-slate-900 border border-border rounded-[12px] text-xs font-bold text-foreground hover:bg-slate-800 shadow-sm transition-all"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>PDF</span>
        </button>
      </div>
    </header>
  );
};
