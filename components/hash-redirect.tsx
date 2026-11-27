"use client";

import { useEffect } from "react";

import { pathFromLegacyHash } from "@/lib/navigation";

export function HashRedirect() {
  useEffect(() => {
    const next = pathFromLegacyHash(window.location.hash);
    if (!next) return;
    if (`${window.location.pathname}${window.location.search}` === next) return;
    window.location.replace(next);
  }, []);

  return null;
}
