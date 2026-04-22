"use client";

import { useEffect, useState } from "react";

/**
 * On desktop browsers (>= 900px wide) wraps the app in a portrait phone
 * frame so the room can be reviewed on a laptop. On real phones, renders
 * children full-screen.
 *
 * The room is portrait everywhere — no rotation, one-handed thumb-reach.
 */
export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isDesktop) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        {children}
      </div>
    );
  }

  const w = 380;
  const h = 760;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#111418_0%,#05070a_100%)]">
      <div
        className="relative bg-[#0a0a0a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] border-[3px] border-[#1c1f24]"
        style={{
          width: w + 24,
          height: h + 24,
          borderRadius: 52,
          padding: 12,
        }}
      >
        {/* dynamic island */}
        <div
          className="absolute bg-black rounded-full z-20"
          style={{
            top: 18,
            left: "50%",
            transform: "translateX(-50%)",
            width: 90,
            height: 6,
          }}
        />
        {/* screen */}
        <div
          className="relative w-full h-full overflow-hidden bg-[color:var(--bg)]"
          style={{ borderRadius: 40 }}
        >
          {children}
        </div>
        {/* side buttons */}
        <div
          className="absolute bg-[#1c1f24] rounded-sm"
          style={{ left: -4, top: 140, width: 4, height: 60 }}
        />
        <div
          className="absolute bg-[#1c1f24] rounded-sm"
          style={{ left: -4, top: 220, width: 4, height: 40 }}
        />
      </div>
      <div className="absolute bottom-6 text-[10px] tracking-widest uppercase text-zinc-500">
        Desktop preview
      </div>
    </div>
  );
}
