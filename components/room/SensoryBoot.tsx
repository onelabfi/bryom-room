"use client";

import { useEffect } from "react";
import { useSensory } from "@/lib/sensory";

/**
 * Applies the persisted sensory settings to :root CSS vars on mount,
 * and keeps them in sync when the store changes.
 */
export default function SensoryBoot() {
  const warmTint = useSensory((s) => s.warmTint);
  const motion = useSensory((s) => s.motion);

  useEffect(() => {
    document.documentElement.style.setProperty("--warm", String(warmTint * 0.18));
  }, [warmTint]);

  useEffect(() => {
    const scale = motion === "low" ? 0.5 : motion === "high" ? 1.2 : 1;
    document.documentElement.style.setProperty("--motion", String(scale));
  }, [motion]);

  return null;
}
