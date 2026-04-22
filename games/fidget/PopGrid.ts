import * as Phaser from "phaser";
import { dimText, endScene, softText } from "../shared";

/**
 * Pop Grid — Fidget zone.
 * Grid of soft bubbles. Tap/drag across them — they pop with haptic.
 * Each bubble regrows after ~3s. Infinite loop. No timer, no score.
 */

interface Bubble {
  arc: Phaser.GameObjects.Arc;
  popped: boolean;
  row: number;
  col: number;
  baseColor: number;
}

export default class PopGrid extends Phaser.Scene {
  private bubbles: Bubble[] = [];
  private pad = 0;

  constructor() {
    super({ key: "PopGrid" });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#0c1016");

    const cols = 10;
    const rows = 6;
    const avail = Math.min(width - 40, (height - 60) * (cols / rows));
    const cell = avail / cols;
    this.pad = cell * 0.5;
    const startX = (width - cols * cell) / 2 + cell / 2;
    const startY = (height - rows * cell) / 2 + cell / 2 + 10;

    const palette = [0xb48ce0, 0xd4b4f0, 0xc0a0e6];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * cell;
        const y = startY + r * cell;
        const color = Phaser.Utils.Array.GetRandom(palette);
        const arc = this.add.circle(x, y, cell * 0.38, color, 0.85);
        arc.setStrokeStyle(2, color, 0.35);
        arc.setInteractive({ useHandCursor: true });
        const b: Bubble = { arc, popped: false, row: r, col: c, baseColor: color };
        arc.on("pointerdown", () => this.pop(b));
        arc.on("pointerover", (p: Phaser.Input.Pointer) => {
          if (p.isDown) this.pop(b);
        });
        this.bubbles.push(b);
      }
    }

    dimText(this, width / 2, 52, "Pop them. They come back.");

    const done = softText(this, width - 52, 22, "Done", 14).setInteractive({
      useHandCursor: true,
    });
    done.on("pointerdown", () => endScene(this, "finished"));
  }

  private pop(b: Bubble) {
    if (b.popped) return;
    b.popped = true;
    const haptics = (this.registry.get("sensory") as { haptics: boolean } | undefined)
      ?.haptics;
    if (haptics && typeof navigator !== "undefined") navigator.vibrate?.(6);

    this.tweens.add({
      targets: b.arc,
      scale: 0.4,
      alpha: 0.15,
      duration: 120,
    });

    for (let i = 0; i < 5; i++) {
      const bit = this.add.circle(b.arc.x, b.arc.y, 2, b.baseColor, 0.9);
      const ang = Math.random() * Math.PI * 2;
      const d = 16 + Math.random() * 20;
      this.tweens.add({
        targets: bit,
        x: b.arc.x + Math.cos(ang) * d,
        y: b.arc.y + Math.sin(ang) * d,
        alpha: 0,
        duration: 420,
        onComplete: () => bit.destroy(),
      });
    }

    this.time.delayedCall(2800 + Math.random() * 1200, () => {
      this.tweens.add({
        targets: b.arc,
        scale: 1,
        alpha: 0.85,
        duration: 260,
        onComplete: () => {
          b.popped = false;
        },
      });
    });
  }
}
