"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isLandscapePath } from "@/lib/layout";

/**
 * On desktop browsers (>= 900px wide) wraps the app in a phone-shaped
 * preview frame so the room can be reviewed on a laptop. On real phones,
 * renders children full-screen.
 *
 * Orientation follows the route:
 *   "/"       → portrait (entry)
 *   "/room/*" → landscape (zones + games)
 */
export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const landscape = isLandscapePath(pathname);

  if (!isDesktop) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        {children}
      </div>
    );
  }

  const w = landscape ? 760 : 380;
  const h = landscape ? 380 : 760;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#111418_0%,#05070a_100%)]">
      <div
        className="relative bg-[#0a0a0a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] border-[3px] border-[#1c1f24]"
        style={{
          width: w + 24,
          height: h + 24,
          borderRadius: 52,
          padding: 12,
          transition: "width 0.55s cubic-bezier(.5,.1,.3,1), height 0.55s cubic-bezier(.5,.1,.3,1)",
        }}
      >
        {/* dynamic island / notch */}
        <div
          className="absolute bg-black rounded-full z-20"
          style={
            landscape
              ? { top: "50%", transform: "translateY(-50%)", left: 20, width: 6, height: 90 }
              : { top: 18, left: "50%", transform: "translateX(-50%)", width: 90, height: 6 }
          }
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
          style={
            landscape
              ? { top: -4, left: 140, width: 60, height: 4 }
              : { left: -4, top: 140, width: 4, height: 60 }
          }
        />
        <div
          className="absolute bg-[#1c1f24] rounded-sm"
          style={
            landscape
              ? { top: -4, left: 220, width: 40, height: 4 }
              : { left: -4, top: 220, width: 4, height: 40 }
          }
        />
      </div>
      <div className="absolute bottom-6 text-[10px] tracking-widest uppercase text-zinc-500">
        Desktop preview · {landscape ? "landscape" : "portrait"}
      </div>
    </div>
  );
}
