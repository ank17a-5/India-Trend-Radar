import React, { useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "./hooks/useStore";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Home } from "./pages/Home";
import { TrendingNow } from "./pages/TrendingNow";
import { Forecast } from "./pages/Forecast";
import { IndiaTrendScore } from "./pages/IndiaTrendScore";
import { AnomalyDetection } from "./pages/AnomalyDetection";
import { ModelEvaluation } from "./pages/ModelEvaluation";

import "./App.css";

import { LandingPage } from "./pages/LandingPage";

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
        {/* Landing Page as the first page */}
        <Route path="/" element={<LandingPage />} />

        {/* Direct redirect from /login to Dashboard Home */}
        <Route path="/login" element={<Navigate to="/dashboard/home" replace />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="trending" element={<TrendingNow />} />
          <Route path="forecast" element={<Forecast />} />
          <Route path="trend-score" element={<IndiaTrendScore />} />
          <Route path="anomalies" element={<AnomalyDetection />} />
          <Route path="model-evaluation" element={<ModelEvaluation />} />
        </Route>

        {/* Catch-all redirect to Landing Page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
