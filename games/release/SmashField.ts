import * as Phaser from "phaser";
import { dimText, endScene } from "../shared";

/**
 * Smash Field — Release zone.
 * Glowing shards spawn across the field. Tap/drag across them — they shatter
 * with a haptic pulse and a soft particle scatter. 90s HARD CAP (regulation,
 * not reward). After cap, shell auto-routes to de-escalation outro.
 */
export default class SmashField extends Phaser.Scene {
  private shards: Phaser.GameObjects.Rectangle[] = [];
  private shattered = 0;
  private hud!: Phaser.GameObjects.Text;
  private readonly duration = 90_000;
  private elapsed = 0;

  constructor() {
    super({ key: "SmashField" });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#0b0f14");

    dimText(this, width / 2, 24, "Drag across the shards. 90 second cap.");

    for (let i = 0; i < 18; i++) this.spawnShard();

    this.time.addEvent({
      delay: 800,
      loop: true,
      callback: () => {
        if (this.shards.length < 20) this.spawnShard();
      },
    });

    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (!p.isDown) return;
      this.hitAt(p.x, p.y);
    });
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => this.hitAt(p.x, p.y));

    this.hud = dimText(this, width / 2, height - 24, "◆ 0");

    this.time.delayedCall(this.duration, () => endScene(this, "finished"));
  }

  private spawnShard() {
    const { width, height } = this.scale;
    const x = Phaser.Math.Between(40, Math.max(41, Math.floor(width - 40)));
    const y = Phaser.Math.Between(60, Math.max(61, Math.floor(height - 60)));
    const w = Phaser.Math.Between(18, 36);
    const h = Phaser.Math.Between(18, 36);
    const color = Phaser.Utils.Array.GetRandom([0xffe28a, 0x7bd389, 0x5fa8d3, 0xb48ce0]);
    const shard = this.add.rectangle(x, y, w, h, color, 0.85);
    shard.setAngle(Phaser.Math.Between(0, 90));
    shard.setStrokeStyle(2, color, 0.4);
    this.shards.push(shard);
  }

  private hitAt(x: number, y: number) {
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      if (
        Math.abs(s.x - x) < s.width * 0.6 &&
        Math.abs(s.y - y) < s.height * 0.6
      ) {
        this.shatter(s);
        this.shards.splice(i, 1);
      }
    }
  }

  private shatter(s: Phaser.GameObjects.Rectangle) {
    this.shattered += 1;
    const haptics = (this.registry.get("sensory") as { haptics: boolean } | undefined)?.haptics;
    if (haptics && typeof navigator !== "undefined") navigator.vibrate?.(8);
    for (let i = 0; i < 6; i++) {
      const bit = this.add.rectangle(s.x, s.y, 6, 6, s.fillColor, 0.9);
      const ang = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 40;
      this.tweens.add({
        targets: bit,
        x: s.x + Math.cos(ang) * dist,
        y: s.y + Math.sin(ang) * dist,
        alpha: 0,
        angle: Math.random() * 180,
        duration: 500,
        onComplete: () => bit.destroy(),
      });
    }
    s.destroy();
  }

  update(_t: number, dt: number) {
    this.elapsed += dt;
    const remaining = Math.max(0, Math.ceil((this.duration - this.elapsed) / 1000));
    this.hud.setText(`${remaining}s · ◆ ${this.shattered}`);
  }
}
