import React from "react";
import { cn } from "../../lib/utils";

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "wa" | "danger" | "nav";
  size?: "sm" | "md" | "lg";
  glowing?: boolean;
}

export const CyberButton: React.FC<CyberButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  glowing = true,
  ...props
}) => {
  const baseStyle = "min-h-[44px] font-orbitron tracking-wider uppercase font-medium transition-all duration-300 relative select-none cursor-pointer focus:outline-none flex items-center justify-center gap-2 border overflow-hidden group";
  
  const variants = {
    primary: "border-accent-primary text-accent-primary hover:bg-accent-primary/10 hover:text-white bg-transparent",
    secondary: "border-accent-secondary text-accent-secondary hover:bg-accent-secondary/10 hover:text-white bg-transparent",
    wa: "border-accent-wa text-accent-wa hover:bg-accent-wa/10 hover:text-white bg-transparent",
    danger: "border-red-500 text-red-500 hover:bg-red-500/10 hover:text-white bg-transparent",
    nav: "border-transparent text-cyber-text hover:text-accent-primary hover:border-accent-primary/30 py-1 bg-transparent"
  };

  const glows = {
    primary: "hover:shadow-[0_0_15px_rgba(0,245,255,0.4)]",
    secondary: "hover:shadow-[0_0_15px_rgba(191,0,255,0.4)]",
    wa: "hover:shadow-[0_0_15px_rgba(37,211,102,0.4)]",
    danger: "hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]",
    nav: ""
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-5 py-2.5",
    lg: "text-base px-8 py-3.5"
  };

  return (
    <button
      className={cn(
        baseStyle,
        variants[variant],
        glowing && glows[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {/* Visual background slash/corner effect on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      
      {/* Cyber brackets decorative corner */}
      {variant !== "nav" && (
        <>
          <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-current opacity-60" />
          <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-current opacity-60" />
          <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-current opacity-60" />
          <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-current opacity-60" />
        </>
      )}

      <span className="relative z-10 flex items-center justify-center gap-1.5">
        {children}
      </span>
    </button>
  );
};
