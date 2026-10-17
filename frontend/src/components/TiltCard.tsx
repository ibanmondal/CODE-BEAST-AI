"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

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
  variant = "default",
  interactive = true,
  onClick,
  id,
  style,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -5;
    const rotY = ((x - centerX) / centerX) * 5;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseEnter = () => {
    if (interactive) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setIsHovered(false);
      setRotateX(0);
      setRotateY(0);
    }
  };

  const variantStyles = {
    hero: "bg-[#08132B]/90 border-[#89CFF0]/35 shadow-[0_8px_32px_rgba(2,6,18,0.7)] text-white",
    primary: "bg-[#08132B]/85 border-[#89CFF0]/25 shadow-[0_4px_20px_rgba(2,6,18,0.5)] text-white",
    secondary: "bg-[#040914]/80 border-[#89CFF0]/20 text-[#8EA6C8]",
    metric: "bg-[#08132B]/80 border-[#89CFF0]/25 text-white",
    glass: "bg-[#08132B]/75 backdrop-blur-md border-[#89CFF0]/30 shadow-[0_4px_24px_rgba(137,207,240,0.1)] text-white",
    subtle: "bg-[#08132B]/60 border-[#89CFF0]/15 text-[#8EA6C8]",
    default: "bg-[#08132B]/80 border-[#89CFF0]/25 text-white",
  }[variant] || "bg-[#08132B]/80 border-[#89CFF0]/25 text-white";

  return (
    <div
      ref={cardRef}
      id={id}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transform: isHovered && interactive
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)",
        transition: isHovered ? "transform 0.08s ease-out" : "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease"
      }}
      className={cn(
        "rounded-2xl border text-white relative select-none",
        variantStyles,
        interactive && "hover:border-[#89CFF0]/60 hover:shadow-[0_10px_26px_rgba(137,207,240,0.15)]",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
