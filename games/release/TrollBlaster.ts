import * as Phaser from "phaser";
import { dimText, endScene } from "../shared";

/**
 * Troll Blaster — Release zone.
 * Drag back the light orb from the reindeer's paws. Release to launch.
 * Hit dark trolls — they DISSOLVE into particles (not explode).
 * Mechanic-inspired, IP-safe (no bird types, no 3-star levels, no map).
 * 90s session, then auto de-escalation outro (handled by shell).
 */
export default class TrollBlaster extends Phaser.Scene {
  private anchor!: Phaser.Math.Vector2;
  private orb!: Phaser.GameObjects.Arc;
  private aiming = false;
  private trolls: Phaser.GameObjects.Arc[] = [];
  private dissolved = 0;
  private hud!: Phaser.GameObjects.Text;
  private readonly duration = 90_000;
  private elapsed = 0;
  private trail: Phaser.GameObjects.Graphics | null = null;

  constructor() {
    super({ key: "TrollBlaster" });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#0b0f14");

    // reindeer "stump" left side
    this.add.rectangle(width * 0.12, height * 0.78, 20, 80, 0x5a3f2a);
    this.anchor = new Phaser.Math.Vector2(width * 0.12, height * 0.72);

    this.spawnOrb();
    this.spawnTrolls();

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (Phaser.Math.Distance.Between(p.x, p.y, this.orb.x, this.orb.y) < 50) {
        this.aiming = true;
      }
    });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (!this.aiming) return;
      const dx = p.x - this.anchor.x;
      const dy = p.y - this.anchor.y;
      const len = Math.min(140, Math.hypot(dx, dy));
      const ang = Math.atan2(dy, dx);
      this.orb.x = this.anchor.x + Math.cos(ang) * len;
      this.orb.y = this.anchor.y + Math.sin(ang) * len;
      this.drawTrajectory();
    });
    this.input.on("pointerup", () => {
      if (!this.aiming) return;
      this.aiming = false;
      this.launch();
    });

    this.hud = dimText(this, width / 2, 24, "Drag the orb back. Release to throw.");

    this.time.delayedCall(this.duration, () => endScene(this, "finished"));
  }

  private spawnOrb() {
    this.orb = this.add.circle(this.anchor.x, this.anchor.y, 14, 0xffe28a);
    this.orb.setStrokeStyle(2, 0xffe28a, 0.6);
    this.physics.add.existing(this.orb);
    const body = this.orb.body as Phaser.Physics.Arcade.Body;
    body.setCircle(14).setAllowGravity(false);
  }

  private drawTrajectory() {
    this.trail?.destroy();
    this.trail = this.add.graphics();
    this.trail.lineStyle(2, 0xffe28a, 0.35);
    const dx = this.anchor.x - this.orb.x;
    const dy = this.anchor.y - this.orb.y;
    const vx = dx * 4, vy = dy * 4;
    let px = this.orb.x, py = this.orb.y;
    this.trail.beginPath();
    this.trail.moveTo(px, py);
    for (let t = 0.02; t < 1.1; t += 0.04) {
      const nx = this.orb.x + vx * t;
      const ny = this.orb.y + vy * t + 0.5 * 600 * t * t;
      this.trail.lineTo(nx, ny);
      px = nx; py = ny;
    }
    this.trail.strokePath();
  }

  private launch() {
    this.trail?.destroy();
    this.trail = null;
    const dx = this.anchor.x - this.orb.x;
    const dy = this.anchor.y - this.orb.y;
    const body = this.orb.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true).setGravityY(600).setVelocity(dx * 4, dy * 4);
    this.time.delayedCall(3200, () => {
      this.orb.destroy();
      this.spawnOrb();
    });
  }

  private spawnTrolls() {
    const { width, height } = this.scale;
    this.trolls.forEach((t) => t.destroy());
    this.trolls = [];
    const count = Phaser.Math.Between(3, 5);
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(Math.floor(width * 0.5), Math.floor(width * 0.92));
      const y = Phaser.Math.Between(Math.floor(height * 0.35), Math.floor(height * 0.8));
      const troll = this.add.circle(x, y, 22, 0x3a2a3a);
      troll.setStrokeStyle(2, 0x5c3d5c);
      this.trolls.push(troll);
    }
  }

  update(_t: number, dt: number) {
    this.elapsed += dt;

    // collisions
    if (this.orb && this.orb.active) {
      for (let i = this.trolls.length - 1; i >= 0; i--) {
        const troll = this.trolls[i];
        if (Phaser.Math.Distance.Between(this.orb.x, this.orb.y, troll.x, troll.y) < 32) {
          this.dissolve(troll);
          this.trolls.splice(i, 1);
        }
      }
      const { width, height } = this.scale;
      if (this.orb.x > width + 40 || this.orb.y > height + 40) {
        this.orb.destroy();
        this.spawnOrb();
      }
    }

    if (this.trolls.length === 0 && this.elapsed < this.duration - 2000) {
      this.time.delayedCall(500, () => this.spawnTrolls());
    }

    const remaining = Math.max(0, Math.ceil((this.duration - this.elapsed) / 1000));
    this.hud.setText(`${remaining}s · ✦ ${this.dissolved}`);
  }

  private dissolve(troll: Phaser.GameObjects.Arc) {
    // soft particle dissolve — no bang, no shake
    this.dissolved += 1;
    const n = 8;
    for (let i = 0; i < n; i++) {
      const bit = this.add.circle(troll.x, troll.y, 3, 0x5c3d5c, 0.9);
      const ang = (Math.PI * 2 * i) / n;
      this.tweens.add({
        targets: bit,
        x: troll.x + Math.cos(ang) * 40,
        y: troll.y + Math.sin(ang) * 40,
        alpha: 0,
        duration: 700,
        onComplete: () => bit.destroy(),
      });
    }
    troll.destroy();
  }
}
