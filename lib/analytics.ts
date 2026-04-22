"use client";

/**
 * Bryom Room analytics event bus.
 *
 * Events:
 *   room_enter      — user entered the room landing
 *   zone_enter      — user entered a zone (focus/calm/fidget/release)
 *   game_start      — game scene booted
 *   game_end        — game scene ended (completed, exited, or timed out)
 *   state_after     — user reported how they feel after a game
 *
 * When Bryom mounts this app, they call setAnalyticsHandler() with their
 * own pipeline. Until then, events are no-ops in production and logged in dev.
 */

export type RoomEvent =
  | { type: "room_enter"; ts: number; from?: string }
  | { type: "zone_enter"; ts: number; zone: Zone }
  | {
      type: "game_start";
      ts: number;
      zone: Zone;
      game: string;
      recommended: boolean;
    }
  | {
      type: "game_end";
      ts: number;
      zone: Zone;
      game: string;
      durationMs: number;
      completed: boolean;
      reason: "finished" | "exited" | "timeout";
    }
  | {
      type: "state_after";
      ts: number;
      zone: Zone;
      game: string;
      feeling: Feeling;
    };

export type Zone = "focus" | "calm" | "fidget" | "release";
export type Feeling =
  | "overwhelmed"
  | "restless"
  | "foggy"
  | "tense"
  | "flat"
  | "ok";

type Handler = (e: RoomEvent) => void;

let handler: Handler | null = null;

export function setAnalyticsHandler(h: Handler | null) {
  handler = h;
}

export function track(e: RoomEvent) {
  if (handler) {
    try {
      handler(e);
    } catch {
      // swallow — analytics must never crash the room
    }
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("[room]", e.type, e);
  }
}

export function now() {
  return Date.now();
}
