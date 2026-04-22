"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Mascot from "./Mascot";
import SensoryPanel from "./SensoryPanel";
import FeedbackButton from "./FeedbackButton";
import { ZONE_META, gamesForZone } from "@/lib/state";
import type { Zone } from "@/lib/analytics";
import { track, now } from "@/lib/analytics";

const ZONES: Zone[] = ["focus", "calm", "fidget", "release"];

export default function ZoneView({ zone }: { zone: Zone }) {
  const router = useRouter();
  const sp = useSearchParams();
  const from = sp.get("from") ?? undefined;
  const [showSettings, setShowSettings] = useState(false);
  const meta = ZONE_META[zone];
  const games = gamesForZone(zone);

  useEffect(() => {
    track({ type: "zone_enter", ts: now(), zone });
  }, [zone]);

  const recommended = from?.startsWith("feel:");

  const switchZone = (z: Zone) => {
    if (z === zone) return;
    router.push(`/room/${z}?from=tab`);
  };

  return (
    <div className="relative w-full h-full flex flex-col p-4 gap-3">
      {/* zone tab bar — always visible, one tap to jump */}
      <nav className="flex gap-1 justify-between">
        {ZONES.map((z) => {
          const m = ZONE_META[z];
          const active = z === zone;
          return (
            <button
              key={z}
              onClick={() => switchZone(z)}
              className="flex-1 py-2 rounded-xl text-[11px] font-medium uppercase tracking-wider transition-colors"
              style={{
                color: active ? (m.accent as string) : "var(--fg-dim)",
                background: active ? "rgba(255,255,255,0.05)" : "transparent",
                border: active
                  ? `1px solid ${m.accent as string}`
                  : "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {m.title}
            </button>
          );
        })}
      </nav>

      <header className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/")}
            className="text-[color:var(--fg-dim)] text-lg"
            aria-label="Back"
          >
            ←
          </button>
          <div>
            <h2 className="text-lg font-medium" style={{ color: meta.accent }}>
              {meta.title}
            </h2>
            <p className="text-[11px] text-[color:var(--fg-dim)] leading-tight">
              {meta.blurb}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="br-btn text-xs"
          aria-label="Sensory settings"
        >
          ⚙
        </button>
      </header>

      {recommended && (
        <div
          className="br-card p-2.5 text-[11px] flex items-center gap-2"
          style={{ borderColor: meta.accent as string }}
        >
          <span style={{ color: meta.accent as string }}>●</span>
          <span className="text-[color:var(--fg-dim)]">
            Recommended for how you said you feel.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {games.map((g) => (
          <motion.div
            key={g.id}
            whileTap={{ scale: 0.98 }}
            className="br-card p-3 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium">{g.title}</div>
              <div className="text-[11px] text-[color:var(--fg-dim)] mt-0.5 leading-snug">
                {g.blurb}
              </div>
              <div className="text-[9px] uppercase tracking-widest text-[color:var(--fg-dim)] mt-1">
                ~{g.durationHintSec}s
              </div>
            </div>
            <Link
              href={`/room/play/${g.id}?from=${encodeURIComponent(from ?? "zone")}`}
              className="br-btn text-xs shrink-0"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              Play
            </Link>
          </motion.div>
        ))}
        {games.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <Mascot size={72} mood="sleepy" />
            <p className="text-xs text-[color:var(--fg-dim)]">No items yet.</p>
          </div>
        )}
      </div>

      {showSettings && <SensoryPanel onClose={() => setShowSettings(false)} />}

      <FeedbackButton context={{ screen: `zone/${zone}`, zone }} />
    </div>
  );
}
