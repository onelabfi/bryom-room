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
 * Every event is enriched with a stable session meta block:
 *   { sessionId, ua, viewport, platform }
 *
 * Bryom registers a handler via setAnalyticsHandler() when mounting the
 * room. Until then, events are no-ops in prod and logged in dev.
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

export interface SessionMeta {
  sessionId: string;
  ua: string;
  viewport: string;
  platform: "ios" | "android" | "desktop" | "other";
}

export interface EnrichedEvent {
  event: RoomEvent;
  meta: SessionMeta | null;
}

type Handler = (e: EnrichedEvent) => void;

let handler: Handler | null = null;
let cached: SessionMeta | null = null;

export function setAnalyticsHandler(h: Handler | null) {
  handler = h;
}

export function getSessionMeta(): SessionMeta | null {
  if (cached) return cached;
  if (typeof window === "undefined") return null;
  let id: string;
  try {
    id = localStorage.getItem("bryom-room-sid") ?? "";
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `s_${Math.random().toString(36).slice(2)}_${Date.now()}`;
      localStorage.setItem("bryom-room-sid", id);
    }
  } catch {
    id = `s_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  }
  const ua = navigator.userAgent;
  const platform: SessionMeta["platform"] = /iPhone|iPad|iPod/i.test(ua)
    ? "ios"
    : /Android/i.test(ua)
    ? "android"
    : /Macintosh|Windows|Linux/i.test(ua)
    ? "desktop"
    : "other";
  cached = {
    sessionId: id,
    ua,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    platform,
  };
  return cached;
}

export function track(e: RoomEvent) {
  const enriched: EnrichedEvent = { event: e, meta: getSessionMeta() };
  if (handler) {
    try {
      handler(enriched);
    } catch {
      // swallow — analytics must never crash the room
    }
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("[room]", e.type, enriched);
  }
}

export function now() {
  return Date.now();
}
