"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : -100}px)`,
        transition: "all 0.2s ease-in-out",
      }}
      className={cn(
        "flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-verby-dark/10 rounded-full bg-white/80 backdrop-blur-md shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] pr-2 pl-8 py-2 items-center justify-center space-x-4",
        className
      )}
    >
      {navItems.map((navItem, idx) => (
        <Link
          key={`link=${idx}`}
          href={navItem.link}
          className={cn(
            "relative text-verby-dark items-center flex space-x-1 hover:text-verby-primary transition-colors"
          )}
        >
          <span className="block sm:hidden">{navItem.icon}</span>
          <span className="hidden sm:block text-sm">{navItem.name}</span>
        </Link>
      ))}
      <button className="border text-sm font-medium relative border-verby-dark/10 text-verby-dark px-4 py-2 rounded-full hover:bg-verby-primary hover:text-white hover:border-verby-primary transition-all duration-200">
        <span>Get Started</span>
        <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-verby-primary to-transparent h-px" />
      </button>
    </div>
  );
};
