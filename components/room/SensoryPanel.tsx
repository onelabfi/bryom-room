"use client";

import { useSensory, type Motion } from "@/lib/sensory";

export default function SensoryPanel({ onClose }: { onClose: () => void }) {
  const { volume, motion, haptics, warmTint, setVolume, setMotion, setHaptics, setWarm } =
    useSensory();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
      <div className="br-card w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Sensory settings</h3>
          <button className="text-[color:var(--fg-dim)]" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <Row label="Volume">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-40"
          />
        </Row>

        <Row label="Motion">
          <div className="flex gap-2">
            {(["low", "medium", "high"] as Motion[]).map((m) => (
              <button
                key={m}
                onClick={() => setMotion(m)}
                className={`br-btn text-xs ${
                  motion === m ? "!bg-white/10" : ""
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </Row>

        <Row label="Warm tint">
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={warmTint}
            onChange={(e) => setWarm(Number(e.target.value))}
            className="w-40"
          />
        </Row>

        <Row label="Haptics">
          <button
            onClick={() => setHaptics(!haptics)}
            className={`br-btn text-xs ${haptics ? "!bg-white/10" : ""}`}
          >
            {haptics ? "On" : "Off"}
          </button>
        </Row>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-[color:var(--fg-dim)]">{label}</span>
      <div>{children}</div>
    </div>
  );
}
