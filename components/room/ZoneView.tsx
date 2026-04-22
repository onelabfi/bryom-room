"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Mascot from "./Mascot";
import SensoryPanel from "./SensoryPanel";
import { ZONE_META, gamesForZone } from "@/lib/state";
import type { Zone } from "@/lib/analytics";
import { track, now } from "@/lib/analytics";

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

  if (!meta.enabled) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
        <Mascot size={80} mood="sleepy" />
        <h2 className="text-xl font-medium">{meta.title} is coming soon</h2>
        <p className="text-sm text-[color:var(--fg-dim)] max-w-sm">{meta.blurb}</p>
        <button className="br-btn" onClick={() => router.push("/")}>
          Back
        </button>
      </div>
    );
  }

  const recommended = from?.startsWith("feel:");

  return (
    <div className="w-full h-full flex flex-col p-5 gap-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="text-[color:var(--fg-dim)] text-xl"
            aria-label="Back"
          >
            ←
          </button>
          <div>
            <h2
              className="text-xl font-medium"
              style={{ color: meta.accent }}
            >
              {meta.title}
            </h2>
            <p className="text-xs text-[color:var(--fg-dim)]">{meta.blurb}</p>
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
          className="br-card p-3 text-xs flex items-center gap-2"
          style={{ borderColor: meta.accent as string }}
        >
          <span style={{ color: meta.accent as string }}>●</span>
          <span className="text-[color:var(--fg-dim)]">
            Recommended because of how you said you feel.
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 flex-1">
        {games.map((g) => (
          <motion.div
            key={g.id}
            whileTap={{ scale: 0.97 }}
            className="br-card p-4 flex flex-col justify-between"
          >
            <div>
              <div className="text-base font-medium">{g.title}</div>
              <div className="text-xs text-[color:var(--fg-dim)] mt-1">{g.blurb}</div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] uppercase tracking-wider text-[color:var(--fg-dim)]">
                ~{g.durationHintSec}s
              </span>
              <Link
                href={`/room/play/${g.id}?from=${encodeURIComponent(from ?? "zone")}`}
                className="br-btn text-xs"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                Play
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {showSettings && <SensoryPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
