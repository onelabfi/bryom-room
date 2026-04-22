import * as Phaser from "phaser";
import { dimText, endScene, softText } from "../shared";

/**
 * Sequence Tap — Focus zone.
 * Simon-style pattern memory. 4 pads. Watch the pattern, repeat it.
 * Generous 3s per tap window. No failure; mistakes just reset the round.
 * Rounds escalate by +1 each time, capped at 9.
 */
export default class SequenceTap extends Phaser.Scene {
  private pads: Phaser.GameObjects.Arc[] = [];
  private colors = [0x7bd389, 0x5fa8d3, 0xb48ce0, 0xe0c27a];
  private sequence: number[] = [];
  private playerIndex = 0;
  private round = 0;
  private mode: "watch" | "repeat" = "watch";
  private hud!: Phaser.GameObjects.Text;
  private prompt!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "SequenceTap" });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#0b0f14");

    const cx = width / 2, cy = height / 2 + 10;
    const r = Math.min(width, height) * 0.18;
    const offsets = [
      { x: -r, y: -r },
      { x: r, y: -r },
      { x: -r, y: r },
      { x: r, y: r },
    ];
    offsets.forEach((o, i) => {
      const pad = this.add.circle(cx + o.x, cy + o.y, r * 0.8, this.colors[i], 0.35);
      pad.setStrokeStyle(2, this.colors[i], 0.8);
      pad.setInteractive({ useHandCursor: true });
      pad.on("pointerdown", () => this.tap(i));
      this.pads.push(pad);
    });

    this.prompt = softText(this, width / 2, 40, "Watch…", 20);
    this.hud = dimText(this, width / 2, height - 28, "Round 1");

    const exit = softText(this, width - 48, 24, "Done", 14).setInteractive({
      useHandCursor: true,
    });
    exit.on("pointerdown", () => endScene(this, "finished"));

    this.nextRound();
  }

  private nextRound() {
    this.round += 1;
    this.sequence.push(Phaser.Math.Between(0, 3));
    this.hud.setText(`Round ${this.round}`);
    if (this.round > 9) {
      endScene(this, "finished");
      return;
    }
    this.mode = "watch";
    this.prompt.setText("Watch…");
    this.playerIndex = 0;
    this.playSequence();
  }

  private playSequence() {
    this.sequence.forEach((padIdx, i) => {
      this.time.delayedCall(i * 700, () => this.flash(padIdx));
    });
    this.time.delayedCall(this.sequence.length * 700 + 200, () => {
      this.mode = "repeat";
      this.prompt.setText("Your turn");
    });
  }

  private flash(padIdx: number) {
    const pad = this.pads[padIdx];
    this.tweens.add({
      targets: pad,
      fillAlpha: 0.9,
      scale: 1.05,
      duration: 200,
      yoyo: true,
    });
  }

  private tap(padIdx: number) {
    if (this.mode !== "repeat") return;
    this.flash(padIdx);
    const expected = this.sequence[this.playerIndex];
    if (padIdx !== expected) {
      this.prompt.setText("Oops — try again");
      this.mode = "watch";
      this.time.delayedCall(900, () => {
        this.playerIndex = 0;
        this.prompt.setText("Watch…");
        this.playSequence();
      });
      return;
    }
    this.playerIndex += 1;
    if (this.playerIndex >= this.sequence.length) {
      this.prompt.setText("Nice ✦");
      this.time.delayedCall(700, () => this.nextRound());
    }
  }
}
