import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-lg border border-line bg-surface px-4 text-base text-ink outline-none placeholder:text-muted focus-visible:border-accent focus-visible:ring-[1.4px] focus-visible:ring-accent disabled:opacity-55",
        className,
      )}
      {...props}
    />
  );
}
