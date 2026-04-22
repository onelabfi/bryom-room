import * as Phaser from "phaser";
import { dimText, endScene, softText } from "../shared";

/**
 * Pattern Drawer — Fidget zone.
 * Touch to draw. Strokes mirror four ways around the center (horizontal,
 * vertical, diagonal) creating mandala-like symmetry. Strokes fade over
 * ~10s so the canvas never clutters. Clear button for instant reset.
 */

interface Stroke {
  points: { x: number; y: number }[];
  color: number;
  thickness: number;
  age: number;
  graphic: Phaser.GameObjects.Graphics;
}

export default class PatternDrawer extends Phaser.Scene {
  private strokes: Stroke[] = [];
  private current: Stroke | null = null;
  private cx = 0;
  private cy = 0;

  constructor() {
    super({ key: "PatternDrawer" });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#06080c");

    this.cx = width / 2;
    this.cy = height / 2 + 6;

    // faint center guides
    const guide = this.add.graphics();
    guide.lineStyle(1, 0x1c2230, 0.8);
    guide.beginPath();
    guide.moveTo(this.cx, 0);
    guide.lineTo(this.cx, height);
    guide.moveTo(0, this.cy);
    guide.lineTo(width, this.cy);
    guide.strokePath();

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      this.current = {
        points: [{ x: p.x, y: p.y }],
        color: Phaser.Utils.Array.GetRandom([
          0xb48ce0, 0x7bd389, 0x5fa8d3, 0xffe28a, 0xe07a7a,
        ]),
        thickness: Phaser.Math.Between(2, 4),
        age: 0,
        graphic: this.add.graphics(),
      };
      this.strokes.push(this.current);
    });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (!p.isDown || !this.current) return;
      const last = this.current.points[this.current.points.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) < 3) return;
      this.current.points.push({ x: p.x, y: p.y });
    });
    this.input.on("pointerup", () => {
      this.current = null;
    });

    dimText(this, width / 2, 52, "Draw. It echoes.");

    const clear = softText(this, 52, 22, "Clear", 14).setInteractive({
      useHandCursor: true,
    });
    clear.on("pointerdown", () => this.clearAll());

    const done = softText(this, width - 52, 22, "Done", 14).setInteractive({
      useHandCursor: true,
    });
    done.on("pointerdown", () => endScene(this, "finished"));
  }

  private clearAll() {
    for (const s of this.strokes) s.graphic.destroy();
    this.strokes = [];
  }

  update(_t: number, dt: number) {
    const dts = dt / 1000;
    const life = 10;
    for (let i = this.strokes.length - 1; i >= 0; i--) {
      const s = this.strokes[i];
      s.age += dts;
      const alpha = Math.max(0, 1 - s.age / life);
      if (alpha <= 0) {
        s.graphic.destroy();
        this.strokes.splice(i, 1);
        continue;
      }
      s.graphic.clear();
      s.graphic.lineStyle(s.thickness, s.color, alpha * 0.85);
      // draw 4 symmetric copies: original, mirror-x, mirror-y, mirror-xy
      for (const { fx, fy } of [
        { fx: 1, fy: 1 },
        { fx: -1, fy: 1 },
        { fx: 1, fy: -1 },
        { fx: -1, fy: -1 },
      ]) {
        s.graphic.beginPath();
        const first = s.points[0];
        s.graphic.moveTo(this.cx + (first.x - this.cx) * fx, this.cy + (first.y - this.cy) * fy);
        for (let j = 1; j < s.points.length; j++) {
          const pt = s.points[j];
          s.graphic.lineTo(this.cx + (pt.x - this.cx) * fx, this.cy + (pt.y - this.cy) * fy);
        }
        s.graphic.strokePath();
      }
    }
  }
}
