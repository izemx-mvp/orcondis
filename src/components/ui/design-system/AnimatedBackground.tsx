import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedBackgroundProps {
  variant?: "expressive" | "ambient" | "restrained" | "subtle";
  className?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  variant = "ambient",
  className,
}) => {
  const intensityMap = {
    expressive: "opacity-100",
    ambient: "opacity-80",
    restrained: "opacity-50",
    subtle: "opacity-30",
  };

  return (
    <div
      className={cn(
        "fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-background transition-colors duration-1000",
        className
      )}
    >
      {/* Light Mode: Elegant Movement + Logistics */}
      <div className={cn("absolute inset-0 dark:hidden transition-opacity duration-1000", intensityMap[variant])}>
        {/* Soft flowing gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-[120px] animate-[pulse_15s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-info/10 blur-[140px] animate-[pulse_20s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] rounded-full bg-violet-200/20 blur-[100px] animate-[pulse_12s_ease-in-out_infinite]" />
        
        {/* Moving Blobs */}
        <div className="absolute top-[40%] left-[20%] w-64 h-64 bg-cyan-100/30 blur-[80px] rounded-full animate-[bounce_25s_infinite]" />
        
        {/* Connectivity Lines - subtle SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03] text-primary" xmlns="http://www.w3.org/2000/svg">
          <pattern id="light-network" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 100 200 M 0 100 L 200 100 M 0 0 L 200 200 M 200 0 L 0 200" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="3" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#light-network)" />
        </svg>
      </div>

      {/* Dark Mode: Digital Logistics Network at Night */}
      <div className={cn("absolute inset-0 hidden dark:block transition-opacity duration-1000", intensityMap[variant])}>
        {/* Deep Navy/Tech Glow */}
        <div className="absolute top-[-25%] left-[-15%] w-[90%] h-[90%] rounded-full bg-primary/20 blur-[160px] animate-[pulse_18s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[80%] h-[80%] rounded-full bg-info/15 blur-[180px] animate-[pulse_22s_ease-in-out_infinite_reverse]" />
        
        {/* Electric Glow Orbs */}
        <div className="absolute top-[30%] left-[30%] w-48 h-48 bg-cyan-500/10 blur-[100px] rounded-full animate-[pulse_10s_infinite]" />
        
        {/* Logistics Grid/Paths - very subtle */}
        <div 
          className="absolute inset-0 opacity-[0.05] mix-blend-screen"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px',
            color: 'var(--primary)'
          }}
        />
        
        {/* Animated Network Lines */}
        <div className="absolute inset-0 opacity-[0.07] overflow-hidden">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/50 to-transparent animate-[slide-up_10s_linear_infinite]" />
          <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent animate-[slide-up_15s_linear_infinite]" />
          <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-primary/50 to-transparent animate-[slide-up_12s_linear_infinite]" />
        </div>
      </div>

      {/* Noise Texture for Depth */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] mix-blend-overlay pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>
    </div>
  );
};