"use client";

import { useState } from "react";
import FeedbackModal, { type FeedbackContext } from "./FeedbackModal";

/**
 * Small floating pill used on entry + zone screens so playtesters can
 * always leave a note. Intentionally subtle — doesn't interrupt the
 * design, doesn't appear during gameplay.
 */
export default function FeedbackButton({ context }: { context: FeedbackContext }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute bottom-3 right-3 z-[50] text-[10px] uppercase tracking-widest text-[color:var(--fg-dim)] bg-black/30 hover:bg-black/50 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur"
        aria-label="Send feedback"
      >
        Feedback
      </button>
      {open && (
        <FeedbackModal context={context} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
