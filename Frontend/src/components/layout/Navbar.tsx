import React, { useState } from "react";
import { useStore } from "../../hooks/useStore";
import type { DateFilterType, SourceFilterType } from "../../hooks/useStore";
import { topTrendingTopics } from "../../mockData/dashboardData";
import {
  Search,
  Bell,
  Calendar,
  Filter,
  CheckCircle,
  Menu,
  FileSpreadsheet,
  FileText,
  User,
  LogOut,
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
    user,
    logout,
  } = useStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulated notifications
  const notifications = [
    { id: 1, text: "🔥 AI Agents spike detected (+22%)", time: "5 min ago", unread: true },
    { id: 2, text: "🚨 Anomaly detected: Green Hydrogen News surge", time: "1 hour ago", unread: true },
    { id: 3, text: "🔮 Forecast model V2.4 training completed", time: "2 hours ago", unread: false },
  ];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Trigger Client-Side CSV Download
  const handleDownloadCSV = () => {
    const headers = ["Rank", "Keyword", "Category", "Mentions", "Growth (%)", "Sentiment", "Virality", "Status"];
    const rows = topTrendingTopics.map((topic) => [
      topic.rank,
      topic.keyword,
      topic.category,
      topic.mentions,
      topic.growth,
      topic.sentiment,
      topic.virality,
      topic.status,
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

    triggerToast("📊 CSV Report downloaded successfully!");
  };

  // Trigger Client-Side Text-PDF Report Download
  const handleDownloadPDF = () => {
    const reportTitle = `====================================================\nINDIA TREND RADAR - ANALYTICS EXECUTIVE SUMMARY\nGenerated: ${new Date().toLocaleDateString()} | Filter: ${dateFilter}\n====================================================\n\n`;
    const insightsHeader = `TODAY'S AI INSIGHTS:\n- AI Agents increased by 22%\n- Electric Vehicles entered Top 5\n- Hydrogen Fuel anomaly detected\n- AI Agents expected to dominate next week\n\n`;
    
    let topicsBody = `TOP TRENDING TOPICS:\n`;
    topTrendingTopics.forEach((t) => {
      topicsBody += `${t.rank}. ${t.keyword} [Category: ${t.category}] - Mentions: ${t.mentions}, Growth: +${t.growth}%, Sentiment: ${t.sentiment}, Virality: ${t.virality}\n`;
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

    triggerToast("📄 Executive Text Summary downloaded! (PDF Alternative)");
  };

  return (
    <header className="sticky top-0 z-30 w-full glass border-b border-slate-800 backdrop-blur-md px-6 h-20 flex items-center justify-between">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs px-4 py-3 rounded-[12px] shadow-2xl flex items-center space-x-2 animate-bounce z-50">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left side: Hamburger menu + Title for mobile */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-[10px] bg-slate-800 text-slate-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative hidden md:block w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4.5 h-4.5 text-slate-500" />
          </span>
          <input
            type="text"
            placeholder="Search trends, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-2 text-sm bg-slate-900/10 dark:bg-slate-900 border border-border rounded-[12px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-foreground placeholder-slate-500 transition-all"
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 border border-border px-1.5 py-0.5 rounded-[6px]">⌘K</span>
          </span>
        </div>
      </div>

      {/* Right side Actions */}
      <div className="flex items-center space-x-4">
        {/* Source Filter */}
        <div className="relative flex items-center bg-slate-900/10 dark:bg-slate-900 border border-border rounded-[12px] p-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 mx-2" />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as SourceFilterType)}
            className="bg-transparent text-foreground font-medium py-1 pr-2 border-none outline-none cursor-pointer focus:ring-0"
          >
            <option value="All">All Sources</option>
            <option value="Twitter/X">Twitter/X</option>
            <option value="News/Media">News/Media</option>
            <option value="Reddit">Reddit</option>
            <option value="Google Trends">Google Trends</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="relative flex items-center bg-slate-900/10 dark:bg-slate-900 border border-border rounded-[12px] p-1 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-500 mx-2" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilterType)}
            className="bg-transparent text-foreground font-semibold py-1 pr-2 border-none outline-none cursor-pointer focus:ring-0"
          >
            <option value="Today">Today</option>
            <option value="7D">30 May – 05 Jun 2024</option>
            <option value="30D">Last 30 Days</option>
          </select>
        </div>

        {/* Export Dropdown */}
        {/* CSV Button */}
        <button
          onClick={handleDownloadCSV}
          title="Download CSV report"
          className="flex items-center space-x-1.5 px-3 py-2 bg-card border border-border rounded-[12px] text-xs font-bold text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm transition-all"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
          <span>CSV</span>
        </button>

        {/* PDF Button */}
        <button
          onClick={handleDownloadPDF}
          title="Download Executive text summary"
          className="flex items-center space-x-1.5 px-3 py-2 bg-card border border-border rounded-[12px] text-xs font-bold text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm transition-all"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>PDF</span>
        </button>

        {/* Notifications Panel */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-[12px] bg-slate-900/10 dark:bg-slate-900 border border-border text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60 relative"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-card border border-border rounded-[16px] shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-sm font-semibold text-slate-200">Alerts & Signals</span>
                <span className="text-[10px] text-blue-500 cursor-pointer hover:underline">Mark all read</span>
              </div>
              <div className="mt-3 space-y-3.5">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex flex-col space-y-1 text-xs text-left cursor-pointer group">
                    <span className={`font-medium group-hover:text-blue-400 transition-colors ${notif.unread ? "text-slate-200" : "text-slate-400"}`}>
                      {notif.text}
                    </span>
                    <span className="text-[10px] text-slate-500">{notif.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center focus:outline-none"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-700 hover:border-blue-500 transition-colors"
              />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-slate-950 border border-slate-800 rounded-[16px] shadow-2xl p-2 z-50 text-left">
                <div className="px-3 py-2.5 border-b border-slate-800/80">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
                <div className="p-1 space-y-0.5 mt-1.5">
                  <button className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium rounded-[10px] text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors">
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium rounded-[10px] text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
