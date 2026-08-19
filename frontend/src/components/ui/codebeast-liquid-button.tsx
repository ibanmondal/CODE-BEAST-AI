"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CodeBeastButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "status" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  viewMode?: "text" | "icon";
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  hasArrow?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

export function CodeBeastLiquidButton({
  label,
  onClick,
  href,
  variant = "primary",
  size = "md",
  viewMode = "text",
  children,
  className = "",
  icon,
  hasArrow = false,
  isLoading = false,
  disabled = false,
  type = "button",
  ...props
}: CodeBeastButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const router = useRouter();

  const isIconOnly = viewMode === "icon" || size === "icon";

  const dimensions = useMemo(() => {
    let heightClass = "h-[44px]";
    let paddingClass = "px-6";
    let textClass = "text-xs";
    let radiusClass = "rounded-full";

    if (size === "sm") {
      heightClass = "h-[36px]";
      paddingClass = "px-4";
      textClass = "text-[11px]";
    } else if (size === "lg") {
      heightClass = "h-[52px]";
      paddingClass = "px-8";
      textClass = "text-sm";
    }

    if (isIconOnly) {
      const iconSize = size === "sm" ? "w-[36px] h-[36px]" : size === "lg" ? "w-[52px] h-[52px]" : "w-[44px] h-[44px]";
      return {
        container: `${iconSize} p-0`,
        textClass,
        radiusClass: "rounded-2xl",
      };
    }

    return {
      container: `${heightClass} ${paddingClass}`,
      textClass,
      radiusClass,
    };
  }, [size, isIconOnly]);

  // Variant Visual Token Architecture (Strict CodeBeast Palette: Deep Obsidian + Charcoal + Burnt Copper)
  const variantTokens = useMemo(() => {
    switch (variant) {
      case "secondary":
        return {
          bgSurface: "bg-gradient-to-b from-[#1C0D06] via-[#100602] to-[#090301]",
          border: "border border-[#E07A48]/35 hover:border-[#FF8C42]/70",
          shadowBase: "shadow-[0_4px_16px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,240,229,0.2)]",
          glowHover: "group-hover/cb-btn:shadow-[0_0_24px_rgba(224,122,72,0.35),0_8px_20px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,240,229,0.35)]",
          textColor: "text-[#D4BC9A] group-hover/cb-btn:text-[#FFF3E0]",
          beamColor: "from-transparent via-[#E07A48]/40 to-transparent",
        };
      case "status":
        return {
          bgSurface: "bg-gradient-to-b from-[#180A04] via-[#0E0502] to-[#070301]",
          border: "border border-[#E07A48]/30 hover:border-[#FF8C42]/60",
          shadowBase: "shadow-[0_2px_10px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(224,122,72,0.15)]",
          glowHover: "group-hover/cb-btn:shadow-[0_0_20px_rgba(224,122,72,0.3),inset_0_1px_1px_rgba(255,240,229,0.25)]",
          textColor: "text-[#D4BC9A] group-hover/cb-btn:text-[#FFF3E0]",
          beamColor: "from-transparent via-[#FF8C42]/30 to-transparent",
        };
      case "danger":
        return {
          bgSurface: "bg-gradient-to-b from-[#2B0808] via-[#160303] to-[#0A0101]",
          border: "border border-red-500/40 hover:border-red-400/80",
          shadowBase: "shadow-[0_4px_16px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(254,202,202,0.2)]",
          glowHover: "group-hover/cb-btn:shadow-[0_0_26px_rgba(239,68,68,0.45),0_8px_20px_rgba(0,0,0,0.9)]",
          textColor: "text-red-200 group-hover/cb-btn:text-white",
          beamColor: "from-transparent via-red-500/50 to-transparent",
        };
      case "outline":
      case "ghost":
        return {
          bgSurface: "bg-gradient-to-b from-[#180A05]/80 via-[#0D0502]/85 to-[#060201]/90 backdrop-blur-md",
          border: "border border-[#E07A48]/30 hover:border-[#FF8C42]/60",
          shadowBase: "shadow-[0_2px_12px_rgba(0,0,0,0.6)]",
          glowHover: "group-hover/cb-btn:shadow-[0_0_20px_rgba(224,122,72,0.3),inset_0_1px_1px_rgba(255,240,229,0.2)]",
          textColor: "text-[#D4BC9A] group-hover/cb-btn:text-[#FFF3E0]",
          beamColor: "from-transparent via-[#E07A48]/30 to-transparent",
        };
      case "primary":
      default:
        return {
          bgSurface: "bg-gradient-to-b from-[#261006] via-[#140602] to-[#080301]",
          border: "border border-[#E07A48]/50 hover:border-[#FF8C42]/90",
          shadowBase: "shadow-[0_4px_20px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,240,229,0.3)]",
          glowHover: "group-hover/cb-btn:shadow-[0_0_32px_rgba(255,140,66,0.55),0_10px_24px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.4)]",
          textColor: "text-[#D4BC9A] group-hover/cb-btn:text-[#FFF8F0]",
          beamColor: "from-transparent via-[#FF8C42]/60 to-transparent",
        };
    }
  }, [variant]);

  const textContent = label || (typeof children === "string" ? children : "");

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
    if (href && !e.defaultPrevented) {
      router.push(href);
    }
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center select-none group/cb-btn",
        disabled && "opacity-45 pointer-events-none cursor-not-allowed",
        className
      )}
      style={{ perspective: "1000px" }}
    >
      {/* 1. Ambient Background Glow Aura */}
      <div
        className={cn(
          "absolute -inset-1.5 opacity-0 group-hover/cb-btn:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none z-0",
          dimensions.radiusClass,
          variant === "danger" ? "bg-red-500/20" : "bg-[#FF8C42]/25"
        )}
      />

      {/* 2. Deep 3D Shadow Plate Beneath the Button */}
      <div
        className={cn(
          "absolute inset-0 bg-[#060201] translate-y-1.5 opacity-90 transition-transform duration-300 pointer-events-none z-0",
          dimensions.radiusClass,
          isHovered ? "translate-y-2.5 scale-105 opacity-100 blur-[2px]" : "",
          isPressed ? "translate-y-0.5 scale-95 opacity-60" : ""
        )}
      />

      {/* 3. Main 3D Raised Beveled Button Body */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        disabled={disabled || isLoading}
        type={type}
        className={cn(
          "relative flex items-center justify-center gap-2.5 font-sans font-bold tracking-wider uppercase cursor-pointer outline-none overflow-hidden transition-all duration-300 z-10",
          dimensions.container,
          dimensions.radiusClass,
          variantTokens.bgSurface,
          variantTokens.border,
          variantTokens.shadowBase,
          variantTokens.glowHover,
          isHovered ? "-translate-y-[3px] scale-[1.02]" : "translate-y-0 scale-100",
          isPressed ? "translate-y-[2px] scale-[0.97]" : "",
          disabled && "cursor-not-allowed"
        )}
        style={{
          transformStyle: "preserve-3d",
          WebkitFontSmoothing: "antialiased",
        }}
        {...props}
      >
        {/* 4. Specular Top Edge Bevel Inset Highlight */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF8C42]/40 to-transparent pointer-events-none z-30 transition-opacity duration-300",
            isHovered ? "opacity-100 via-[#FF8C42]/80" : "opacity-50"
          )}
        />

        {/* 5. Animated Perimeter Light Beam */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-inherit opacity-0 group-hover/cb-btn:opacity-100 transition-opacity duration-400 z-20">
          <div
            className={cn(
              "absolute inset-[-100%] w-[300%] h-[300%] m-auto bg-gradient-to-r pointer-events-none animate-cb-beam",
              variantTokens.beamColor
            )}
            style={{
              animationPlayState: isHovered ? "running" : "paused",
            }}
          />
        </div>

        {/* 6. Specular Shimmer Sweep Streak */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-inherit opacity-0 group-hover/cb-btn:opacity-100 transition-opacity duration-300 z-20">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#FF8C42]/20 to-transparent transform -skew-x-12 animate-cb-shimmer" />
        </div>

        {/* 7. Foreground Content (Icon + Animated Typography + Arrow) */}
        <div className="relative flex items-center justify-center gap-2 z-30 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-[#FF8C42] animate-spin shrink-0" />
          ) : icon ? (
            <span className="shrink-0 transition-transform duration-300 group-hover/cb-btn:scale-110 text-[#FF8C42]">
              {icon}
            </span>
          ) : null}

          {/* Staggered Character Transition or Custom Children */}
          {children && typeof children !== "string" ? (
            children
          ) : textContent ? (
            <span
              className={cn(
                "inline-flex items-center font-extrabold transition-colors duration-300 font-mono tracking-wider",
                dimensions.textClass,
                variantTokens.textColor
              )}
            >
              {textContent.split("").map((char, index) => (
                <span
                  key={index}
                  className="inline-block transition-transform duration-200"
                  style={{
                    transitionDelay: isHovered ? `${index * 15}ms` : "0ms",
                    transform: isHovered ? "translateY(-1px)" : "translateY(0)",
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
          ) : null}

          {/* Forward Gliding Action Arrow */}
          {hasArrow && !isLoading && (
            <ArrowRight className="w-3.5 h-3.5 text-[#FF8C42] transition-transform duration-300 group-hover/cb-btn:translate-x-1 shrink-0" />
          )}
        </div>
      </button>
    </div>
  );
}

// Full Backwards Compatibility & Naming Aliases
export const CodeBeastButton = CodeBeastLiquidButton;
export const LiquidMetalButton = CodeBeastLiquidButton;
