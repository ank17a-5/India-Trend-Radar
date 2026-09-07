import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export const DashboardLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-sidebar animate-slide-in">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Right Core container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Dynamic Outlet Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background relative">
          {/* Subtle Grid Overlay for Premium Aesthetic */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
          
          {/* Ambient Glow Bubbles */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-600/10 rounded-full filter blur-[120px] pointer-events-none z-0 animate-pulse-slow" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-600/5 rounded-full filter blur-[100px] pointer-events-none z-0" />
          
          <div className="relative max-w-7xl mx-auto space-y-6 pb-12 z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
