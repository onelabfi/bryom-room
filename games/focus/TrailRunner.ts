import * as Phaser from "phaser";
import { dimText, endScene, motionFromRegistry } from "../shared";

/**
 * Trail Runner — Focus zone.
 * Reindeer auto-runs through 3 lanes. Swipe up/down to change lane.
 * Collect light orbs (green pulse), avoid dark shards (soft slowdown, no death).
 * 60s session. No score pressure — only "light collected" as gentle feedback.
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
    this.lanes = [height * 0.3, height * 0.5, height * 0.7];
    const motion = motionFromRegistry(this);
    this.speed = 260 * motion;

    this.cameras.main.setBackgroundColor("#0b0f14");

    // trail lines
    for (let i = 0; i < 3; i++) {
      this.add
        .line(0, this.lanes[i], 0, 0, width, 0, 0x1e2a38, 0.5)
        .setOrigin(0, 0.5);
    }

    // player
    this.player = this.add.circle(width * 0.18, this.lanes[this.laneIndex], 18, 0xc9a77a);
    this.add.circle(width * 0.18 - 4, this.lanes[this.laneIndex] - 4, 2, 0x1a1a1a).setName("eye-l");
    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCircle(18);
    body.setImmovable(true);

    this.orbs = this.add.group();
    this.shards = this.add.group();

    // spawn loop
    this.time.addEvent({
      delay: 900,
      loop: true,
      callback: () => this.spawn(),
    });

    // input: swipe or tap top/bottom half
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (p.y < height * 0.5) this.changeLane(-1);
      else this.changeLane(1);
    });

    this.input.keyboard?.on("keydown-UP", () => this.changeLane(-1));
    this.input.keyboard?.on("keydown-DOWN", () => this.changeLane(1));

    this.hud = dimText(this, width / 2, 22, "60s").setDepth(10);

    this.time.delayedCall(this.duration, () => endScene(this, "finished"));
  }

  private changeLane(delta: number) {
    const next = Phaser.Math.Clamp(this.laneIndex + delta, 0, 2);
    if (next === this.laneIndex) return;
    this.laneIndex = next;
    this.tweens.add({
      targets: this.player,
      y: this.lanes[this.laneIndex],
      duration: 180,
      ease: "Sine.easeInOut",
    });
  }

  private spawn() {
    const { width } = this.scale;
    const lane = Phaser.Math.Between(0, 2);
    const y = this.lanes[lane];
    const isOrb = Math.random() < 0.6;
    if (isOrb) {
      const orb = this.add.circle(width + 30, y, 10, 0x7bd389);
      orb.setData("kind", "orb");
      this.orbs.add(orb);
    } else {
      const shard = this.add.rectangle(width + 30, y, 18, 26, 0x3a2230);
      shard.setData("kind", "shard");
      this.shards.add(shard);
    }
  }

  update(_t: number, dt: number) {
    const dx = (this.speed * dt) / 1000;
    this.elapsed += dt;

    this.orbs.getChildren().forEach((obj) => {
      const g = obj as Phaser.GameObjects.Arc;
      g.x -= dx;
      if (this.hit(g)) {
        this.collected += 1;
        this.flashPlayer(0x7bd389);
        g.destroy();
      } else if (g.x < -40) g.destroy();
    });

    this.shards.getChildren().forEach((obj) => {
      const g = obj as Phaser.GameObjects.Rectangle;
      g.x -= dx;
      if (this.hit(g)) {
        this.cameras.main.shake(120, 0.003);
        this.speed = Math.max(140, this.speed - 20);
        this.flashPlayer(0xe07a7a);
        g.destroy();
      } else if (g.x < -40) g.destroy();
    });

    // drift speed back up slowly
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
