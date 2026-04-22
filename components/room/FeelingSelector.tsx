"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Mascot from "./Mascot";
import FeedbackButton from "./FeedbackButton";
import { FEELINGS, ZONE_META } from "@/lib/state";
import { track, now, type Feeling, type Zone } from "@/lib/analytics";

const STORAGE_KEY = "bryom-room-last-feeling";

export default function FeelingSelector() {
  const router = useRouter();
  const [picked, setPicked] = useState<Feeling | null>(null);
  const zonesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    track({ type: "room_enter", ts: now() });
  }, []);

  const handleFeeling = (feeling: Feeling) => {
    const option = FEELINGS.find((f) => f.id === feeling);
    if (!option) return;
    setPicked(feeling);
    try {
      localStorage.setItem(STORAGE_KEY, feeling);
    } catch {}
    setTimeout(() => {
      router.push(`/room/${option.recommendedZone}?from=feel:${feeling}`);
    }, 420);
  };

  const handleZone = (z: Zone) => {
    router.push(`/room/${z}?from=direct`);
  };

  const scrollToZones = () => {
    zonesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center px-4 pt-7 pb-6 gap-4 overflow-y-auto">
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.2em] text-[color:var(--fg-dim)]">
        Playtest build
      </div>

      <div className="flex flex-col items-center gap-1.5 text-center">
        <Mascot size={92} mood="idle" />
        <h1 className="text-xl font-medium leading-tight mt-1">
          How are you feeling?
        </h1>
        <p className="text-[11px] text-[color:var(--fg-dim)] max-w-[260px]">
          Pick the closest one. I&apos;ll suggest a zone.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 w-full">
        {FEELINGS.map((f) => {
          const isPicked = picked === f.id;
          const zone = ZONE_META[f.recommendedZone];
          return (
            <motion.button
              key={f.id}
              onClick={() => handleFeeling(f.id)}
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
                className="text-[9px] uppercase tracking-widest mt-1 opacity-80"
                style={{ color: zone.accent as string }}
              >
                → {zone.title}
              </div>
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={scrollToZones}
        className="text-[11px] text-[color:var(--fg-dim)] underline underline-offset-4 mt-1"
      >
        Or pick a zone directly ↓
      </button>

      <div
        ref={zonesRef}
        className="w-full flex flex-col gap-2 pt-2 border-t border-white/5 mt-2"
      >
        <div className="text-[10px] uppercase tracking-widest text-[color:var(--fg-dim)] text-center pt-1">
          Zones
        </div>
        <div className="grid grid-cols-2 gap-2 w-full">
          {(["focus", "calm", "fidget", "release"] as Zone[]).map((z) => {
            const m = ZONE_META[z];
            return (
              <motion.button
                key={z}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleZone(z)}
                className="br-card p-3 text-left active:bg-white/10"
                style={{ borderLeft: `3px solid ${m.accent as string}` }}
              >
                <div
                  className="text-sm font-medium"
                  style={{ color: m.accent as string }}
                >
                  {m.title}
                </div>
                <div className="text-[11px] text-[color:var(--fg-dim)] mt-0.5 leading-snug">
                  {m.blurb}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <FeedbackButton context={{ screen: "entry" }} />
    </div>
  );
}
