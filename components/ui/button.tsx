import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[1.4px] focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-55 [&_svg]:pointer-events-none [&_svg]:size-5 shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-accent text-white hover:bg-accent/90",
        outline: "border border-line bg-cream text-ink hover:bg-paper",
        ghost: "bg-transparent text-ink hover:bg-accent/6",
        danger: "bg-transparent text-danger hover:bg-danger/10",
      },
      size: {
        default: "h-12 px-4",
        sm: "h-10 px-3 text-sm",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
