"use client";

import { useState } from "react";
import { getSessionMeta } from "@/lib/analytics";

export interface FeedbackContext {
  screen: string;
  zone?: string;
  game?: string;
}

export default function FeedbackModal({
  context,
  onClose,
}: {
  context: FeedbackContext;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit() {
    if (!text.trim() || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          screen: context.screen,
          zone: context.zone,
          game: context.game,
          meta: getSessionMeta(),
        }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("sent");
      setTimeout(onClose, 1200);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9998] bg-black/60 flex items-center justify-center p-5"
      onClick={onClose}
    >
      <div
        className="br-card w-full max-w-md p-5 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium">What felt off?</h3>
          <button
            onClick={onClose}
            className="text-[color:var(--fg-dim)]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Anything — confusing, too fast, flashing, boring, loved it…"
          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-[color:var(--fg)] placeholder:text-[color:var(--fg-dim)] min-h-[100px] focus:outline-none focus:ring-1 focus:ring-white/20"
          rows={4}
          disabled={status === "sending" || status === "sent"}
        />
        <p className="text-[10px] text-[color:var(--fg-dim)]">
          Your message is sent with current screen, zone, game, device,
          and an anonymous session id. No personal info.
        </p>
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-[color:var(--fg-dim)]">
            {status === "sent" && "Noted. Thanks."}
            {status === "error" && "Couldn't send. Try again?"}
          </div>
          <button
            onClick={submit}
            disabled={!text.trim() || status === "sending" || status === "sent"}
            className="br-btn text-sm disabled:opacity-40"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            {status === "sending" ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
