import React from "react";
import { motion } from "framer-motion";
import {
  modelKPIs,
  modelComparisonData,
  rocCurveData,
  modelMetricTrends,
} from "../mockData/dashboardData";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Cpu,
  Brain,
  Activity,
  Binary,
  Layers,
} from "lucide-react";

export const ModelEvaluation: React.FC = () => {
  const getMatrixColor = (val: number) => {
    if (val < 10) return "bg-card border border-border text-slate-500";
    if (val < 20) return "bg-purple-950/20 border border-purple-900/30 text-purple-400";
    return "bg-purple-600/25 border border-purple-500/50 text-purple-300 font-bold shadow-lg shadow-purple-500/5";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center space-x-2">
            <Cpu className="w-5.5 h-5.5 text-purple-500" />
            <span>AI Model Evaluation</span>
          </h2>
          <p className="text-xs text-slate-500">
            Performance metrics, confusion matrix grids, ROC thresholds, and historical model comparisons.
          </p>
        </div>
      </div>

      {/* 6 KPI Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Accuracy */}
        <div className="p-4 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-28 relative overflow-hidden group">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</span>
          <h3 className="text-2xl font-extrabold text-blue-400 mt-2">{modelKPIs.accuracy}</h3>
          <span className="text-[9px] text-slate-500">Correct classifications</span>
        </div>

        {/* Precision */}
        <div className="p-4 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-28 relative overflow-hidden group">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Precision</span>
          <h3 className="text-2xl font-extrabold text-purple-400 mt-2">{modelKPIs.precision}</h3>
          <span className="text-[9px] text-slate-500">Positive predictive value</span>
        </div>

        {/* Recall */}
        <div className="p-4 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-28 relative overflow-hidden group">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recall</span>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-2">{modelKPIs.recall}</h3>
          <span className="text-[9px] text-slate-500">Sensitivity rate</span>
        </div>

        {/* F1 Score */}
        <div className="p-4 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-28 relative overflow-hidden group">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">F1 Score</span>
          <h3 className="text-2xl font-extrabold text-amber-400 mt-2">{modelKPIs.f1}</h3>
          <span className="text-[9px] text-slate-500">Harmonic mean score</span>
        </div>

        {/* MAE */}
        <div className="p-4 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-28 relative overflow-hidden group">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MAE</span>
          <h3 className="text-2xl font-extrabold text-slate-200 mt-2">{modelKPIs.mae}</h3>
          <span className="text-[9px] text-slate-500">Mean absolute error</span>
        </div>

        {/* RMSE */}
        <div className="p-4 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-28 relative overflow-hidden group">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RMSE</span>
          <h3 className="text-2xl font-extrabold text-slate-200 mt-2">{modelKPIs.rmse}</h3>
          <span className="text-[9px] text-slate-500">Root mean squared error</span>
        </div>
      </motion.div>

      {/* Row 1: Comparison Bar Chart & Training Metric Trend */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Model versions comparison */}
        <div className="lg:col-span-6 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[380px]">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Model Run Version Comparison</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Performance indicators across productionized model lineages.
            </p>
          </div>

          <div className="flex-1 w-full h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelComparisonData} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} vertical={false} />
                <XAxis dataKey="version" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="accuracy" fill="#2563EB" name="Accuracy" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="f1" fill="#7C3AED" name="F1 Score" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Training epochs trend */}
        <div className="lg:col-span-6 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[380px]">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Training Metric Convergence</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Accuracy growth relative to cross-entropy loss reduction across training runs.
            </p>
          </div>

          <div className="flex-1 w-full h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={modelMetricTrends} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis dataKey="epoch" stroke="hsl(var(--muted-foreground))" name="Epochs" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="Accuracy" stroke="#10B981" strokeWidth={2.5} name="Val Accuracy (%)" dot={false} />
                <Line type="monotone" dataKey="Loss" stroke="#EF4444" strokeWidth={2} name="Cross-Entropy Loss" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Row 2: Confusion Matrix & ROC Curve */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Confusion Matrix (5/12 width) */}
        <div className="lg:col-span-5 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[380px]">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
              <Binary className="w-4 h-4 text-purple-400" />
              <span>Confusion Matrix (Topic Sentiment classification)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Actual vs Predicted classification values.
            </p>
          </div>

          {/* 3x3 Grid rendering */}
          <div className="flex-1 flex flex-col items-center justify-center mt-4">
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold w-full max-w-[280px]">
              {/* Row Header corner */}
              <div className="text-slate-600 text-left self-center text-[10px]">Pred &rarr;<br />Act &darr;</div>
              <div className="text-slate-400">Pos</div>
              <div className="text-slate-400">Neu</div>
              <div className="text-slate-400">Neg</div>

              {/* Matrix cell grids */}
              <div className="text-slate-400 text-left flex items-center">Pos</div>
              <div className={`py-3.5 rounded-[8px] flex items-center justify-center ${getMatrixColor(242)}`}>242</div>
              <div className={`py-3.5 rounded-[8px] flex items-center justify-center ${getMatrixColor(12)}`}>12</div>
              <div className={`py-3.5 rounded-[8px] flex items-center justify-center ${getMatrixColor(6)}`}>6</div>

              <div className="text-slate-400 text-left flex items-center">Neu</div>
              <div className={`py-3.5 rounded-[8px] flex items-center justify-center ${getMatrixColor(15)}`}>15</div>
              <div className={`py-3.5 rounded-[8px] flex items-center justify-center ${getMatrixColor(198)}`}>198</div>
              <div className={`py-3.5 rounded-[8px] flex items-center justify-center ${getMatrixColor(11)}`}>11</div>

              <div className="text-slate-400 text-left flex items-center">Neg</div>
              <div className={`py-3.5 rounded-[8px] flex items-center justify-center ${getMatrixColor(5)}`}>5</div>
              <div className={`py-3.5 rounded-[8px] flex items-center justify-center ${getMatrixColor(9)}`}>9</div>
              <div className={`py-3.5 rounded-[8px] flex items-center justify-center ${getMatrixColor(156)}`}>156</div>
            </div>
          </div>
        </div>

        {/* ROC Curve Area (7/12 width) */}
        <div className="lg:col-span-7 p-6 bg-card border border-border rounded-[18px] backdrop-blur-md flex flex-col justify-between h-[380px]">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>ROC Classifier Vector (AUC Threshold)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              True Positive Rate vs False Positive Rate indicating high discriminative classifier strength.
            </p>
          </div>

          <div className="flex-1 w-full h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocCurveData} margin={{ left: -20, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis dataKey="fpr" type="number" domain={[0, 1]} stroke="hsl(var(--muted-foreground))" fontSize={11} name="FPR" tickLine={false} />
                <YAxis dataKey="tpr" type="number" domain={[0, 1]} stroke="hsl(var(--muted-foreground))" fontSize={11} name="TPR" tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#F8FAFC",
                  }}
                />
                {/* Diagonal random chance line */}
                <Line type="linear" dataKey="fpr" stroke="#475569" strokeWidth={1} strokeDasharray="5 5" name="Random Classifier" dot={false} activeDot={false} />
                
                {/* ROC curve */}
                <Line type="monotone" dataKey="tpr" stroke="#3B82F6" strokeWidth={2.5} name="ROC Curve (AUC = 0.94)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
