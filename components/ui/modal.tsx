"use client";

import { useEffect, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Modal({
  open,
  title,
  onClose,
  children,
  framed = true,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** When false, the child lays out the sticky header, scrolling body, and footer. */
  framed?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    return lockPageScroll();
  }, [open]);

  if (!open) return null;
  return (
    <div
      data-modal-root
      className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden bg-[rgb(26_20_16/0.45)] pt-[env(safe-area-inset-top)] sm:items-center sm:p-6 sm:pt-[max(1.5rem,env(safe-area-inset-top))]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[calc(100dvh-env(safe-area-inset-top)-0.75rem)] min-h-0 w-full flex-col overflow-hidden rounded-t-3xl bg-cream text-ink shadow-[0_12px_40px_rgb(0_0_0/0.25)] sm:max-h-[92dvh] sm:max-w-[460px] sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        {framed ? (
          <ModalScroll className="px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {children}
          </ModalScroll>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export function ModalScroll({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn("modal-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain", className)}
    >
      {children}
    </div>
  );
}

/** Stops the page, and any panel behind the dialog, from scrolling. */
export function lockPageScroll() {
  const root = document.documentElement;
  const previousOverflow = root.style.overflow;
  root.dataset.modalOpen = "true";
  root.style.overflow = "hidden";
  const locked: { element: HTMLElement; overflow: string }[] = [];
  document.querySelectorAll<HTMLElement>("body *").forEach((element) => {
    if (element.closest("[data-modal-root]")) return;
    const overflow = getComputedStyle(element).overflowY;
    if (overflow !== "auto" && overflow !== "scroll") return;
    locked.push({ element, overflow: element.style.overflowY });
    element.style.overflowY = "hidden";
  });
  return () => {
    delete root.dataset.modalOpen;
    root.style.overflow = previousOverflow;
    for (const entry of locked) entry.element.style.overflowY = entry.overflow;
  };
}
