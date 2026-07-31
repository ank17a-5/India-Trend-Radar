import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Zap, Calendar, Download, ChevronRight, Activity, Cpu } from "lucide-react";
import { IndiaMap } from "../components/common/IndiaMap";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="p-6 bg-slate-900/60 dark:bg-slate-900/60 border border-slate-800 dark:border-slate-800 rounded-[18px] shadow-lg backdrop-blur-md relative overflow-hidden group transition-all"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="w-12 h-12 flex items-center justify-center rounded-[12px] bg-blue-500/10 text-blue-500 mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleDemoClick = () => {
    // Navigate straight to dashboard for previewing
    navigate("/dashboard/home");
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 relative overflow-hidden font-sans flex flex-col justify-between">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full filter blur-[150px] pointer-events-none animate-pulse-slow" />

      {/* Floating particles background simulation */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-12 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
        <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-purple-400 rounded-full" />
        <div className="absolute top-2/3 left-1/10 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse" />
        <div className="absolute top-1/4 right-1/5 w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
        <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-emerald-400 rounded-full" />
      </div>

      {/* Glass Navbar */}
      <header className="sticky top-0 z-50 w-full glass border-b border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-slate-200 to-blue-400">
              India Trend Radar
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#demo" className="hover:text-blue-400 transition-colors">Interactive Demo</a>
            <Link to="/login" className="hover:text-blue-400 transition-colors">Developer Portal</Link>
          </nav>

          <div>
            <Link
              to="/login"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-sm font-semibold rounded-[12px] shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all text-white flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Side: Hero content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 flex flex-col space-y-6 text-left"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 w-fit">
              <Cpu className="w-3.5 h-3.5" />
              <span>Next-Gen Predictive AI Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
              INDIA TREND <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                RADAR
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 font-normal leading-relaxed max-w-xl">
              Real-time analytics and predictive modeling engine tracking virality, predicting public sentiments, and forecasting tomorrow's Indian market trends.
            </p>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <Link
                to="/login"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-[14px] text-base font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all text-center flex items-center justify-center space-x-2"
              >
                <span>Get Started Now</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
              <button
                onClick={handleDemoClick}
                className="px-8 py-4 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 rounded-[14px] text-base font-semibold transition-all text-center flex items-center justify-center space-x-2"
              >
                <span>View Dashboard Demo</span>
              </button>
            </div>
          </motion.div>

          {/* Right Side: India map */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative w-full flex justify-center"
          >
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-500/10 rounded-full filter blur-2xl" />
            <IndiaMap />
          </motion.div>
        </div>

        {/* Feature Cards Section */}
        <section id="features" className="py-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Platform Features
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              Comprehensive analytics suite built for enterprise intelligence, virality assessment, and forecasting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Predict Trends"
              description="Harness deep neural networks to project upcoming topics up to 30 days in advance."
            />
            <FeatureCard
              icon={<AlertTriangle className="w-6 h-6" />}
              title="Detect Anomalies"
              description="Identify instant spikes, sentiment reversals, and structural shifts in data streams."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Analyze Virality"
              description="Evaluate cross-platform growth dynamics to measure social contagion and impact."
            />
            <FeatureCard
              icon={<Calendar className="w-6 h-6" />}
              title="Forecast 30 Days"
              description="Model time-series forecast vectors with statistical confidence interval bounds."
            />
            <FeatureCard
              icon={<Download className="w-6 h-6" />}
              title="Download Reports"
              description="Generate premium PDF/CSV dashboards and insights lists in one click."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#070b14] border-t border-slate-900/80 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
          {/* Left Brand Details */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Activity className="w-4 h-4 animate-pulse" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                India Trend Radar
              </span>
            </div>
            <span className="hidden md:inline text-slate-800">|</span>
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} India Trend Radar. All rights reserved.
            </p>
          </div>

          {/* Right Feature Quick Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs font-semibold text-slate-400">
            <a href="#" className="hover:text-blue-400 transition-colors">Predictive Engine</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Anomaly Engine</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Virality Scores</a>
            <a href="#" className="hover:text-blue-400 transition-colors">30-Day Forecasts</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Report Portal</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
