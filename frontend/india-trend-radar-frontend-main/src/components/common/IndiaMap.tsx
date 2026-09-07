import React from "react";
import { motion } from "framer-motion";

interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  pulseDelay: number;
  size: number;
}

interface Connection {
  from: string;
  to: string;
  duration: number;
}

export const IndiaMap: React.FC = () => {
  // SVG coordinates representing a schematic outline of India
  const nodes: Node[] = [
    { id: "srinagar", name: "Srinagar", x: 180, y: 50, pulseDelay: 0.2, size: 6 },
    { id: "delhi", name: "New Delhi", x: 190, y: 130, pulseDelay: 0, size: 10 },
    { id: "jaipur", name: "Jaipur", x: 150, y: 160, pulseDelay: 0.5, size: 7 },
    { id: "lucknow", name: "Lucknow", x: 230, y: 160, pulseDelay: 0.8, size: 7 },
    { id: "guwahati", name: "Guwahati", x: 380, y: 170, pulseDelay: 1.2, size: 7 },
    { id: "ahmedabad", name: "Ahmedabad", x: 100, y: 220, pulseDelay: 0.4, size: 8 },
    { id: "mumbai", name: "Mumbai", x: 110, y: 310, pulseDelay: 0.1, size: 10 },
    { id: "bhopal", name: "Bhopal", x: 190, y: 220, pulseDelay: 0.6, size: 7 },
    { id: "nagpur", name: "Nagpur", x: 210, y: 250, pulseDelay: 0.9, size: 7 },
    { id: "kolkata", name: "Kolkata", x: 310, y: 220, pulseDelay: 0.3, size: 9 },
    { id: "hyderabad", name: "Hyderabad", x: 200, y: 320, pulseDelay: 0.7, size: 8 },
    { id: "bengaluru", name: "Bengaluru", x: 180, y: 390, pulseDelay: 0.2, size: 9 },
    { id: "chennai", name: "Chennai", x: 210, y: 400, pulseDelay: 0.5, size: 9 },
    { id: "kochi", name: "Kochi", x: 170, y: 440, pulseDelay: 1.0, size: 6 },
    { id: "patna", name: "Patna", x: 270, y: 170, pulseDelay: 1.1, size: 7 },
    { id: "bhubaneswar", name: "Bhubaneswar", x: 270, y: 260, pulseDelay: 1.3, size: 7 },
  ];

  const connections: Connection[] = [
    { from: "srinagar", to: "delhi", duration: 1.5 },
    { from: "delhi", to: "jaipur", duration: 1.2 },
    { from: "delhi", to: "lucknow", duration: 1.3 },
    { from: "jaipur", to: "ahmedabad", duration: 1.4 },
    { from: "ahmedabad", to: "mumbai", duration: 1.5 },
    { from: "lucknow", to: "patna", duration: 1.2 },
    { from: "patna", to: "kolkata", duration: 1.4 },
    { from: "kolkata", to: "guwahati", duration: 1.8 },
    { from: "mumbai", to: "bengaluru", duration: 1.6 },
    { from: "bengaluru", to: "kochi", duration: 1.2 },
    { from: "bengaluru", to: "chennai", duration: 1.1 },
    { from: "chennai", to: "hyderabad", duration: 1.3 },
    { from: "mumbai", to: "hyderabad", duration: 1.4 },
    { from: "delhi", to: "bhopal", duration: 1.5 },
    { from: "bhopal", to: "nagpur", duration: 1.2 },
    { from: "nagpur", to: "hyderabad", duration: 1.3 },
    { from: "patna", to: "bhubaneswar", duration: 1.6 },
    { from: "kolkata", to: "bhubaneswar", duration: 1.3 },
    { from: "bhubaneswar", to: "hyderabad", duration: 1.5 },
  ];

  // Helper to find node coordinates
  const getNodeCoords = (id: string) => {
    const node = nodes.find((n) => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <div className="relative w-full max-w-[500px] aspect-[4/5] mx-auto flex items-center justify-center">
      {/* Glow Backdrops */}
      <div className="absolute inset-0 bg-blue-500/5 rounded-full filter blur-[80px] pointer-events-none" />
      <div className="absolute inset-10 bg-purple-500/5 rounded-full filter blur-[100px] pointer-events-none animate-pulse-slow" />

      {/* SVG Network Map */}
      <svg
        viewBox="0 0 450 500"
        className="w-full h-full text-blue-500"
        style={{ filter: "drop-shadow(0 0 20px rgba(37, 99, 237, 0.15))" }}
      >
        {/* Connection Paths (glowing lines) */}
        {connections.map((conn, idx) => {
          const start = getNodeCoords(conn.from);
          const end = getNodeCoords(conn.to);

          return (
            <g key={`conn-${idx}`}>
              {/* Background structural line */}
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                className="stroke-slate-800 dark:stroke-slate-800"
                strokeWidth="1.5"
              />
              {/* Glowing active path line */}
              <motion.line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                className="stroke-blue-500/30 dark:stroke-blue-500/40"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: [0, 1, 0] }}
                transition={{
                  duration: conn.duration * 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 2,
                }}
              />
              {/* Pulse particle traveling along connection */}
              <motion.circle
                r="2"
                fill="#7C3AED"
                initial={{ cx: start.x, cy: start.y }}
                animate={{ cx: [start.x, end.x], cy: [start.y, end.y] }}
                transition={{
                  duration: conn.duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 3,
                }}
                className="filter drop-shadow-[0_0_8px_#7C3AED]"
              />
            </g>
          );
        })}

        {/* Outer schematic boundary points to sketch India's shape */}
        {/* Drawing a subtle boundary link to hint the silhouette of India */}
        <path
          d="M 180 50 L 190 130 L 230 160 L 270 170 L 380 170 L 310 220 L 270 260 L 210 400 L 170 440 L 180 390 L 110 310 L 100 220 L 150 160 Z"
          fill="none"
          className="stroke-blue-500/5 dark:stroke-blue-500/10"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Nodes (cities) */}
        {nodes.map((node) => (
          <g key={node.id}>
            {/* Outer animated halo */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.size * 1.8}
              className="fill-blue-500/5 stroke-blue-500/20"
              strokeWidth="1"
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: node.pulseDelay,
                ease: "easeInOut",
              }}
            />
            {/* Core Node */}
            <circle
              cx={node.x}
              cy={node.y}
              r={node.size / 2}
              className="fill-blue-500 dark:fill-blue-400 filter drop-shadow-[0_0_6px_#2563EB]"
            />
            {/* Label (only major nodes visible or small text) */}
            <text
              x={node.x + 8}
              y={node.y + 4}
              className="fill-slate-400 text-[9px] font-medium tracking-wide font-sans select-none hidden md:block"
            >
              {node.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
