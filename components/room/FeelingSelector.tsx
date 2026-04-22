"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Mascot from "./Mascot";
import { FEELINGS, ZONE_META } from "@/lib/state";
import { track, now, type Feeling } from "@/lib/analytics";

const STORAGE_KEY = "bryom-room-last-feeling";

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
    <div className="w-full h-full flex flex-col items-center justify-center px-6 py-4 gap-5">
      <div className="flex items-center gap-3">
        <Mascot size={64} mood="idle" />
        <div>
          <h1 className="text-2xl font-medium leading-tight">How are you feeling?</h1>
          <p className="text-sm text-[color:var(--fg-dim)]">
            Pick the closest one. I&apos;ll suggest a zone.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-3xl">
        {FEELINGS.map((f) => {
          const isPicked = picked === f.id;
          const zone = ZONE_META[f.recommendedZone];
          return (
            <motion.button
              key={f.id}
              onClick={() => handlePick(f.id)}
              whileTap={{ scale: 0.96 }}
              animate={
                isPicked
                  ? { scale: 1.04, borderColor: zone.accent }
                  : { scale: 1 }
              }
              className="br-card p-4 text-left hover:bg-white/5 active:bg-white/10"
              style={{
                borderColor: isPicked ? (zone.accent as string) : undefined,
              }}
            >
              <div className="text-base font-medium">{f.label}</div>
              <div className="text-xs text-[color:var(--fg-dim)] mt-1">{f.hint}</div>
              <div
                className="text-[10px] uppercase tracking-wider mt-2 opacity-70"
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
        className="text-xs text-[color:var(--fg-dim)] underline underline-offset-4"
      >
        Skip — let me pick a zone myself
      </button>
    </div>
  );
}
