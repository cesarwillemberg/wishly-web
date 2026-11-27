"use client";

import { useEffect } from "react";

import {
  INTERACTION_EVENTS,
  claritySnippet,
  gtagSnippet,
  gtagSrc,
  hasAnalytics,
  metaSnippet,
  readAnalyticsIds,
} from "@/lib/analytics";

const ids = readAnalyticsIds();

function injectInline(code: string) {
  const script = document.createElement("script");
  script.text = code;
  document.head.appendChild(script);
}

function injectSrc(src: string) {
  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

function loadVendors() {
  const src = gtagSrc(ids);
  const snippet = gtagSnippet(ids);
  if (src && snippet) {
    injectSrc(src);
    injectInline(snippet);
  }
  if (ids.meta) injectInline(metaSnippet(ids.meta));
  if (ids.clarity) injectInline(claritySnippet(ids.clarity));
}

export function DeferredAnalytics() {
  useEffect(() => {
    if (!hasAnalytics(ids)) return;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      for (const type of INTERACTION_EVENTS) window.removeEventListener(type, start, true);
      loadVendors();
    };
    for (const type of INTERACTION_EVENTS) {
      window.addEventListener(type, start, { capture: true, passive: true });
    }
    return () => {
      for (const type of INTERACTION_EVENTS) window.removeEventListener(type, start, true);
    };
  }, []);

  return null;
}
