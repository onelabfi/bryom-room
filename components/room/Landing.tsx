"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Mascot from "./Mascot";

/**
 * App landing — short intro + Enter button. Always visible on '/'.
 * Intentionally minimal so the Bryom skin can take over the visuals
 * without restructuring layout.
 */
export default function Landing() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between px-6 pt-10 pb-8 text-center">
      <div className="text-[9px] uppercase tracking-[0.2em] text-[color:var(--fg-dim)]">
        Playtest build
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-5"
      >
        <Mascot size={140} mood="idle" />

        <div className="space-y-1.5">
          <h1 className="text-3xl font-medium tracking-tight">Bryom Room</h1>
          <p className="text-sm text-[color:var(--fg-dim)]">
            A room for your nervous system.
          </p>
        </div>

        <div className="text-[13px] text-[color:var(--fg)]/85 leading-relaxed max-w-[280px] space-y-2.5">
          <p>
            Four zones — <span className="text-[color:var(--accent-focus)]">Focus</span>,{" "}
            <span className="text-[color:var(--accent-calm)]">Calm</span>,{" "}
            <span className="text-[color:var(--accent-fidget)]">Fidget</span>,{" "}
            <span className="text-[color:var(--accent-release)]">Release</span>.
          </p>
          <p className="text-[color:var(--fg-dim)]">
            Tell the room how you feel. It picks a zone for you.
          </p>
          <p className="text-[color:var(--fg-dim)]">
            No scores. No streaks. Nothing to lose.
          </p>
        </div>
      </motion.div>

      <div className="flex flex-col items-center gap-4 w-full">
        <Link
          href="/room"
          className="br-btn text-base px-10 py-3"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          Enter →
        </Link>
        <p className="text-[10px] text-[color:var(--fg-dim)] max-w-[260px] leading-snug">
          Made for neurodivergent minds. Part of Bryom.
        </p>
      </div>
    </div>
  );
}
