import * as Phaser from "phaser";
import { dimText, endScene, softText } from "../shared";

/**
 * Spinner — Fidget zone.
 * Flick the three-armed spinner to set angular velocity. Friction decays
 * it over time. Flick again to add momentum. Tap center to reset.
 * Pure kinetic feedback. No score.
 */
export default class Spinner extends Phaser.Scene {
  private spinner!: Phaser.GameObjects.Container;
  private omega = 0; // radians/sec
  private dragging = false;
  private lastAngle = 0;
  private lastTime = 0;
  private cx = 0;
  private cy = 0;

  constructor() {
    super({ key: "Spinner" });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#0c1016");

    this.cx = width / 2;
    this.cy = height / 2 + 5;

    this.spinner = this.add.container(this.cx, this.cy);
    const armColors = [0xb48ce0, 0x7bd389, 0xffe28a];
    for (let i = 0; i < 3; i++) {
      const ang = (i * Math.PI * 2) / 3;
      const g = this.add.graphics();
      g.fillStyle(armColors[i], 0.9);
      g.fillCircle(Math.cos(ang) * 70, Math.sin(ang) * 70, 28);
      g.lineStyle(8, armColors[i], 0.55);
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(Math.cos(ang) * 70, Math.sin(ang) * 70);
      g.strokePath();
      this.spinner.add(g);
    }
    const hub = this.add.circle(0, 0, 14, 0x1a1f28);
    hub.setStrokeStyle(2, 0x3a414c, 0.8);
    hub.setInteractive({ useHandCursor: true });
    hub.on("pointerdown", () => {
      this.omega = 0;
    });
    this.spinner.add(hub);

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      const dx = p.x - this.cx;
      const dy = p.y - this.cy;
      if (Math.hypot(dx, dy) > 18 && Math.hypot(dx, dy) < 110) {
        this.dragging = true;
        this.lastAngle = Math.atan2(dy, dx);
        this.lastTime = this.time.now;
      }
    });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (!this.dragging || !p.isDown) return;
      const a = Math.atan2(p.y - this.cy, p.x - this.cx);
      const dt = Math.max(1, this.time.now - this.lastTime);
      let da = a - this.lastAngle;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      this.spinner.rotation += da;
      this.omega = (da / dt) * 1000; // rad/sec
      this.lastAngle = a;
      this.lastTime = this.time.now;
    });
    this.input.on("pointerup", () => {
      this.dragging = false;
    });

    dimText(this, width / 2, 52, "Flick the arms. Tap the hub to stop.");

    const done = softText(this, width - 52, 22, "Done", 14).setInteractive({
      useHandCursor: true,
    });
    done.on("pointerdown", () => endScene(this, "finished"));
  }

  update(_t: number, dt: number) {
    if (this.dragging) return;
    const dts = dt / 1000;
    // friction — proportional to omega (realistic air resistance)
    this.omega *= Math.pow(0.88, dts * 4);
    if (Math.abs(this.omega) < 0.01) this.omega = 0;
    this.spinner.rotation += this.omega * dts;
  }
}
