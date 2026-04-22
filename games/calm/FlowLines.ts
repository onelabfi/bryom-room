import * as Phaser from "phaser";
import { dimText, endScene, softText } from "../shared";

/**
 * Flow Lines — Calm zone.
 * Slow sine-wave ribbons drift across the screen. Tap/drag to create a
 * gentle attractor that bends nearby lines toward the pointer. No goal,
 * no timer. Exit when ready.
 */

interface Ribbon {
  graphics: Phaser.GameObjects.Graphics;
  color: number;
  amp: number;
  freq: number;
  speed: number;
  phase: number;
  yBase: number;
  thickness: number;
}

export default class FlowLines extends Phaser.Scene {
  private ribbons: Ribbon[] = [];
  private pointer: { x: number; y: number; active: boolean } = {
    x: 0,
    y: 0,
    active: false,
  };

  constructor() {
    super({ key: "FlowLines" });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#06090d");

    dimText(this, width / 2, 24, "Touch anywhere to nudge the flow.");

    const palette = [0x5fa8d3, 0x7bd389, 0xb48ce0, 0xffe28a, 0x8ac8e0];
    for (let i = 0; i < 6; i++) {
      this.ribbons.push({
        graphics: this.add.graphics(),
        color: palette[i % palette.length],
        amp: Phaser.Math.Between(20, 55),
        freq: Phaser.Math.FloatBetween(0.004, 0.008),
        speed: Phaser.Math.FloatBetween(0.0008, 0.0016),
        phase: Math.random() * Math.PI * 2,
        yBase: height * (0.2 + (i / 6) * 0.65),
        thickness: Phaser.Math.Between(2, 3),
      });
    }

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      this.pointer = { x: p.x, y: p.y, active: true };
    });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (p.isDown) this.pointer = { x: p.x, y: p.y, active: true };
    });
    this.input.on("pointerup", () => {
      this.pointer.active = false;
    });

    const done = softText(this, width - 52, 24, "Done", 14).setInteractive({
      useHandCursor: true,
    });
    done.on("pointerdown", () => endScene(this, "finished"));
  }

  update(_t: number, dt: number) {
    const { width } = this.scale;
    for (const r of this.ribbons) {
      r.phase += r.speed * dt;
      r.graphics.clear();
      r.graphics.lineStyle(r.thickness, r.color, 0.55);
      r.graphics.beginPath();
      for (let x = 0; x <= width; x += 6) {
        let y = r.yBase + Math.sin(x * r.freq + r.phase) * r.amp;
        if (this.pointer.active) {
          const dx = x - this.pointer.x;
          const dy = y - this.pointer.y;
          const dist = Math.hypot(dx, dy);
          const influence = Math.max(0, 1 - dist / 180);
          y += (this.pointer.y - y) * influence * 0.35;
        }
        if (x === 0) r.graphics.moveTo(x, y);
        else r.graphics.lineTo(x, y);
      }
      r.graphics.strokePath();
    }
  }
}
