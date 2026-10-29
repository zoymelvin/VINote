"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
type Ctx = { theme: Theme; setTheme: (t: Theme) => void; accent: string; setAccent: (a: string) => void };
const ThemeCtx = createContext<Ctx>({ theme: "system", setTheme: () => {}, accent: "indigo", setAccent: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => (typeof window !== "undefined" ? ((localStorage.getItem("vinote-theme") as Theme) || "system") : "system"));
  const [accent, setAccentState] = useState(() => (typeof window !== "undefined" ? (localStorage.getItem("vinote-accent") || "indigo") : "indigo"));
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const dark =
        theme === "dark" ||
        (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.classList.toggle("dark", dark);
      root.dataset.accent = accent;
      root.dataset.theme = theme;
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme, accent]);
  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("vinote-theme", t);
  };
  const setAccent = (a: string) => {
    setAccentState(a);
    localStorage.setItem("vinote-accent", a);
  };
  return <ThemeCtx.Provider value={{ theme, setTheme, accent, setAccent }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}
