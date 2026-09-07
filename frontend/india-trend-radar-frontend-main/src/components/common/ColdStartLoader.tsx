import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Cpu, Radio, ShieldAlert } from "lucide-react";
import { resetBackendReadyState } from "../../services/api";

interface ColdStartLoaderProps {
  error?: string | null;
  onRetry?: () => void;
  title?: string;
  attemptCount?: number;
}

export const ColdStartLoader: React.FC<ColdStartLoaderProps> = ({
  error,
  onRetry,
  title,
  attemptCount = 1,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (error) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [error]);

  const handleRetryClick = () => {
    resetBackendReadyState();
    if (onRetry) {
      onRetry();
    }
  };

  // Progressive connection states matching requirement 6 & 16
  const getProgressiveMessage = (seconds: number) => {
    if (seconds < 10) {
      return {
        heading: "Connecting to Live Analytics...",
        subheading: "Starting the analytics engine...",
        stage: "Establishing server handshake",
      };
    } else if (seconds < 30) {
      return {
        heading: "Waking up analytics engine...",
        subheading: "Render is starting the backend. Your live data will appear automatically. Please keep this page open.",
        stage: "Spinning up Python FastAPI backend",
      };
    } else if (seconds < 60) {
      return {
        heading: "Almost ready — preparing live trend data...",
        subheading: "Compiling trend scores, virality probability, and anomaly signals...",
        stage: "Processing ML prediction models",
      };
    } else {
      return {
        heading: "Finishing backend connection...",
        subheading: "The analytics engine is taking a little longer than usual to wake up. Please stay on this page while we reconnect.",
        stage: "Awaiting backend response",
      };
    }
  };

  const currentMsg = getProgressiveMessage(elapsedSeconds);
  const progressPercent = Math.min(Math.round((elapsedSeconds / 70) * 100), 95);

  // Error state after 120s+ timeout or server failure
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] w-full p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 bg-slate-900/90 border border-rose-500/30 rounded-[24px] shadow-2xl shadow-rose-950/20 backdrop-blur-xl flex flex-col items-center space-y-5"
        >
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400">
            <ShieldAlert className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Backend connection is taking longer than expected.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Please check that the analytics server is online.
            </p>
          </div>

          <div className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-left">
            <p className="text-[11px] font-mono text-rose-300/80 break-words line-clamp-3">
              {error}
            </p>
          </div>

          <button
            onClick={handleRetryClick}
            className="w-full py-3 px-4 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center space-x-2 active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] w-full p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full p-8 bg-slate-900/90 border border-purple-500/20 rounded-[24px] shadow-2xl shadow-purple-950/30 backdrop-blur-xl flex flex-col items-center space-y-6"
      >
        {/* Animated Radar Pulse Container */}
        <div className="relative flex items-center justify-center w-24 h-24">
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-purple-500/20 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5, ease: "easeInOut" }}
            className="absolute inset-2 bg-indigo-500/20 rounded-full"
          />
          <div className="relative z-10 p-4 bg-gradient-to-tr from-slate-950 to-slate-900 border border-purple-500/30 rounded-full shadow-inner shadow-purple-500/20">
            <Radio className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
        </div>

        {/* Status Headings */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white tracking-tight">
            {title || currentMsg.heading}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            {currentMsg.subheading}
          </p>
        </div>

        {/* Progress Bar & Badges */}
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center text-[11px] font-medium text-slate-400 px-1">
            <span className="flex items-center space-x-1.5 text-purple-400">
              <Cpu className="w-3.5 h-3.5 animate-spin" />
              <span>{currentMsg.stage}</span>
            </span>
            <span className="font-mono text-slate-300">{elapsedSeconds}s</span>
          </div>

          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-full"
              initial={{ width: "5%" }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Informational Footer Badges */}
        <div className="flex items-center space-x-3 pt-2 text-[10px] text-slate-400">
          <span className="px-2.5 py-1 bg-slate-950/80 border border-slate-800 rounded-lg flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Server Status: Waking Up</span>
          </span>
          {attemptCount > 1 && (
            <span className="px-2.5 py-1 bg-purple-950/50 border border-purple-800/40 text-purple-300 rounded-lg">
              Ping Attempt #{attemptCount}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
};
