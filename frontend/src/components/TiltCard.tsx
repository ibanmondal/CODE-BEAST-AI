"use client";
import React, { useRef, useEffect, useState } from "react";

export type TiltCardVariant = "hero" | "primary" | "secondary" | "metric" | "glass" | "subtle" | "default";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glowColor?: string;
  interactive?: boolean;
  variant?: TiltCardVariant;
  showCornerElements?: boolean;
  showCyberLines?: boolean;
  showGlare?: boolean;
  onClick?: () => void;
  id?: string;
  style?: React.CSSProperties;
}

export function TiltCard({
  children,
  className = "",
  maxTilt = 6,
  glowColor,
  interactive = true,
  variant = "default",
  showCornerElements = true,
  showCyberLines = true,
  showGlare = true,
  onClick,
  id,
  style,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const rafId = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Variant visual styles tailored to CodeBeast obsidian-copper hierarchy
  const getVariantStyles = () => {
    switch (variant) {
      case "hero":
        return {
          base: "bg-gradient-to-b from-[#1C0D06] via-[#120703] to-[#0A0502] border-[#E07A48]/35 hover:border-[#FF8C42]/70",
          shadowDefault: "shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,140,66,0.2),inset_0_-1px_3px_rgba(0,0,0,0.8)]",
          shadowHover: "hover:shadow-[0_28px_65px_rgba(0,0,0,0.95),0_0_40px_rgba(224,122,72,0.25),inset_0_1px_3px_rgba(255,140,66,0.35)]",
          defaultGlow: "rgba(224, 122, 72, 0.35)",
          hairline: "via-[#FF8C42]/50 group-hover:via-[#FF8C42]/90",
          cornerColor: "border-[#FF8C42]/40 group-hover:border-[#FF8C42]/90 group-hover:shadow-[0_0_8px_rgba(255,140,66,0.5)]",
        };
      case "primary":
        return {
          base: "bg-gradient-to-b from-[#180A05]/95 via-[#120703]/92 to-[#0A0503]/95 border-[#E07A48]/25 hover:border-[#FF8C42]/60",
          shadowDefault: "shadow-[0_15px_40px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,140,66,0.15),inset_0_-1px_2px_rgba(0,0,0,0.7)]",
          shadowHover: "hover:shadow-[0_22px_55px_rgba(0,0,0,0.9),0_0_35px_rgba(224,122,72,0.2),inset_0_1px_2px_rgba(255,140,66,0.25)]",
          defaultGlow: "rgba(224, 122, 72, 0.28)",
          hairline: "via-[#FF8C42]/35 group-hover:via-[#FF8C42]/70",
          cornerColor: "border-[#E07A48]/30 group-hover:border-[#FF8C42]/80 group-hover:shadow-[0_0_6px_rgba(224,122,72,0.4)]",
        };
      case "secondary":
        return {
          base: "bg-[#140804]/90 hover:bg-[#1A0B05]/95 border-[#E07A48]/20 hover:border-[#FF8C42]/50",
          shadowDefault: "shadow-[0_12px_32px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,140,66,0.1)]",
          shadowHover: "hover:shadow-[0_18px_45px_rgba(0,0,0,0.8),0_0_28px_rgba(224,122,72,0.18),inset_0_1px_2px_rgba(255,140,66,0.2)]",
          defaultGlow: "rgba(224, 122, 72, 0.22)",
          hairline: "via-[#FF8C42]/25 group-hover:via-[#FF8C42]/50",
          cornerColor: "border-[#E07A48]/25 group-hover:border-[#FF8C42]/70 group-hover:shadow-[0_0_6px_rgba(224,122,72,0.3)]",
        };
      case "metric":
        return {
          base: "bg-[#140803]/85 hover:bg-[#1C0D06]/95 border-[#E07A48]/20 hover:border-[#FF8C42]/55",
          shadowDefault: "shadow-[0_10px_28px_rgba(0,0,0,0.6),inset_0_1px_0px_rgba(255,140,66,0.08)]",
          shadowHover: "hover:shadow-[0_16px_40px_rgba(0,0,0,0.75),0_0_25px_rgba(224,122,72,0.18)]",
          defaultGlow: "rgba(224, 122, 72, 0.22)",
          hairline: "via-[#FF8C42]/20 group-hover:via-[#FF8C42]/60",
          cornerColor: "border-[#E07A48]/20 group-hover:border-[#FF8C42]/60",
        };
      case "glass":
        return {
          base: "bg-[#120703]/75 backdrop-blur-xl border-[#E07A48]/20 hover:border-[#FF8C42]/50",
          shadowDefault: "shadow-[0_15px_35px_rgba(0,0,0,0.6)]",
          shadowHover: "hover:shadow-[0_20px_45px_rgba(0,0,0,0.8),0_0_30px_rgba(224,122,72,0.2)]",
          defaultGlow: "rgba(224, 122, 72, 0.25)",
          hairline: "via-[#FF8C42]/30 group-hover:via-[#FF8C42]/60",
          cornerColor: "border-[#E07A48]/25 group-hover:border-[#FF8C42]/60",
        };
      case "subtle":
        return {
          base: "bg-[#0E0602]/90 border-[#E07A48]/15 hover:border-[#E07A48]/35",
          shadowDefault: "shadow-[0_6px_20px_rgba(0,0,0,0.5)]",
          shadowHover: "hover:shadow-[0_12px_30px_rgba(0,0,0,0.65)]",
          defaultGlow: "rgba(224, 122, 72, 0.15)",
          hairline: "via-[#FF8C42]/15 group-hover:via-[#FF8C42]/35",
          cornerColor: "border-[#E07A48]/15 group-hover:border-[#FF8C42]/40",
        };
      case "default":
      default:
        return {
          base: "bg-gradient-to-b from-[#180A05]/95 via-[#120703]/90 to-[#0A0503]/95 border-[#E07A48]/25 hover:border-[#FF8C42]/60",
          shadowDefault: "shadow-[0_15px_35px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,140,66,0.12),inset_0_-1px_2px_rgba(0,0,0,0.6)]",
          shadowHover: "hover:shadow-[0_24px_55px_rgba(0,0,0,0.85),0_0_35px_rgba(224,122,72,0.22),inset_0_1px_2px_rgba(255,140,66,0.25)]",
          defaultGlow: "rgba(224, 122, 72, 0.28)",
          hairline: "via-[#FF8C42]/30 group-hover:via-[#FF8C42]/70",
          cornerColor: "border-[#E07A48]/30 group-hover:border-[#FF8C42]/80 group-hover:shadow-[0_0_6px_rgba(224,122,72,0.35)]",
        };
    }
  };

  const styleConfig = getVariantStyles();
  const activeGlow = glowColor || styleConfig.defaultGlow;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    // Subtle, restrained professional tilt (±3.5deg to ±5.5deg)
    const rotateX = ((y / height) - 0.5) * -maxTilt;
    const rotateY = ((x / width) - 0.5) * maxTilt;
    const spotlightX = Math.round((x / width) * 100);
    const spotlightY = Math.round((y / height) * 100);

    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transition = "transform 0.08s ease-out, border-color 0.3s ease, box-shadow 0.3s ease";
        const translateYVal = isPressed ? "-1px" : "-4px";
        const translateZVal = isPressed ? "4px" : "12px";
        const scaleVal = isPressed ? "0.99" : "1.002";
        cardRef.current.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(${translateYVal}) translateZ(${translateZVal}) scale(${scaleVal})`;
      }

      // Moving specular glare reflection tracking cursor
      if (glareRef.current) {
        glareRef.current.style.opacity = "1";
        glareRef.current.style.background = `radial-gradient(450px circle at ${spotlightX}% ${spotlightY}%, rgba(255, 140, 66, 0.12) 0%, rgba(255, 255, 255, 0.04) 30%, transparent 65%)`;
      }

      // Radial spotlight aura
      if (spotlightRef.current) {
        spotlightRef.current.style.opacity = "1";
        spotlightRef.current.style.background = `radial-gradient(550px circle at ${spotlightX}% ${spotlightY}%, ${activeGlow}, transparent 70%)`;
      }
    });
  };

  const handleMouseEnter = () => {
    if (!interactive) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setIsHovered(false);
    setIsPressed(false);
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.35s ease, box-shadow 0.35s ease";
      cardRef.current.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px) translateZ(0px) scale(1)";
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = "0";
    }
    if (spotlightRef.current) {
      spotlightRef.current.style.opacity = "0";
    }
  };

  const handleMouseDown = () => {
    if (!interactive) return;
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    if (!interactive) return;
    setIsPressed(false);
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      id={id}
      style={{
        transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px) translateZ(0px) scale(1)",
        transformStyle: "preserve-3d",
        willChange: "transform, box-shadow",
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={onClick}
      className={`relative rounded-3xl overflow-hidden group border backdrop-blur-xl transition-all duration-300 ${styleConfig.base} ${styleConfig.shadowDefault} ${styleConfig.shadowHover} ${className}`}
    >
      {/* 1. Internal Ambient Glow Multi-Orbs (Reference glowing-elements glow-1, glow-2, glow-3) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out">
        {/* Glow 1: Top-Left Ambient Copper Accent */}
        <div 
          className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-2xl transition-transform duration-700 ease-out group-hover:scale-110"
          style={{ background: "radial-gradient(circle, rgba(224, 122, 72, 0.18) 0%, transparent 70%)" }}
        />
        {/* Glow 2: Center-Right Ambient Amber Accent */}
        <div 
          className="absolute top-1/2 -right-16 -translate-y-1/2 w-44 h-44 rounded-full blur-2xl transition-transform duration-700 ease-out group-hover:scale-110"
          style={{ background: "radial-gradient(circle, rgba(255, 140, 66, 0.12) 0%, transparent 70%)" }}
        />
        {/* Glow 3: Bottom-Center Ambient Deep Burnt-Orange Accent */}
        <div 
          className="absolute -bottom-12 left-1/3 w-52 h-52 rounded-full blur-2xl transition-transform duration-700 ease-out group-hover:scale-110"
          style={{ background: "radial-gradient(circle, rgba(217, 107, 39, 0.14) 0%, transparent 70%)" }}
        />
      </div>

      {/* 2. Cursor-Following Dynamic Specular Glare (Reference .card-glare) */}
      {showGlare && (
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 rounded-3xl mix-blend-screen"
          style={{
            background: "radial-gradient(450px circle at 50% 50%, rgba(255, 140, 66, 0.12) 0%, rgba(255, 255, 255, 0.04) 30%, transparent 65%)",
          }}
        />
      )}

      {/* 3. 3D Cursor Radial Aura Spotlight */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 rounded-3xl z-10 opacity-0"
        style={{
          background: `radial-gradient(550px circle at 50% 50%, ${activeGlow}, transparent 70%)`,
        }}
      />

      {/* 4. Top Hairline Razor Accent */}
      <div 
        className={`pointer-events-none absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent ${styleConfig.hairline} to-transparent z-20 transition-all duration-500`} 
      />

      {/* 5. Precision Corner Brackets (Reference .corner-elements styled in CodeBeast copper) */}
      {showCornerElements && (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          {/* Top Left */}
          <span 
            className={`absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 rounded-tl-[6px] transition-all duration-300 ${styleConfig.cornerColor}`} 
          />
          {/* Top Right */}
          <span 
            className={`absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 rounded-tr-[6px] transition-all duration-300 ${styleConfig.cornerColor}`} 
          />
          {/* Bottom Left */}
          <span 
            className={`absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 rounded-bl-[6px] transition-all duration-300 ${styleConfig.cornerColor}`} 
          />
          {/* Bottom Right */}
          <span 
            className={`absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 rounded-br-[6px] transition-all duration-300 ${styleConfig.cornerColor}`} 
          />
        </div>
      )}

      {/* 6. Subtle Cyber Line Accents (Reference .cyber-lines) */}
      {showCyberLines && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-30 group-hover:opacity-75 transition-opacity duration-500">
          <div className="absolute top-[30%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E07A48]/15 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out origin-left" />
          <div className="absolute top-[70%] right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FF8C42]/15 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out origin-right delay-100" />
        </div>
      )}

      {/* 7. Inner Elevated Content (Parallax Depth translateZ) */}
      <div 
        className="relative z-30 h-full w-full transform transition-transform duration-300 group-hover:translate-z-2"
        style={{ transformStyle: "preserve-3d" }}
      >
        {children}
      </div>
    </div>
  );
}
