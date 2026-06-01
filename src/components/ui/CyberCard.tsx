import React from "react";
import { cn } from "../../lib/utils";

interface CyberCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowing?: boolean;
  accent?: "primary" | "secondary" | "neutral";
  hoverable?: boolean;
}

export const CyberCard: React.FC<CyberCardProps> = ({
  children,
  className,
  glowing = true,
  accent = "primary",
  hoverable = true,
  ...props
}) => {
  const accentBorders = {
    primary: "border-accent-primary/20 focus-within:border-accent-primary-active hover:border-accent-primary/50",
    secondary: "border-accent-secondary/20 hover:border-accent-secondary/50",
    neutral: "border-cyber-muted/30 hover:border-accent-primary/30"
  };

  const glows = {
    primary: "hover:shadow-[0_0_15px_rgba(0,245,255,0.15)]",
    secondary: "hover:shadow-[0_0_15px_rgba(191,0,255,0.15)]",
    neutral: "hover:shadow-[0_0_10px_rgba(255,255,255,0.05)]"
  };

  return (
    <div
      className={cn(
        "bg-cyber-card border relative p-6 transition-all duration-300 rounded-xs",
        accentBorders[accent],
        hoverable && "hover:-translate-y-1",
        hoverable && glowing && glows[accent],
        className
      )}
      {...props}
    >
      {/* Absolute Corner Brackets [ ] */}
      <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-accent-primary/80" />
      <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-accent-secondary/80" />
      <span className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-accent-secondary/80" />
      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-accent-primary/80" />

      {/* Futuristic Grid Sub-Overlay Line decorative element */}
      <div className="absolute top-0 right-4 left-4 h-[1px] bg-gradient-to-r from-transparent via-accent-primary/30 to-transparent" />
      <div className="absolute bottom-0 right-4 left-4 h-[1px] bg-gradient-to-r from-transparent via-accent-secondary/30 to-transparent" />

      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};
