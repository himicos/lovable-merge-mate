
"use client";

import { Mic } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AIVoiceInputProps {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  visualizerBars?: number;
  demoMode?: boolean;
  demoInterval?: number;
  className?: string;
  size?: "default" | "large";
}

export function AIVoiceInput({
  onStart,
  onStop,
  visualizerBars = 48,
  demoMode = false,
  demoInterval = 3000,
  className,
  size = "default"
}: AIVoiceInputProps) {
  const [submitted, setSubmitted] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isDemo, setIsDemo] = useState(demoMode);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (submitted) {
      onStart?.();
      intervalId = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      onStop?.(time);
      setTime(0);
    }

    return () => clearInterval(intervalId);
  }, [submitted, time, onStart, onStop]);

  useEffect(() => {
    if (!isDemo) return;

    let timeoutId: NodeJS.Timeout;
    const runAnimation = () => {
      setSubmitted(true);
      timeoutId = setTimeout(() => {
        setSubmitted(false);
        timeoutId = setTimeout(runAnimation, 1000);
      }, demoInterval);
    };

    const initialTimeout = setTimeout(runAnimation, 100);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, [isDemo, demoInterval]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClick = () => {
    if (isDemo) {
      setIsDemo(false);
      setSubmitted(false);
    } else {
      setSubmitted((prev) => !prev);
    }
  };

  const buttonSize = size === "large" ? "w-24 h-24" : "w-16 h-16";
  const iconSize = size === "large" ? "w-10 h-10" : "w-6 h-6";
  const spinnerSize = size === "large" ? "w-10 h-10" : "w-6 h-6";
  const visualizerWidth = size === "large" ? "w-80" : "w-64";
  const textSize = size === "large" ? "text-base" : "text-sm";
  const labelSize = size === "large" ? "text-sm" : "text-xs";

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-3">
        <button
          className={cn(
            `group ${buttonSize} rounded-xl flex items-center justify-center transition-colors relative overflow-hidden`,
            submitted
              ? "bg-none"
              : "bg-none hover:bg-[hsl(var(--accent))]/10"
          )}
          type="button"
          onClick={handleClick}
        >
          {/* Add glow effect on hover */}
          {!submitted && (
            <div className="absolute -inset-1 bg-[hsl(var(--accent))]/0 group-hover:bg-[hsl(var(--accent))]/20 rounded-xl blur-md transition-all duration-500 group-hover:duration-200"></div>
          )}
          
          {submitted ? (
            <div
              className={`${spinnerSize} rounded-sm animate-spin bg-[hsl(var(--accent))] cursor-pointer pointer-events-auto`}
              style={{ animationDuration: "3s" }}
            />
          ) : (
            <Mic className={`${iconSize} text-[hsl(var(--accent))]`} />
          )}
        </button>

        <span
          className={cn(
            `font-mono ${textSize} transition-opacity duration-300`,
            submitted
              ? "text-[hsl(var(--accent))]"
              : "text-[hsl(var(--accent))]/50"
          )}
        >
          {formatTime(time)}
        </span>

        <div className={`h-6 ${visualizerWidth} flex items-center justify-center gap-0.5`}>
          {[...Array(visualizerBars)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full transition-all duration-300",
                submitted
                  ? "bg-[hsl(var(--accent))] animate-pulse"
                  : "bg-[hsl(var(--accent))]/30 h-1"
              )}
              style={
                submitted && isClient
                  ? {
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                    }
                  : undefined
              }
            />
          ))}
        </div>

        <p className={`h-5 ${labelSize} text-[hsl(var(--accent))]`}>
          {submitted ? "Listening..." : "Click to speak"}
        </p>
      </div>
    </div>
  );
}
