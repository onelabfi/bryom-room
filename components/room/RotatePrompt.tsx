"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isLandscapePath } from "@/lib/layout";

export default function RotatePrompt() {
  const pathname = usePathname() ?? "/";
  const [portrait, setPortrait] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => {
      setPortrait(window.innerHeight > window.innerWidth);
      setIsDesktop(window.innerWidth >= 900);
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  // Desktop browsers get the phone-frame preview, so no rotate prompt there.
  if (isDesktop) return null;

  // Only nag when we're on a landscape-required route and the device is portrait.
  if (!portrait) return null;
  if (!isLandscapePath(pathname)) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[color:var(--bg)] text-center p-8">
      <div className="max-w-sm space-y-4">
        <div className="text-5xl">↻</div>
        <h2 className="text-xl font-medium">Rotate your phone</h2>
        <p className="text-[color:var(--fg-dim)] text-sm">
          This part of the room works in landscape. Turn your device sideways.
        </p>
      </div>
    </div>
  );
}
