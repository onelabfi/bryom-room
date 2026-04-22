"use client";

import { useState } from "react";
import { FEELINGS } from "@/lib/state";
import type { Feeling, Zone } from "@/lib/analytics";
import Mascot from "./Mascot";
import FeedbackModal from "./FeedbackModal";

export default function StateAfter({
  onPick,
  zone,
  game,
}: {
  onPick: (f: Feeling) => void;
  zone: Zone;
  game: string;
}) {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className="absolute inset-0 bg-[color:var(--bg)]/95 flex items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-4 text-center">
        <div className="flex justify-center">
          <Mascot size={64} mood="happy" />
        </div>
        <h3 className="text-lg font-medium">How do you feel now?</h3>
        <p className="text-xs text-[color:var(--fg-dim)]">
          No right answer. This helps me suggest better next time.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {FEELINGS.map((f) => (
            <button
              key={f.id}
              onClick={() => onPick(f.id)}
              className="br-btn text-sm"
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 pt-1">
          <button
            onClick={() => onPick("ok")}
            className="text-xs text-[color:var(--fg-dim)] underline underline-offset-4"
          >
            Skip
          </button>
          <button
            onClick={() => setShowFeedback(true)}
            className="text-xs text-[color:var(--fg-dim)] underline underline-offset-4"
          >
            Report something
          </button>
        </div>
      </div>
      {showFeedback && (
        <FeedbackModal
          context={{ screen: `play/${game}`, zone, game }}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
}
