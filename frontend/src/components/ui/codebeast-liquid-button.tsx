"use client";

import React from "react";
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
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    if (onClick) onClick(e);
    if (href && !e.defaultPrevented) {
      router.push(href);
    }
  };

  const isIconOnly = viewMode === "icon" || size === "icon";

  const sizeClasses = {
    sm: "h-8 px-4 text-xs gap-1.5",
    md: "h-10 px-5 text-sm gap-2",
    lg: "h-12 px-7 text-base gap-2.5",
    icon: "h-9 w-9 p-0 justify-center",
  }[size];

  const variantClasses = {
    primary: "bg-gradient-to-r from-[#BAE6FD] via-[#89CFF0] to-[#70C0E8] text-[#040914] shadow-[0_8px_20px_rgba(137,207,240,0.35),inset_0_1px_2px_rgba(255,255,255,0.85)] hover:shadow-[0_12px_28px_rgba(137,207,240,0.55),0_0_24px_rgba(186,230,253,0.6)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] border border-white/50 font-bold uppercase tracking-wide",
    secondary: "bg-[#08132B]/90 backdrop-blur-md text-[#89CFF0] hover:bg-[#0C1A38] hover:text-white border border-[#89CFF0]/30 shadow-[0_4px_14px_rgba(2,6,18,0.5)] hover:-translate-y-0.5 active:scale-[0.98] font-bold uppercase tracking-wide",
    outline: "bg-transparent text-[#89CFF0] border border-[#89CFF0]/40 hover:bg-[#89CFF0]/10 hover:text-white font-bold uppercase tracking-wide",
    status: "bg-[#08132B]/90 text-[#89CFF0] border border-[#89CFF0]/30 font-bold uppercase",
    danger: "bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-500/40 font-bold uppercase",
    ghost: "bg-transparent text-[#8EA6C8] hover:text-white hover:bg-[#08132B]/40 font-bold uppercase",
  }[variant];

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center rounded-xl transition-all duration-200 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#89CFF0] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none group",
        sizeClasses,
        variantClasses,
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0 transition-transform duration-150 group-hover:scale-105">{icon}</span>
      )}
      
      {!isIconOnly && (children || label)}

      {!isIconOnly && hasArrow && !isLoading && (
        <ArrowRight className="w-4 h-4 ml-0.5 shrink-0 transition-transform duration-150 group-hover:translate-x-1" />
      )}
    </button>
  );
}
