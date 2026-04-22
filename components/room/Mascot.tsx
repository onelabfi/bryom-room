"use client";

import { motion } from "framer-motion";

/**
 * ⚠ PLACEHOLDER — REPLACE WITH BRYOM SKIN.
 *
 * This SVG reindeer exists only so the room works end-to-end before
 * Bryom's official art arrives. Every graphic in the room is meant to
 * be swapped for the Bryom visual system (mascot, zone colors, icons,
 * game sprites). To swap the mascot:
 *
 *   1. Drop the Bryom reindeer sprite pack into `/public/assets/reindeer/`.
 *   2. Replace the SVG below with an <Image> (or <img>) pointing at the
 *      sprite for the requested `mood` prop.
 *   3. Keep the `size` and `mood` props — callers depend on them.
 *
 * Other graphics to swap when the skin arrives:
 *   - Game sprites in `games/focus/*` and `games/release/*`
 *     (currently primitive shapes via scene.add.circle/rectangle).
 *   - Zone accent colors in `lib/state.ts` (ZONE_META[zone].accent).
 *   - Background tokens in `app/globals.css` (--bg, --bg-soft, --accent-*).
 */
export default function Mascot({
  size = 120,
  mood = "idle",
}: {
  size?: number;
  mood?: "idle" | "happy" | "sleepy" | "cheer";
}) {
  const bob =
    mood === "sleepy"
      ? { y: [0, 1, 0], transition: { duration: 3.5, repeat: Infinity } }
      : mood === "cheer"
      ? { y: [0, -4, 0], transition: { duration: 0.6, repeat: Infinity } }
      : { y: [0, -2, 0], transition: { duration: 2.2, repeat: Infinity } };

  return (
    <motion.div
      animate={bob}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 120 120" width={size} height={size}>
        {/* antlers */}
        <path
          d="M38 28 Q30 14 22 16 M38 28 Q34 18 28 10 M38 28 Q40 16 46 12"
          stroke="#b88a5b"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M82 28 Q90 14 98 16 M82 28 Q86 18 92 10 M82 28 Q80 16 74 12"
          stroke="#b88a5b"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        {/* head */}
        <ellipse cx="60" cy="56" rx="32" ry="28" fill="#c9a77a" />
        {/* snout */}
        <ellipse cx="60" cy="74" rx="16" ry="12" fill="#e8d1ab" />
        {/* nose */}
        <circle cx="60" cy="72" r="5" fill="#c14a4a" />
        {/* eyes */}
        <circle cx="48" cy="54" r="3.2" fill="#1a1a1a" />
        <circle cx="72" cy="54" r="3.2" fill="#1a1a1a" />
        <circle cx="49" cy="53" r="1" fill="#fff" />
        <circle cx="73" cy="53" r="1" fill="#fff" />
        {/* ears */}
        <ellipse cx="30" cy="46" rx="6" ry="10" fill="#b08a5e" transform="rotate(-30 30 46)" />
        <ellipse cx="90" cy="46" rx="6" ry="10" fill="#b08a5e" transform="rotate(30 90 46)" />
        {/* body hint (tiny) */}
        <ellipse cx="60" cy="100" rx="22" ry="12" fill="#c9a77a" opacity="0.7" />
      </svg>
    </motion.div>
  );
}
