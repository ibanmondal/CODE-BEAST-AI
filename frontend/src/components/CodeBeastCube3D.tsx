"use client";

import React, { useRef, useState } from "react";

export function CodeBeastCube3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMouseOffset({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="cb-rich-cube-wrapper relative flex items-center justify-center select-none pointer-events-auto"
    >
      {/* Soft Luminous Ambient Orange Glow Aura */}
      <div className="absolute w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] rounded-full bg-[#FF7728]/22 blur-[80px] pointer-events-none animate-pulse-copper" />
      <div className="absolute w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-full bg-[#FFA04A]/25 blur-[50px] pointer-events-none" />

      {/* 3D Interactive Perspective Stage */}
      <div 
        className="cb-rich-cube-container"
        style={{
          transform: `rotateX(${mouseOffset.y * 0.35}deg) rotateY(${mouseOffset.x * 0.35}deg)`,
        }}
      >
        {/* The 3D Rotating Rich Orange Cube */}
        <div className={`cb-rich-cube ${isHovered ? "cb-rich-cube-paused" : ""}`}>
          
          {/* Internal Warm Core Illumination */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-radial from-[#FFE0A0]/40 via-[#FF8C30]/25 to-transparent blur-lg pointer-events-none" />

          {/* 6 Spatial Faces with Realistic 3D Lighting Gradients */}
          <div className="cb-r-face cb-r-front">
            <div className="cb-r-specular" />
          </div>
          <div className="cb-r-face cb-r-back">
            <div className="cb-r-specular" />
          </div>
          <div className="cb-r-face cb-r-right">
            <div className="cb-r-specular" />
          </div>
          <div className="cb-r-face cb-r-left">
            <div className="cb-r-specular" />
          </div>
          <div className="cb-r-face cb-r-top">
            <div className="cb-r-specular" />
          </div>
          <div className="cb-r-face cb-r-bottom">
            <div className="cb-r-specular" />
          </div>
        </div>
      </div>
    </div>
  );
}
