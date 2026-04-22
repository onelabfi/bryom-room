"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Motion = "low" | "medium" | "high";

export interface SensoryState {
  volume: number; // 0..1
  motion: Motion;
  haptics: boolean;
  warmTint: number; // 0..1
  releaseCooldown: boolean; // show 30s breathing after Release games
  setVolume: (v: number) => void;
  setMotion: (m: Motion) => void;
  setHaptics: (h: boolean) => void;
  setWarm: (w: number) => void;
  setReleaseCooldown: (b: boolean) => void;
}

export const useSensory = create<SensoryState>()(
  persist(
    (set) => ({
      volume: 0.5,
      motion: "medium",
      haptics: true,
      warmTint: 0,
      releaseCooldown: true,
      setVolume: (v) => set({ volume: clamp01(v) }),
      setMotion: (m) => set({ motion: m }),
      setHaptics: (h) => set({ haptics: h }),
      setWarm: (w) => set({ warmTint: clamp01(w) }),
      setReleaseCooldown: (b) => set({ releaseCooldown: b }),
    }),
    { name: "bryom-room-sensory" },
  ),
);

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function motionScale(m: Motion): number {
  if (m === "low") return 0.5;
  if (m === "high") return 1.2;
  return 1;
}
