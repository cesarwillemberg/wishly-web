"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

export type ThemeChoice = "system" | "light" | "dark";

const STORAGE_KEY = "wishly_theme";
const EVENT = "wishly-theme";

function isTheme(value: string | null): value is ThemeChoice {
  return value === "system" || value === "light" || value === "dark";
}

export function applyTheme(theme: ThemeChoice) {
  const dark =
    theme === "dark" ||
    (theme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
}

function subscribe(onStoreChange: () => void) {
  const notify = () => onStoreChange();
  window.addEventListener("storage", notify);
  window.addEventListener(EVENT, notify);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(EVENT, notify);
    media.removeEventListener("change", notify);
  };
}

function readTheme(): ThemeChoice {
  const saved = localStorage.getItem(STORAGE_KEY);
  return isTheme(saved) ? saved : "system";
}

function setTheme(theme: ThemeChoice) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(new Event(EVENT));
}

const ThemeContext = createContext<{ theme: ThemeChoice; setTheme: (theme: ThemeChoice) => void }>({
  theme: "system",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore<ThemeChoice>(subscribe, readTheme, () => "system");

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem("wishly_theme");var dark=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);var root=document.documentElement;root.classList.toggle("dark",dark);root.style.colorScheme=dark?"dark":"light";root.dataset.theme=t==="light"||t==="dark"||t==="system"?t:"system";}catch(e){}})();`;
