import * as Phaser from "phaser";
import { dimText, endScene } from "../shared";

/**
 * Pulse Burst — Release zone.
 * A pulsing ring expands at the center. Tap when it hits the target ring.
 * Tempo builds for 45s (BPM 60 → 120), then auto-decays back to 60 over 30s.
 * The built-in wind-down is why this is the safest Release entry.
 */
export default class PulseBurst extends Phaser.Scene {
  private ring!: Phaser.GameObjects.Arc;
  private target!: Phaser.GameObjects.Arc;
  private hud!: Phaser.GameObjects.Text;
  private elapsed = 0;
  private readonly buildMs = 45_000;
  private readonly decayMs = 30_000;
  private readonly totalMs = 75_000;
  private hits = 0;
  private nextBeatAt = 0;

  constructor() {
    super({ key: "PulseBurst" });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#0b0f14");

    const cx = width / 2, cy = height / 2;
    this.target = this.add.circle(cx, cy, 120, 0xffffff, 0);
    this.target.setStrokeStyle(2, 0xffffff, 0.35);

    this.ring = this.add.circle(cx, cy, 10, 0xffe28a, 0);
    this.ring.setStrokeStyle(3, 0xffe28a, 0.9);

    dimText(this, width / 2, 30, "Tap when the ring touches the circle.");
    this.hud = dimText(this, width / 2, height - 28, "♪ 0");

    this.input.on("pointerdown", () => this.tap());
    this.nextBeatAt = 0;
  }

  private bpm(): number {
    if (this.elapsed < this.buildMs) {
      const t = this.elapsed / this.buildMs;
      return 60 + t * 60;
    }
    const t = Math.min(1, (this.elapsed - this.buildMs) / this.decayMs);
    return 120 - t * 60;
  }

  private beatIntervalMs(): number {
    return 60_000 / this.bpm();
  }

  private tap() {
    // perfect if current ring radius within 20px of target radius
    const diff = Math.abs((this.ring as Phaser.GameObjects.Arc).radius - 120);
    if (diff < 22) {
      this.hits += 1;
      const haptics = (this.registry.get("sensory") as { haptics: boolean } | undefined)?.haptics;
      if (haptics && typeof navigator !== "undefined") navigator.vibrate?.(6);
      this.tweens.add({
        targets: this.target,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 140,
        yoyo: true,
      });
    } else {
      this.tweens.add({
        targets: this.target,
        alpha: 0.15,
        duration: 140,
        yoyo: true,
      });
    }
  }

  update(_t: number, dt: number) {
    this.elapsed += dt;
    if (this.elapsed >= this.totalMs) {
      endScene(this, "finished");
      return;
    }
    // ring expands from 10 to 120 each beat, then resets
    this.nextBeatAt += dt;
    const interval = this.beatIntervalMs();
    const progress = Math.min(1, this.nextBeatAt / interval);
    const r = 10 + progress * 110;
    (this.ring as Phaser.GameObjects.Arc).setRadius(r);
    (this.ring as Phaser.GameObjects.Arc).setStrokeStyle(3, 0xffe28a, 0.9 - progress * 0.4);
    if (this.nextBeatAt >= interval) {
      this.nextBeatAt = 0;
    }

    const phase = this.elapsed < this.buildMs ? "build" : "release";
    this.hud.setText(`♪ ${this.hits} · ${phase} · ${Math.round(this.bpm())} bpm`);
  }
}
