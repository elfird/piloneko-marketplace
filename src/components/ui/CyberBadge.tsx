import React from "react";
import { cn } from "../../lib/utils";

interface CyberBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "wa" | "danger" | "flash";
}

export const CyberBadge: React.FC<CyberBadgeProps> = ({
  children,
  className,
  variant = "primary",
  ...props
}) => {
  const styles = {
    primary: "border-accent-primary/50 text-accent-primary bg-accent-primary/5 shadow-[0_0_8px_rgba(0,245,255,0.1)]",
    secondary: "border-accent-secondary/50 text-accent-secondary bg-accent-secondary/5 shadow-[0_0_8px_rgba(191,0,255,0.1)]",
    wa: "border-accent-wa/50 text-accent-wa bg-accent-wa/5 shadow-[0_0_8px_rgba(37,211,102,0.1)]",
    danger: "border-red-500/50 text-red-400 bg-red-500/5 shadow-[0_0_8px_rgba(239,68,68,0.1)]",
    flash: "border-red-500 text-red-500 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse-fast"
  };

  return (
    <span
      className={cn(
        "font-orbitron font-medium text-[10px] uppercase px-2 py-0.5 border tracking-widest inline-flex items-center gap-1 relative",
        styles[variant],
        className
      )}
      {...props}
    >
      {/* Tiny decorative corner tags only for authentic sci-fi aesthetics */}
      <span className="w-0.5 h-0.5 bg-current absolute top-0 left-0" />
      <span className="w-0.5 h-0.5 bg-current absolute bottom-0 right-0" />
      {children}
    </span>
  );
};
