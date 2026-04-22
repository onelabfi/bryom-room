"use client";

export function isLandscape(): boolean {
  if (typeof window === "undefined") return true;
  return window.innerWidth >= window.innerHeight;
}

export async function tryLockLandscape(): Promise<void> {
  if (typeof window === "undefined") return;
  const orientation = (screen as unknown as {
    orientation?: { lock?: (o: string) => Promise<void> };
  }).orientation;
  try {
    await orientation?.lock?.("landscape");
  } catch {
    // Not supported on iOS Safari or without fullscreen — handled by RotatePrompt.
  }
}

export function haptic(ms = 10) {
  if (typeof navigator === "undefined") return;
  navigator.vibrate?.(ms);
}
