import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { CodeBeastLiquidButton } from "@/components/ui/codebeast-liquid-button";

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-full text-sm font-extrabold tracking-wider uppercase transition-all duration-300 outline-none select-none",
  {
    variants: {
      variant: {
        default: "text-[#D4BC9A]",
        outline: "text-[#D4BC9A]",
        secondary: "text-[#D4BC9A]",
        ghost: "text-[#D4BC9A]",
        destructive: "text-[#FEE2E2]",
        link: "text-[#FF8C42] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 text-xs font-bold",
        xs: "h-7 px-3 text-[10px]",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-xs font-extrabold",
        icon: "size-10 rounded-full",
        "icon-xs": "size-7 rounded-full",
        "icon-sm": "size-8 rounded-full",
        "icon-lg": "size-12 rounded-full",
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
    size === "xs" || size === "sm"
      ? "sm"
      : size === "lg"
      ? "lg"
      : size?.toString().startsWith("icon")
      ? "icon"
      : "md";

  return (
    <CodeBeastLiquidButton
      variant={mappedVariant}
      size={mappedSize}
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </CodeBeastLiquidButton>
  );
}

export { Button, buttonVariants };
