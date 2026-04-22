import type { Zone, Feeling } from "./analytics";

export interface FeelingOption {
  id: Feeling;
  label: string;
  hint: string;
  recommendedZone: Zone;
}

/**
 * Maps user-reported feelings to a recommended zone.
 * Core of the product: state-first, not content-first.
 */
export const FEELINGS: FeelingOption[] = [
  {
    id: "overwhelmed",
    label: "Overwhelmed",
    hint: "Too much input. Slow it down.",
    recommendedZone: "calm",
  },
  {
    id: "restless",
    label: "Restless",
    hint: "Energy with nowhere to go.",
    recommendedZone: "fidget",
  },
  {
    id: "foggy",
    label: "Foggy",
    hint: "Can't get started. Warm up the brain.",
    recommendedZone: "focus",
  },
  {
    id: "tense",
    label: "Tense",
    hint: "Pressure that wants out.",
    recommendedZone: "release",
  },
  {
    id: "flat",
    label: "Flat",
    hint: "Numb or low. Gentle activation.",
    recommendedZone: "focus",
  },
  {
    id: "ok",
    label: "Just browsing",
    hint: "Pick any zone.",
    recommendedZone: "focus",
  },
];

export const ZONE_META: Record<
  Zone,
  { title: string; blurb: string; accent: string; enabled: boolean }
> = {
  focus: {
    title: "Focus",
    blurb: "Warm up attention without pressure.",
    accent: "var(--accent-focus)",
    enabled: true,
  },
  calm: {
    title: "Calm",
    blurb: "Lower the volume of the nervous system.",
    accent: "var(--accent-calm)",
    enabled: true,
  },
  fidget: {
    title: "Fidget",
    blurb: "Somewhere for the hands to go.",
    accent: "var(--accent-fidget)",
    enabled: true,
  },
  release: {
    title: "Release",
    blurb: "Move the pressure out. Auto cooldown after.",
    accent: "var(--accent-release)",
    enabled: true,
  },
};

export interface GameMeta {
  id: string;
  title: string;
  blurb: string;
  zone: Zone;
  durationHintSec: number;
}

export const GAMES: GameMeta[] = [
  // Focus
  {
    id: "trail-runner",
    title: "Trail Runner",
    blurb: "Run with the reindeer. Dodge dark. Collect light.",
    zone: "focus",
    durationHintSec: 60,
  },
  {
    id: "orb-matcher",
    title: "Orb Matcher",
    blurb: "Swap orbs to line up three or more. No timer.",
    zone: "focus",
    durationHintSec: 180,
  },
  {
    id: "sequence-tap",
    title: "Sequence Tap",
    blurb: "Watch the pattern. Repeat it back.",
    zone: "focus",
    durationHintSec: 120,
  },
  // Release
  {
    id: "troll-blaster",
    title: "Troll Blaster",
    blurb: "Aim, release, dissolve dark trolls.",
    zone: "release",
    durationHintSec: 90,
  },
  {
    id: "smash-field",
    title: "Smash Field",
    blurb: "Shatter glowing shards. Capped at 90 seconds.",
    zone: "release",
    durationHintSec: 90,
  },
  {
    id: "pulse-burst",
    title: "Pulse Burst",
    blurb: "Tap the beat. It builds, then winds down.",
    zone: "release",
    durationHintSec: 75,
  },
  // Calm
  {
    id: "breathing-light",
    title: "Breathing Light",
    blurb: "A slow pulse to breathe with.",
    zone: "calm",
    durationHintSec: 240,
  },
  {
    id: "flow-lines",
    title: "Flow Lines",
    blurb: "Drifting ribbons. Tap to nudge them.",
    zone: "calm",
    durationHintSec: 240,
  },
  {
    id: "rain-field",
    title: "Rain Field",
    blurb: "Quiet light rain. Tap to ripple.",
    zone: "calm",
    durationHintSec: 240,
  },
  // Fidget
  {
    id: "pop-grid",
    title: "Pop Grid",
    blurb: "Bubbles that pop. They come back.",
    zone: "fidget",
    durationHintSec: 180,
  },
  {
    id: "spinner",
    title: "Spinner",
    blurb: "Flick it. Watch it slow.",
    zone: "fidget",
    durationHintSec: 120,
  },
  {
    id: "pattern-drawer",
    title: "Pattern Drawer",
    blurb: "Draw. It mirrors four ways.",
    zone: "fidget",
    durationHintSec: 180,
  },
];

export function gamesForZone(z: Zone): GameMeta[] {
  return GAMES.filter((g) => g.zone === z);
}

export function gameById(id: string): GameMeta | undefined {
  return GAMES.find((g) => g.id === id);
}
