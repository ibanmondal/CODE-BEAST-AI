"use client";

import React, { useEffect, useState } from "react";

interface ScoreRadial3DProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function ScoreRadial3D({
  score,
  size = 180,
  strokeWidth = 12,
  label = "OVERALL SCORE",
  sublabel = "ConsJudge Consensus",
  className = ""
}: ScoreRadial3DProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * easeProgress));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      
      {/* SVG Radial Gauge */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 score-radial"
        >
          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(137, 207, 240, 0.18)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Foreground Animated Score Arc (Baby Blue) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#89CFF0"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>

        {/* Center Metric Display - Crystal Clear & Highly Visible */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl sm:text-5xl font-bold text-white font-mono tracking-tight drop-shadow-[0_0_20px_rgba(137,207,240,0.4)]">
            {animatedScore}
          </span>
          <span className="text-xs font-mono font-bold text-[#89CFF0] uppercase tracking-wider mt-1">
            / 100
          </span>
        </div>
      </div>

      {/* Under-Gauge Labels */}
      <div className="mt-2 text-center">
        <span className="text-[11px] font-mono font-bold tracking-wider text-[#89CFF0] uppercase block">
          {label}
        </span>
        <span className="text-xs text-[#BAE6FD]/80 block mt-0.5">
          {sublabel}
        </span>
      </div>

    </div>
  );
}
