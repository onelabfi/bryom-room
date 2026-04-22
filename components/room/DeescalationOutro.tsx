"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * 30s breathing-light outro after any Release game.
 * Mandatory first 10s, skippable after.
 */
export default function DeescalationOutro({ onDone }: { onDone: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const TOTAL = 30;
  const MIN_BEFORE_SKIP = 5;

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (elapsed >= TOTAL) onDone();
  }, [elapsed, onDone]);

  const canSkip = elapsed >= MIN_BEFORE_SKIP;

  return (
    <div className="absolute inset-0 bg-[color:var(--bg)] flex flex-col items-center justify-center gap-8">
      <motion.div
        initial={{ scale: 0.7, opacity: 0.5 }}
        animate={{ scale: [0.7, 1.3, 0.7], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="w-40 h-40 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(95,168,211,0.55) 0%, rgba(95,168,211,0) 70%)",
        }}
      />
      <div className="text-center space-y-1">
        <p className="text-base">Breathe</p>
        <p className="text-xs text-[color:var(--fg-dim)]">
          In on the swell, out on the fade.
        </p>
      </div>
      <button
        onClick={onDone}
        disabled={!canSkip}
        className="br-btn text-xs disabled:opacity-30"
      >
        {canSkip ? "I'm ready" : `Wait… ${MIN_BEFORE_SKIP - elapsed}s`}
      </button>
    </div>
  );
}
