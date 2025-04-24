import * as React from "react"
import { cn } from "@/lib/utils"

export interface BalloonsRef {
  launchAnimation: () => void
}

export interface BalloonsProps {
  type?: "default" | "text"
  text?: string
  fontSize?: number
  color?: string
  className?: string
  onLaunch?: () => void
}

const Balloons = React.forwardRef<BalloonsRef, BalloonsProps>(
  ({ type = "default", text = "", fontSize = 60, color = "#66bb6a", className, onLaunch }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null)
    
    const launchAnimation = React.useCallback(() => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const count = type === "default" ? 10 : 5;
      
      for (let i = 0; i < count; i++) {
        const emoji = document.createElement("div");
        emoji.textContent = text;
        emoji.style.position = "fixed";
        emoji.style.fontSize = `${fontSize}px`;
        emoji.style.color = color;
        emoji.style.left = `${Math.random() * 100}vw`;
        emoji.style.bottom = "-100px";
        emoji.style.zIndex = "9999";
        emoji.style.pointerEvents = "none";
        emoji.style.transition = "all 1s cubic-bezier(0.4, 0, 0.2, 1)";
        container.appendChild(emoji);

        // Random delay for more natural effect
        setTimeout(() => {
          emoji.style.transform = `translateY(-${window.innerHeight + 200}px) rotate(${Math.random() * 360}deg)`;
          emoji.style.opacity = "0";
          
          // Cleanup
          setTimeout(() => {
            container.removeChild(emoji);
          }, 2000);
        }, Math.random() * 500);
      }
      
      if (onLaunch) {
        onLaunch();
      }
    }, [type, text, fontSize, color, onLaunch]);

    React.useImperativeHandle(ref, () => ({
      launchAnimation
    }), [launchAnimation]);

    return <div ref={containerRef} className={cn("fixed inset-0 pointer-events-none", className)} />
  }
);

Balloons.displayName = "Balloons";

export { Balloons }
