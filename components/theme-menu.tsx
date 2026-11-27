"use client";

import { Contrast } from "lucide-react";

import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme, type ThemeChoice } from "@/components/theme-provider";

const OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
];

export function ThemeMenu({ onDark = true }: { onDark?: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <Menu>
      <MenuTrigger
        aria-label="Aparência"
        className={
          onDark
            ? "grid size-12 cursor-pointer place-items-center rounded-lg text-brand-cream outline-none hover:bg-white/10 focus-visible:ring-[1.4px] focus-visible:ring-accent"
            : "grid size-12 cursor-pointer place-items-center rounded-lg text-ink outline-none hover:bg-accent/10 focus-visible:ring-[1.4px] focus-visible:ring-accent"
        }
      >
        <Contrast className="size-5" />
      </MenuTrigger>
      <MenuContent>
        {OPTIONS.map((option) => (
          <MenuItem key={option.value} onSelect={() => setTheme(option.value)}>
            <span className={option.value === theme ? "font-bold" : undefined}>{option.label}</span>
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}

export function ThemeChoiceControl() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Aparência"
      className="grid grid-cols-3 gap-1 rounded-lg border border-line bg-surface p-1"
    >
      {OPTIONS.map((option) => {
        const selected = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(option.value)}
            className={
              selected
                ? "h-12 cursor-pointer rounded-md bg-accent text-sm font-semibold text-white"
                : "h-12 cursor-pointer rounded-md text-sm font-semibold text-ink"
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
