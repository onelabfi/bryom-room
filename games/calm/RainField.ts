import * as Phaser from "phaser";
import { dimText, endScene, softText } from "../shared";

/**
 * Rain Field — Calm zone.
 * Sparse falling light particles. Tap creates an expanding ripple that
 * nudges nearby drops sideways briefly. No goal. No timer.
 */

interface Drop {
  x: number;
  y: number;
  vy: number;
  vx: number;
  r: number;
  color: number;
  alpha: number;
  graphic: Phaser.GameObjects.Arc;
}

interface Ripple {
  x: number;
  y: number;
  life: number;
  maxR: number;
  graphic: Phaser.GameObjects.Arc;
}

export default class RainField extends Phaser.Scene {
  private drops: Drop[] = [];
  private ripples: Ripple[] = [];
  private palette = [0x5fa8d3, 0x8ac8e0, 0xb4d4e0, 0xffe28a];

  constructor() {
    super({ key: "RainField" });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#05070b");

    for (let i = 0; i < 60; i++) {
      this.spawnDrop(Math.random() * height);
    }

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      this.spawnRipple(p.x, p.y);
    });

    dimText(this, width / 2, 24, "Quiet rain. Tap anywhere.");

    const done = softText(this, width - 52, 24, "Done", 14).setInteractive({
      useHandCursor: true,
    });
    done.on("pointerdown", () => endScene(this, "finished"));
  }

  private spawnDrop(y?: number) {
    const { width } = this.scale;
    const color = Phaser.Utils.Array.GetRandom(this.palette);
    const r = Phaser.Math.FloatBetween(1.5, 3.5);
    const graphic = this.add.circle(
      Math.random() * width,
      y ?? -10,
      r,
      color,
      0.7,
    );
    this.drops.push({
      x: graphic.x,
      y: graphic.y,
      vy: Phaser.Math.FloatBetween(40, 90),
      vx: 0,
      r,
      color,
      alpha: 0.7,
      graphic,
    });
    if (this.drops.length > 120) {
      const removed = this.drops.shift();
      removed?.graphic.destroy();
    }
  }

  private spawnRipple(x: number, y: number) {
    const graphic = this.add.circle(x, y, 10, 0xffffff, 0);
    graphic.setStrokeStyle(2, 0xffffff, 0.6);
    this.ripples.push({ x, y, life: 0, maxR: 160, graphic });
  }

  update(_t: number, dt: number) {
    const { width, height } = this.scale;
    const dts = dt / 1000;

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rp = this.ripples[i];
      rp.life += dts;
      const p = rp.life / 1.4;
      if (p >= 1) {
        rp.graphic.destroy();
        this.ripples.splice(i, 1);
        continue;
      }
      rp.graphic.setRadius(10 + p * (rp.maxR - 10));
      rp.graphic.setStrokeStyle(2, 0xffffff, 0.6 * (1 - p));
    }

    for (const d of this.drops) {
      for (const rp of this.ripples) {
        const dx = d.x - rp.x;
        const dy = d.y - rp.y;
        const dist = Math.hypot(dx, dy);
        const radius = 10 + (rp.life / 1.4) * (rp.maxR - 10);
        if (Math.abs(dist - radius) < 18) {
          const ang = Math.atan2(dy, dx);
          d.vx += Math.cos(ang) * 40 * dts;
        }
      }
      d.vx *= 0.96;
      d.x += d.vx * dts;
      d.y += d.vy * dts;
      if (d.y > height + 10) {
        d.y = -10;
        d.x = Math.random() * width;
      }
      d.graphic.setPosition(d.x, d.y);
    }

    // trickle new drops if many recycled off-screen
    if (Math.random() < 0.04) this.spawnDrop();
  }
}
