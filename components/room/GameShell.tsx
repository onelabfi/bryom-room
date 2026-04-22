"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type * as Phaser from "phaser";
import { gameById } from "@/lib/state";
import { track, now, type Feeling } from "@/lib/analytics";
import SensoryPanel from "./SensoryPanel";
import StateAfter from "./StateAfter";
import DeescalationOutro from "./DeescalationOutro";
import { useSensory } from "@/lib/sensory";

interface Props {
  gameId: string;
}

/**
 * Boots a Phaser game in a canvas, owns lifecycle (start/end/cleanup),
 * and surfaces settings / exit controls.
 *
 * Lifecycle rules:
 *   - endGame() is idempotent (guarded by endedRef).
 *   - When endGame fires, the Phaser game is destroyed immediately. No
 *     need to keep it running behind the outro/state overlays.
 *   - Page backgrounded → scene pauses (Release timers must not drift
 *     while the tab is hidden).
 */
export default function GameShell({ gameId }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const from = sp.get("from") ?? "zone";
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const startedAtRef = useRef<number>(0);
  const endedRef = useRef(false);
  const [showSettings, setShowSettings] = useState(false);
  const [phase, setPhase] = useState<"playing" | "outro" | "state" | "done">("playing");
  const sensory = useSensory();
  const meta = gameById(gameId);

  useEffect(() => {
    if (!meta) return;
    let disposed = false;

    (async () => {
      const [PhaserMod, scene] = await Promise.all([
        import("phaser"),
        loadScene(gameId),
      ]);
      if (disposed || !containerRef.current) return;
      const Phaser = PhaserMod as unknown as typeof import("phaser");

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        backgroundColor: "#0b0f14",
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
          default: "arcade",
          arcade: { gravity: { x: 0, y: 0 }, debug: false },
        },
        scene: [scene],
        audio: { disableWebAudio: false },
        banner: false,
        fps: { target: 60 },
      });

      // Make sensory store + end-callback accessible to scenes
      (game.registry as Phaser.Data.DataManager).set("sensory", sensory);
      (game.registry as Phaser.Data.DataManager).set("onEnd", (reason: "finished" | "timeout") => {
        endGame(reason);
      });

      gameRef.current = game;
      startedAtRef.current = now();
      track({
        type: "game_start",
        ts: startedAtRef.current,
        zone: meta.zone,
        game: meta.id,
        recommended: from.startsWith("feel:"),
      });
    })();

    // Pause/resume on tab visibility change. Regulation-critical for
    // Release games: the 90s timer must not expire while the app is
    // backgrounded.
    const onVis = () => {
      const g = gameRef.current;
      if (!g) return;
      const scenes = g.scene.getScenes(true);
      if (document.hidden) scenes.forEach((s) => s.scene.pause());
      else scenes.forEach((s) => s.scene.resume());
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVis);
      if (!endedRef.current) endGame("exited");
      destroyGame();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  function destroyGame() {
    try {
      gameRef.current?.destroy(true);
    } catch {
      // Phaser occasionally throws during teardown — swallow.
    }
    gameRef.current = null;
  }

  function endGame(reason: "finished" | "exited" | "timeout") {
    if (endedRef.current || !meta) return;
    endedRef.current = true;
    track({
      type: "game_end",
      ts: now(),
      zone: meta.zone,
      game: meta.id,
      durationMs: now() - (startedAtRef.current || now()),
      completed: reason === "finished",
      reason,
    });
    // Free the canvas immediately — the outro/state screens cover
    // the whole area and don't need the scene running behind them.
    destroyGame();
    if (meta.zone === "release") setPhase("outro");
    else setPhase("state");
  }

  function onStateAfter(feeling: Feeling) {
    if (!meta) return;
    track({
      type: "state_after",
      ts: now(),
      zone: meta.zone,
      game: meta.id,
      feeling,
    });
    setPhase("done");
    router.push(`/room/${meta.zone}`);
  }

  function onOutroDone() {
    setPhase("state");
  }

  if (!meta) {
    return (
      <div className="w-full h-full flex items-center justify-center text-[color:var(--fg-dim)]">
        Unknown game.
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="absolute inset-0" />

      {phase === "playing" && (
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <button
            onClick={() => endGame("exited")}
            className="br-btn text-xs pointer-events-auto"
            aria-label="Exit"
          >
            ✕ Exit
          </button>
          <div className="text-xs text-[color:var(--fg-dim)] pointer-events-none">
            {meta.title}
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="br-btn text-xs pointer-events-auto"
            aria-label="Settings"
          >
            ⚙
          </button>
        </div>
      )}

      {showSettings && <SensoryPanel onClose={() => setShowSettings(false)} />}

      {phase === "outro" && <DeescalationOutro onDone={onOutroDone} />}

      {phase === "state" && (
        <StateAfter
          onPick={onStateAfter}
          zone={meta.zone}
          game={meta.id}
        />
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadScene(id: string): Promise<any> {
  switch (id) {
    case "trail-runner":
      return (await import("@/games/focus/TrailRunner")).default;
    case "orb-matcher":
      return (await import("@/games/focus/OrbMatcher")).default;
    case "sequence-tap":
      return (await import("@/games/focus/SequenceTap")).default;
    case "troll-blaster":
      return (await import("@/games/release/TrollBlaster")).default;
    case "smash-field":
      return (await import("@/games/release/SmashField")).default;
    case "pulse-burst":
      return (await import("@/games/release/PulseBurst")).default;
    case "breathing-light":
      return (await import("@/games/calm/BreathingLight")).default;
    case "flow-lines":
      return (await import("@/games/calm/FlowLines")).default;
    case "rain-field":
      return (await import("@/games/calm/RainField")).default;
    case "pop-grid":
      return (await import("@/games/fidget/PopGrid")).default;
    case "spinner":
      return (await import("@/games/fidget/Spinner")).default;
    case "pattern-drawer":
      return (await import("@/games/fidget/PatternDrawer")).default;
    default:
      throw new Error(`Unknown game: ${id}`);
  }
}
