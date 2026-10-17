import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { CodeBeastLiquidButton } from "@/components/ui/codebeast-liquid-button";

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-none text-sm font-medium transition-all duration-150 outline-none select-none",
  {
    variants: {
      variant: {
        default: "text-[#040914] bg-gradient-to-r from-[#BAE6FD] via-[#89CFF0] to-[#70C0E8] font-bold hover:shadow-[0_0_20px_rgba(137,207,240,0.4)]",
        outline: "text-white border border-[#89CFF0]/30 bg-[#08132B]/80 hover:bg-[#89CFF0]/15",
        secondary: "text-[#89CFF0] bg-[#08132B] border border-[#89CFF0]/25 hover:bg-[#89CFF0]/10",
        ghost: "text-[#BAE6FD] hover:bg-[#89CFF0]/10 hover:text-white",
        destructive: "text-rose-300 bg-rose-950/60 border border-rose-500/30 hover:bg-rose-900/60",
        link: "text-[#89CFF0] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 text-xs font-medium",
        xs: "h-7 px-2.5 text-[11px]",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-sm font-semibold",
        icon: "size-9 rounded-none",
        "icon-xs": "size-7 rounded-none",
        "icon-sm": "size-8 rounded-none",
        "icon-lg": "size-11 rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  children,
  onClick,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const mappedVariant =
    variant === "destructive"
      ? "danger"
      : variant === "outline" || variant === "ghost"
      ? "outline"
      : variant === "secondary"
      ? "secondary"
      : "primary";

  const mappedSize =
    size === "lg" || size === "icon-lg"
      ? "lg"
      : size === "xs" || size === "sm" || size === "icon-xs" || size === "icon-sm"
      ? "sm"
      : "md";

  return (
    <CodeBeastLiquidButton
      variant={mappedVariant}
      size={mappedSize}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn(className)}
      {...props}
    >
      {children}
    </CodeBeastLiquidButton>
  );
}

export { Button, buttonVariants };
