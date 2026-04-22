import * as Phaser from "phaser";
import { dimText, endScene, softText } from "../shared";

/**
 * Breathing Light — Calm zone.
 * A soft orb expands for 4s (inhale) and contracts for 6s (exhale), per
 * standard 4-6 regulation breath. Text cues "In" / "Out". No input.
 * User exits via the shell when done. No duration cap — this is Calm,
 * stay as long as you need.
 */
export default class BreathingLight extends Phaser.Scene {
  private orb!: Phaser.GameObjects.Arc;
  private halo!: Phaser.GameObjects.Arc;
  private cue!: Phaser.GameObjects.Text;
  private phase: "in" | "hold" | "out" = "in";
  private phaseMs = 0;
  private readonly IN_MS = 4000;
  private readonly OUT_MS = 6000;

  constructor() {
    super({ key: "BreathingLight" });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#0b0f14");

    const cx = width / 2;
    const cy = height / 2;

    this.halo = this.add.circle(cx, cy, 120, 0x5fa8d3, 0.08);
    this.orb = this.add.circle(cx, cy, 60, 0x5fa8d3, 0.55);

    this.cue = softText(this, cx, cy + 140, "In", 22);

    dimText(this, cx, 24, "Breathe with the light. Tap Done when ready.");

    const done = softText(this, width - 52, 24, "Done", 14).setInteractive({
      useHandCursor: true,
    });
    done.on("pointerdown", () => endScene(this, "finished"));
  }

  update(_t: number, dt: number) {
    this.phaseMs += dt;
    const p =
      this.phase === "in"
        ? this.phaseMs / this.IN_MS
        : this.phaseMs / this.OUT_MS;
    const clamped = Math.min(1, Math.max(0, p));

    const minR = 50;
    const maxR = 130;
    const r =
      this.phase === "in"
        ? minR + (maxR - minR) * ease(clamped)
        : maxR - (maxR - minR) * ease(clamped);

    this.orb.setRadius(r);
    this.halo.setRadius(r + 40);
    this.halo.setFillStyle(0x5fa8d3, 0.06 + clamped * 0.06);

    if (this.phase === "in" && this.phaseMs >= this.IN_MS) {
      this.phase = "out";
      this.phaseMs = 0;
      this.cue.setText("Out");
    } else if (this.phase === "out" && this.phaseMs >= this.OUT_MS) {
      this.phase = "in";
      this.phaseMs = 0;
      this.cue.setText("In");
    }
  }
}

function ease(t: number): number {
  // smoothstep — no hard snap at phase boundaries
  return t * t * (3 - 2 * t);
}
