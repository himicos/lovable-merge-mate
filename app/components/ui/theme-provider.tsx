
"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(theme);
    
    // Update custom properties
    if (theme === 'dark') {
      document.documentElement.style.setProperty('--app-background', '#121212');
      document.documentElement.style.setProperty('--app-card', '#1E1E1E');
      document.documentElement.style.setProperty('--app-accent', '#444444');
      document.documentElement.style.setProperty('--app-highlight', '#666666');
      document.documentElement.style.setProperty('--app-text-primary', '#EEEEEE');
      document.documentElement.style.setProperty('--app-text-secondary', '#AAAAAA');
    } else {
      document.documentElement.style.setProperty('--app-background', '#f5f8f0');
      document.documentElement.style.setProperty('--app-card', '#ffffff');
      document.documentElement.style.setProperty('--app-accent', '#6b8e23');
      document.documentElement.style.setProperty('--app-highlight', '#F1F1F1'); // Updated to light gray
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    toggleTheme: () => {
      setTheme((prevTheme) => {
        const newTheme = prevTheme === "light" ? "dark" : "light";
        localStorage.setItem(storageKey, newTheme);
        return newTheme;
      });
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
