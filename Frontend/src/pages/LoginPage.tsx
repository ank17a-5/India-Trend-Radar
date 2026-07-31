import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "../hooks/useStore";
import { Activity, ShieldCheck, HelpCircle } from "lucide-react";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const loginWithGoogle = useStore((state) => state.loginWithGoogle);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate("/dashboard/home");
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center relative overflow-hidden font-sans px-4">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-blue-500/10 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-purple-500/10 rounded-full filter blur-[100px] pointer-events-none animate-pulse-slow" />

      {/* Floating dot particles */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-10 left-10 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
        <div className="absolute top-20 right-20 w-2 h-2 bg-purple-400 rounded-full" />
        <div className="absolute bottom-20 left-1/4 w-1 h-1 bg-blue-300 rounded-full" />
        <div className="absolute bottom-10 right-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-ping" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-[18px] p-8 shadow-2xl backdrop-blur-lg relative overflow-hidden group"
      >
        {/* Subtle top edge glow line */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500 to-purple-500" />

        {/* Content Wrapper */}
        <div className="flex flex-col items-center text-center space-y-8">
          
          {/* Logo & Platform Info */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/10 group-hover:shadow-blue-500/20 transition-all">
              <Activity className="w-7 h-7 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                India Trend Radar
              </h2>
              <p className="text-sm text-slate-400">
                AI Powered Trend Prediction Platform
              </p>
            </div>
          </div>

          <div className="w-full border-t border-slate-800/80" />

          {/* Login Actions */}
          <div className="w-full space-y-4">
            <h3 className="text-base font-semibold text-slate-200">
              Welcome back
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Access the analytics engine and view real-time data visualisations for forecast indicators.
            </p>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 disabled:bg-slate-200 text-slate-900 font-semibold rounded-[12px] transition-all flex items-center justify-center space-x-3 shadow-lg shadow-white/5 active:scale-[0.99] disabled:pointer-events-none"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {/* Google SVG Logo */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.137 4.2-3.41 0-6.173-2.784-6.173-6.222 0-3.437 2.763-6.222 6.173-6.222 1.5 0 2.87.545 3.93 1.455l3.054-3.055C18.99 2.65 15.825 1.5 12.24 1.5 6.435 1.5 1.74 6.205 1.74 12s4.695 10.5 10.5 10.5c5.783 0 10.155-4.06 10.155-10.222 0-.693-.06-1.353-.172-1.993H12.24z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Simulated Firebase Auth Notice */}
            <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-500 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Firebase Google Sign-In Interface (Mocked)</span>
            </div>
          </div>

          <div className="w-full border-t border-slate-800/80" />

          {/* Back links */}
          <div className="flex items-center justify-between w-full text-xs text-slate-500 px-1">
            <button
              onClick={() => navigate("/")}
              className="hover:text-blue-400 transition-colors"
            >
              &larr; Back to Landing Page
            </button>
            <div className="flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <a href="#" className="hover:text-blue-400 transition-colors">
                Need Help?
              </a>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
