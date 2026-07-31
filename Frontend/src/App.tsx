import React, { useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "./hooks/useStore";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Home } from "./pages/Home";
import { TrendingNow } from "./pages/TrendingNow";
import { Forecast } from "./pages/Forecast";
import { IndiaTrendScore } from "./pages/IndiaTrendScore";
import { AnomalyDetection } from "./pages/AnomalyDetection";
import { ModelEvaluation } from "./pages/ModelEvaluation";

import "./App.css";

const App: React.FC = () => {
  const { setTheme } = useStore();

  // Initialize theme on mount
  useEffect(() => {
    // Force dark mode as default matching styling instructions
    setTheme("dark");
  }, [setTheme]);

  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="trending" element={<TrendingNow />} />
          <Route path="forecast" element={<Forecast />} />
          <Route path="trend-score" element={<IndiaTrendScore />} />
          <Route path="anomalies" element={<AnomalyDetection />} />
          <Route path="model-evaluation" element={<ModelEvaluation />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
