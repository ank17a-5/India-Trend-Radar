import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Cpu, Radio, AlertCircle } from "lucide-react";
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

  const getProgressiveMessage = (seconds: number) => {
    if (seconds < 10) {
      return {
        heading: "Connecting to live analytics...",
        subheading: "Starting analytics engine...",
        stage: "Connecting to backend",
      };
    } else if (seconds < 35) {
      return {
        heading: "Waking up analytics engine...",
        subheading: "Render is starting the backend. Your live data will appear automatically.",
        stage: "Waking up backend service",
      };
    } else if (seconds < 70) {
      return {
        heading: "Compiling live trend analytics...",
        subheading: "Processing prediction models and trend signals...",
        stage: "Processing live trend pipelines",
      };
    } else {
      return {
        heading: "Finalizing backend response...",
        subheading: "Analytics engine is finishing startup. Data will load automatically.",
        stage: "Finalizing response",
      };
    }
  };

  const currentMsg = getProgressiveMessage(elapsedSeconds);
  const progressPercent = Math.min(Math.round((elapsedSeconds / 75) * 100), 96);

  // Non-blocking error banner state (keeps dashboard visible)
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[220px] w-full p-6 text-center bg-card/60 border border-amber-500/20 rounded-[18px] backdrop-blur-md">
        <div className="flex items-center space-x-2 text-amber-400 mb-2">
          <AlertCircle className="w-5 h-5 animate-pulse" />
          <h4 className="text-sm font-bold">Live data temporarily unavailable</h4>
        </div>
        <p className="text-xs text-muted-foreground max-w-md mb-4">
          The analytics backend is taking longer than usual to respond. Retrying automatically in background.
        </p>
        <button
          onClick={handleRetryClick}
          className="px-3.5 py-1.5 text-xs font-semibold text-purple-300 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/40 rounded-lg transition-colors flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Now</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[240px] w-full p-6 text-center bg-card/40 border border-border/40 rounded-[18px] backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full flex flex-col items-center space-y-4"
      >
        {/* Animated Radar Pulse Icon */}
        <div className="relative flex items-center justify-center w-16 h-16">
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-purple-500/20 rounded-full"
          />
          <div className="relative z-10 p-3 bg-slate-900 border border-purple-500/30 rounded-full shadow-lg shadow-purple-500/10">
            <Radio className="w-6 h-6 text-purple-400 animate-pulse" />
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground">
            {title || currentMsg.heading}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {currentMsg.subheading}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-2 max-w-xs">
          <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
            <span className="flex items-center space-x-1 text-purple-400">
              <Cpu className="w-3 h-3 animate-spin" />
              <span>{currentMsg.stage}</span>
            </span>
            <span>{elapsedSeconds}s</span>
          </div>

          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800/60">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-full"
              initial={{ width: "5%" }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center space-x-2 pt-1 text-[10px] text-muted-foreground">
          <span className="px-2 py-0.5 bg-slate-950/80 border border-slate-800 rounded-md flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Connecting...</span>
          </span>
          {attemptCount > 1 && (
            <span className="px-2 py-0.5 bg-purple-950/40 border border-purple-800/30 text-purple-300 rounded-md">
              Ping #{attemptCount}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
};
