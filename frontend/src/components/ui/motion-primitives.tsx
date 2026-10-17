"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * 1. ScrollReveal
 * Scroll-triggered reveal animation for cards, panels, and sections.
 * Automatically respects prefers-reduced-motion and executes once when in viewport.
 */
interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 18,
  duration = 0.5,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  const getInitialPosition = () => {
    if (shouldReduceMotion) return { x: 0, y: 0, opacity: 0 };
    switch (direction) {
      case "up":
        return { x: 0, y: distance, opacity: 0 };
      case "down":
        return { x: 0, y: -distance, opacity: 0 };
      case "left":
        return { x: distance, y: 0, opacity: 0 };
      case "right":
        return { x: -distance, y: 0, opacity: 0 };
      case "none":
      default:
        return { x: 0, y: 0, opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: shouldReduceMotion ? 0.01 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * 2. StaggerContainer & StaggerItem
 * Coordinated staggered reveals for grids of cards, statistical metrics, and lists.
 */
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.08,
  delayChildren = 0.05,
}: StaggerContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
        delayChildren: shouldReduceMotion ? 0 : delayChildren,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  yOffset?: number;
}

export function StaggerItem({
  children,
  className = "",
  yOffset = 14,
}: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion();

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : yOffset,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.45,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * 3. PerspectiveCard
 * Layered enterprise card with controlled elevation, subtle perspective,
 * and sharp 90-degree corners.
 */
interface PerspectiveCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export function PerspectiveCard({
  children,
  className = "",
  onClick,
  interactive = true,
}: PerspectiveCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={
        interactive
          ? {
              y: -3,
              boxShadow:
                "0 12px 28px -4px rgba(11,25,44, 0.08), 0 4px 12px -2px rgba(11,25,44, 0.04)",
              borderColor: "#5A7A9E",
            }
          : undefined
      }
      whileTap={interactive && onClick ? { scale: 0.995 } : undefined}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "bg-[#08132B]/85 border border-[#89CFF0]/25 rounded-2xl p-5 text-white relative overflow-hidden transition-colors shadow-[0_4px_20px_rgba(2,6,18,0.5)]",
        interactive && "cursor-pointer group hover:border-[#89CFF0]/50",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

/**
 * 4. AnimatedScoreRadial
 * Clean animated circular SVG score indicator with percentage text.
 * Strictly maintains circular geometry only for the gauge, matching user rules.
 */
interface AnimatedScoreRadialProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export function AnimatedScoreRadial({
  score,
  maxScore = 100,
  size = 72,
  strokeWidth = 6,
  label,
  className = "",
}: AnimatedScoreRadialProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("inline-flex flex-col items-center justify-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 circular-score-indicator"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#EFF6FF"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated active score bar */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#89CFF0"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono font-bold text-sm text-white drop-shadow-[0_0_12px_rgba(137,207,240,0.5)]">
            {Math.round(score)}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-[10px] uppercase font-semibold text-[#8EA6C8] mt-1 tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * 5. AnimatedBadge
 * Polished status badge with live pulsing dot and crisp styling.
 */
interface AnimatedBadgeProps {
  children: React.ReactNode;
  variant?: "royal" | "light" | "success" | "warning";
  pulse?: boolean;
  className?: string;
}

export function AnimatedBadge({
  children,
  variant = "light",
  pulse = false,
  className = "",
}: AnimatedBadgeProps) {
  const variantStyles = {
    royal: "bg-gradient-to-r from-[#BAE6FD] to-[#89CFF0] text-[#040914] font-bold border-transparent",
    light: "bg-[#08132B] text-[#89CFF0] border-[#89CFF0]/30",
    success: "bg-emerald-950/60 text-emerald-300 border-emerald-500/30",
    warning: "bg-amber-950/60 text-amber-300 border-amber-500/30",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-[10px] font-semibold tracking-wider uppercase font-mono select-none",
        variantStyles,
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#89CFF0] opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#89CFF0]" />
        </span>
      )}
      {children}
    </span>
  );
}
