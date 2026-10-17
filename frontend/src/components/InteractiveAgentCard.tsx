"use client";

import React, { useRef, useState } from "react";
import { LucideIcon, ArrowUpRight, Activity } from "lucide-react";

interface InteractiveAgentCardProps {
  id: string;
  name: string;
  category: string;
  desc: string;
  tech: string;
  icon: LucideIcon;
  onInspect: (agentId: string) => void;
  accentColor?: string;
}

export function InteractiveAgentCard({
  id,
  name,
  category,
  desc,
  tech,
  icon: Icon,
  onInspect,
  accentColor = "#89CFF0"
}: InteractiveAgentCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Controlled 3D rotation angle (max ±8 degrees for elegance)
    const rotX = ((y - centerY) / centerY) * -7;
    const rotY = ((x - centerX) / centerX) * 7;

    setRotateX(rotX);
    setRotateY(rotY);

    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      className="perspective-1000 w-full"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        onClick={() => onInspect(id)}
        style={{
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) translateZ(10px)`
            : "rotateX(0deg) rotateY(0deg) translateY(0) translateZ(0)",
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease"
        }}
        className="relative liquid-glass-interactive rounded-2xl p-5 sm:p-6 cursor-pointer group select-none preserve-3d border border-[#89CFF0]/25"
      >
        {/* Dynamic Specular Light Glare Overlay */}
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none opacity-40 transition-opacity rounded-2xl"
            style={{
              background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(137, 207, 240, 0.35), transparent 60%)`
            }}
          />
        )}

        {/* Top Header Row with Popping 3D Icon */}
        <div className="flex items-start justify-between pb-3 border-b border-[#89CFF0]/25 mb-3">
          <div 
            style={{ transform: isHovered ? "translateZ(20px)" : "translateZ(0)" }}
            className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#08132B] to-[#040914] border border-[#89CFF0]/40 shadow-[0_4px_12px_rgba(2,6,18,0.5)] flex items-center justify-center text-[#89CFF0] group-hover:bg-[#89CFF0] group-hover:text-[#040914] transition-all duration-300"
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/35 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#89CFF0] animate-pulse" />
              Active
            </span>
            <div className="p-1 text-[#8EA6C8] group-hover:text-[#89CFF0] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Title & Description with Depth */}
        <div style={{ transform: isHovered ? "translateZ(12px)" : "translateZ(0)" }}>
          <span className="text-[10px] font-mono font-bold text-[#89CFF0] uppercase tracking-wider block mb-1">
            {category}
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-[#BAE6FD] transition-colors mb-1.5 font-sans">
            {name}
          </h3>
          <p className="text-xs text-[#8EA6C8] leading-relaxed line-clamp-2 mb-4 font-sans">
            {desc}
          </p>
        </div>

        {/* Footer Spec Badge */}
        <div 
          style={{ transform: isHovered ? "translateZ(8px)" : "translateZ(0)" }}
          className="pt-3 border-t border-[#89CFF0]/25 flex items-center justify-between text-[11px] font-mono text-[#8EA6C8]"
        >
          <span className="truncate max-w-[190px] font-medium">{tech}</span>
          <span className="text-[#89CFF0] font-bold group-hover:text-[#BAE6FD] group-hover:underline">Inspect &rarr;</span>
        </div>

      </div>
    </div>
  );
}
