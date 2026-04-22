"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Mascot from "./Mascot";
import FeedbackButton from "./FeedbackButton";
import { FEELINGS, ZONE_META } from "@/lib/state";
import { track, now, type Feeling } from "@/lib/analytics";

const STORAGE_KEY = "bryom-room-last-feeling";

/**
 * Portrait-only entry screen. Ask how the user feels, then route to the
 * recommended zone. Game and zone views run landscape; this one stays
 * vertical because it's how people hold the phone when they open an app.
 */
export default function FeelingSelector() {
  const router = useRouter();
  const [picked, setPicked] = useState<Feeling | null>(null);

  useEffect(() => {
    track({ type: "room_enter", ts: now() });
  }, []);

  const handlePick = (feeling: Feeling) => {
    const option = FEELINGS.find((f) => f.id === feeling);
    if (!option) return;
    setPicked(feeling);
    try {
      localStorage.setItem(STORAGE_KEY, feeling);
    } catch {}
    const zone = option.recommendedZone;
    setTimeout(() => {
      router.push(`/room/${zone}?from=feel:${feeling}`);
    }, 450);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center px-5 pt-8 pb-6 gap-4 overflow-y-auto">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.2em] text-[color:var(--fg-dim)]">
        Playtest build
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <Mascot size={100} mood="idle" />
        <h1 className="text-2xl font-medium leading-tight mt-1">
          How are you feeling?
        </h1>
        <p className="text-xs text-[color:var(--fg-dim)] max-w-[240px]">
          Pick the closest one. I&apos;ll suggest a zone.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm mt-2">
        {FEELINGS.map((f) => {
          const isPicked = picked === f.id;
          const zone = ZONE_META[f.recommendedZone];
          return (
            <motion.button
              key={f.id}
              onClick={() => handlePick(f.id)}
              whileTap={{ scale: 0.96 }}
              animate={
                isPicked ? { scale: 1.04, borderColor: zone.accent } : { scale: 1 }
              }
              className="br-card p-3 text-left active:bg-white/10"
              style={{
                borderColor: isPicked ? (zone.accent as string) : undefined,
              }}
            >
              <div className="text-sm font-medium">{f.label}</div>
              <div className="text-[11px] text-[color:var(--fg-dim)] mt-0.5 leading-snug">
                {f.hint}
              </div>
              <div
                className="text-[9px] uppercase tracking-widest mt-1.5 opacity-80"
                style={{ color: zone.accent as string }}
              >
                → {zone.title}
              </div>
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={() => router.push("/room/focus?from=direct")}
        className="text-[11px] text-[color:var(--fg-dim)] underline underline-offset-4 mt-2"
      >
        Skip — let me pick a zone myself
      </button>

      <FeedbackButton context={{ screen: "entry" }} />
    </div>
  );
}
