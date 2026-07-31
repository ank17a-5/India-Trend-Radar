import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useStore } from "../../hooks/useStore";
import {
  Home,
  TrendingUp,
  LineChart,
  Star,
  AlertTriangle,
  BarChart3,
  LogOut,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const {
    sidebarOpen,
    toggleSidebar,
    theme,
    toggleTheme,
    logout,
    user,
  } = useStore();

  const navItems = [
    { name: "Home", path: "/dashboard/home", icon: Home },
    { name: "Trending Now", path: "/dashboard/trending", icon: TrendingUp },
    { name: "Forecast", path: "/dashboard/forecast", icon: LineChart },
    { name: "India Trend Score", path: "/dashboard/trend-score", icon: Star },
    { name: "Anomaly Detection", path: "/dashboard/anomalies", icon: AlertTriangle },
    { name: "Model Evaluation", path: "/dashboard/model-evaluation", icon: BarChart3 },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`h-screen bg-sidebar border-r border-border transition-all duration-300 flex flex-col justify-between z-40 fixed md:static ${
        sidebarOpen ? "w-[280px]" : "w-[80px]"
      }`}
    >
      {/* Top Section: Logo & Platform title */}
      <div>
        <div className="h-20 flex items-center px-5 border-b border-border justify-between relative">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="min-w-10 w-10 min-h-10 h-10 rounded-[12px] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            {sidebarOpen && (
              <span className="text-base font-bold tracking-tight text-foreground whitespace-nowrap">
                India Trend Radar
              </span>
            )}
          </div>

          {/* Toggle Button for Desktop */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex absolute -right-3 top-8 w-6 h-6 rounded-full bg-card border border-border items-center justify-center text-slate-400 hover:text-foreground"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3.5 px-4 py-3 rounded-[12px] text-sm font-medium transition-all group relative ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/30"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span>{item.name}</span>}
                {!sidebarOpen && (
                  <div className="absolute left-[70px] bg-slate-950 text-white text-xs px-2.5 py-1.5 rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border shadow-xl">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Profile, Theme, Settings, LogOut */}
      <div className="p-3 border-t border-border space-y-1">
        {/* Theme toggle option inside sidebar if collapsed */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-[12px] text-sm font-medium text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-all group relative"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-400" />
          )}
          {sidebarOpen && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          {!sidebarOpen && (
            <div className="absolute left-[70px] bg-slate-950 text-white text-xs px-2.5 py-1.5 rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-border shadow-xl">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </div>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-[12px] text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all group relative"
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span>Logout</span>}
          {!sidebarOpen && (
            <div className="absolute left-[70px] bg-slate-950 text-white text-xs px-2.5 py-1.5 rounded-[6px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-slate-850 shadow-xl">
              Logout
            </div>
          )}
        </button>

        {/* Collapsed Profile display */}
        {sidebarOpen && user && (
          <div className="mt-4 pt-3 flex items-center space-x-3 px-3 border-t border-border/40">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover border border-border"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {user.email}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
