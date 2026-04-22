"use client";

import { useEffect, useState } from "react";

export default function RotatePrompt() {
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    const check = () => setPortrait(window.innerHeight > window.innerWidth);
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  if (!portrait) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[color:var(--bg)] text-center p-8">
      <div className="max-w-sm space-y-4">
        <div className="text-5xl">↻</div>
        <h2 className="text-xl font-medium">Rotate your phone</h2>
        <p className="text-[color:var(--fg-dim)] text-sm">
          Bryom Room is designed for landscape. Turn your device sideways to begin.
        </p>
      </div>
    </div>
  );
}
