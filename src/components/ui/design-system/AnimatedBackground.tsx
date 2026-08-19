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
    ambient: "opacity-60",
    restrained: "opacity-40",
    subtle: "opacity-20",
  };

  return (
    <div
      className={cn(
        "fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background transition-colors duration-1000",
        intensityMap[variant],
        className
      )}
    >
      {/* Light Mode: Subtle Gradients & Halos */}
      <div className="absolute inset-0 dark:hidden">
        <div className="absolute top-[-15%] left-[-5%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[0%] right-[-10%] w-[50%] h-[50%] rounded-full bg-info/5 blur-[140px] animate-pulse-slow [animation-delay:2s]" />
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] rounded-full bg-primary/2 blur-[100px] animate-pulse-slow [animation-delay:4s]" />
      </div>

      {/* Dark Mode: Deep Navy & Tech Glow */}
      <div className="absolute inset-0 hidden dark:block">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary/15 blur-[160px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-info/10 blur-[180px] animate-pulse-slow [animation-delay:3s]" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[140px] animate-pulse-slow [animation-delay:6s]" />
      </div>

      {/* Abstract Elements */}
      {variant !== "subtle" && (
        <>
          <div className="absolute top-[15%] left-[10%] w-96 h-96 border border-primary/5 dark:border-primary/10 rounded-full animate-[spin_120s_linear_infinite] opacity-50" />
          <div className="absolute bottom-[20%] right-[15%] w-[30rem] h-[30rem] border border-info/5 dark:border-info/10 rounded-full animate-[spin_180s_linear_infinite_reverse] opacity-50" />
        </>
      )}

      {/* Grid Pattern - Very subtle */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 90%)'
        }}
      />

      {/* Depth Texture */}
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
