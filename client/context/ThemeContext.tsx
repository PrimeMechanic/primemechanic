import React, { createContext, useContext, useState, ReactNode } from "react";
import { useColorScheme } from "react-native";
import { Colors, ThemeColors } from "@/constants/theme";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("system");

  const isDark = mode === "system" 
    ? systemColorScheme === "dark" 
    : mode === "dark";

  const colors = isDark ? Colors.dark : Colors.light;

  const toggleTheme = () => {
    setMode((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "light";
      return isDark ? "light" : "dark";
    });
  };

  return (
    <ThemeContext.Provider value={{ mode, isDark, colors, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
