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
        "fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background transition-opacity duration-1000",
        intensityMap[variant],
        className
      )}
    >
      {/* Animated Gradients / Ambient Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-info/10 blur-[140px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-success/5 blur-[100px] animate-pulse [animation-delay:4s]" />
      </div>

      {/* Floating Shapes - CSS-only lightweight elements */}
      {variant !== "subtle" && (
        <>
          <div className="absolute top-[15%] left-[10%] w-64 h-64 border border-primary/5 rounded-full animate-[spin_60s_linear_infinite]" />
          <div className="absolute bottom-[20%] right-[15%] w-80 h-80 border border-info/5 rounded-full animate-[spin_80s_linear_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-[0.5px] border-border/20 rounded-full opacity-50" />
        </>
      )}

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
        }}
      />

      {/* Noise Texture for depth */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none contrast-150 brightness-100 mix-blend-overlay">
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
