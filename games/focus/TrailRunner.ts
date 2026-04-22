import * as Phaser from "phaser";
import { dimText, endScene, motionFromRegistry } from "../shared";

/**
 * Trail Runner — Focus zone.
 * Portrait layout: reindeer runs forward at the bottom, world scrolls
 * down past them. 3 columns (lanes). Swipe or tap left/right half to
 * change lane. Collect light orbs, dodge dark shards (soft slowdown,
 * no death). 60s session.
 */
export default class TrailRunner extends Phaser.Scene {
  private player!: Phaser.GameObjects.Arc;
  private lanes: number[] = [];
  private laneIndex = 1;
  private orbs!: Phaser.GameObjects.Group;
  private shards!: Phaser.GameObjects.Group;
  private speed = 260;
  private elapsed = 0;
  private collected = 0;
  private hud!: Phaser.GameObjects.Text;
  private readonly duration = 60_000;

  constructor() {
    super({ key: "TrailRunner" });
  }

  create() {
    const { width, height } = this.scale;
    // 3 vertical lanes (x positions)
    this.lanes = [width * 0.25, width * 0.5, width * 0.75];
    const motion = motionFromRegistry(this);
    this.speed = 260 * motion;

    this.cameras.main.setBackgroundColor("#0b0f14");

    // trail guide lines (vertical)
    for (let i = 0; i < 3; i++) {
      this.add
        .line(this.lanes[i], 0, 0, 0, 0, height, 0x1e2a38, 0.5)
        .setOrigin(0.5, 0);
    }

    const playerY = height * 0.82;
    this.player = this.add.circle(this.lanes[this.laneIndex], playerY, 18, 0xc9a77a);
    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCircle(18).setImmovable(true);

    this.orbs = this.add.group();
    this.shards = this.add.group();

    this.time.addEvent({
      delay: 900,
      loop: true,
      callback: () => this.spawn(),
    });

    // input: tap left/right half
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (p.x < width * 0.5) this.changeLane(-1);
      else this.changeLane(1);
    });
    this.input.keyboard?.on("keydown-LEFT", () => this.changeLane(-1));
    this.input.keyboard?.on("keydown-RIGHT", () => this.changeLane(1));

    this.hud = dimText(this, width / 2, 22, "60s").setDepth(10);

    this.time.delayedCall(this.duration, () => endScene(this, "finished"));
  }

  private changeLane(delta: number) {
    const next = Phaser.Math.Clamp(this.laneIndex + delta, 0, 2);
    if (next === this.laneIndex) return;
    this.laneIndex = next;
    this.tweens.add({
      targets: this.player,
      x: this.lanes[this.laneIndex],
      duration: 180,
      ease: "Sine.easeInOut",
    });
  }

  private spawn() {
    const lane = Phaser.Math.Between(0, 2);
    const x = this.lanes[lane];
    const isOrb = Math.random() < 0.6;
    if (isOrb) {
      const orb = this.add.circle(x, -30, 10, 0x7bd389);
      orb.setData("kind", "orb");
      this.orbs.add(orb);
    } else {
      const shard = this.add.rectangle(x, -30, 26, 18, 0x3a2230);
      shard.setData("kind", "shard");
      this.shards.add(shard);
    }
  }

  update(_t: number, dt: number) {
    const dy = (this.speed * dt) / 1000;
    this.elapsed += dt;
    const { height } = this.scale;

    this.orbs.getChildren().forEach((obj) => {
      const g = obj as Phaser.GameObjects.Arc;
      g.y += dy;
      if (this.hit(g)) {
        this.collected += 1;
        this.flashPlayer(0x7bd389);
        g.destroy();
      } else if (g.y > height + 40) g.destroy();
    });

    this.shards.getChildren().forEach((obj) => {
      const g = obj as Phaser.GameObjects.Rectangle;
      g.y += dy;
      if (this.hit(g)) {
        this.cameras.main.shake(120, 0.003);
        this.speed = Math.max(140, this.speed - 20);
        this.flashPlayer(0xe07a7a);
        g.destroy();
      } else if (g.y > height + 40) g.destroy();
    });

    // drift back to baseline
    this.speed = Math.min(260, this.speed + dt * 0.01);

    const remaining = Math.max(0, Math.ceil((this.duration - this.elapsed) / 1000));
    this.hud.setText(`${remaining}s · ◐ ${this.collected}`);
  }

  private hit(obj: Phaser.GameObjects.GameObject & { x: number; y: number }) {
    return Phaser.Math.Distance.Between(obj.x, obj.y, this.player.x, this.player.y) < 28;
  }

  private flashPlayer(color: number) {
    const original = (this.player as Phaser.GameObjects.Arc).fillColor;
    (this.player as Phaser.GameObjects.Arc).setFillStyle(color);
    this.time.delayedCall(160, () =>
      (this.player as Phaser.GameObjects.Arc).setFillStyle(original),
    );
  }
}
