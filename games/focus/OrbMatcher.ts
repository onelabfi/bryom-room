import * as Phaser from "phaser";
import { dimText, endScene, softText } from "../shared";

/**
 * Orb Matcher — Focus zone.
 * 6x6 grid of colored orbs. Touch an orb and SWIPE in any direction to
 * swap with the adjacent orb. If the swap doesn't form a match of 3+,
 * the orbs swap back. No timer, no score pressure. Soft auto-end at 180s.
 */

const COLORS = [0x7bd389, 0x5fa8d3, 0xb48ce0, 0xe0c27a, 0xe07a7a];
const COLS = 6;
const ROWS = 6;
const SWIPE_THRESHOLD = 14; // px before a drag counts as a swipe

type Cell = { orb: Phaser.GameObjects.Arc; color: number; row: number; col: number };

export default class OrbMatcher extends Phaser.Scene {
  private grid: (Cell | null)[][] = [];
  private boardX = 0;
  private boardY = 0;
  private cellSize = 56;
  private cleared = 0;
  private hud!: Phaser.GameObjects.Text;
  private busy = false;
  private dragStart: {
    cell: Cell;
    startX: number;
    startY: number;
    consumed: boolean;
  } | null = null;

  constructor() {
    super({ key: "OrbMatcher" });
  }

  create() {
    const { width, height } = this.scale;
    this.cellSize = Math.min(56, Math.floor(Math.min(width, height) / 7));
    const boardW = COLS * this.cellSize;
    const boardH = ROWS * this.cellSize;
    this.boardX = (width - boardW) / 2 + this.cellSize / 2;
    this.boardY = (height - boardH) / 2 + this.cellSize / 2 + 10;

    this.cameras.main.setBackgroundColor("#0b0f14");

    dimText(this, width / 2, 52, "Touch an orb and swipe to swap.");

    for (let r = 0; r < ROWS; r++) {
      this.grid[r] = [];
      for (let c = 0; c < COLS; c++) {
        this.grid[r][c] = this.makeOrb(r, c);
      }
    }

    // resolve starting matches silently
    this.time.delayedCall(200, () => this.resolveMatches(true));

    this.hud = dimText(this, width / 2, height - 22, "◐ 0");

    // done button
    const done = softText(this, width - 48, 24, "Done", 14).setInteractive({
      useHandCursor: true,
    });
    done.on("pointerdown", () => endScene(this, "finished"));

    // soft auto-complete at 180s
    this.time.delayedCall(180_000, () => endScene(this, "finished"));

    // global swipe handlers
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => this.onMove(p));
    this.input.on("pointerup", () => {
      this.dragStart = null;
    });
    this.input.on("pointerupoutside", () => {
      this.dragStart = null;
    });
  }

  private makeOrb(row: number, col: number): Cell {
    const color = Phaser.Utils.Array.GetRandom(COLORS);
    const x = this.boardX + col * this.cellSize;
    const y = this.boardY + row * this.cellSize;
    const orb = this.add.circle(x, y, this.cellSize * 0.38, color);
    orb.setInteractive({ useHandCursor: true });
    const cell: Cell = { orb, color, row, col };
    orb.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (this.busy) return;
      this.dragStart = { cell, startX: p.x, startY: p.y, consumed: false };
      orb.setStrokeStyle(2, 0xffffff, 0.5);
      this.time.delayedCall(220, () => orb.setStrokeStyle());
    });
    return cell;
  }

  private onMove(p: Phaser.Input.Pointer) {
    if (!p.isDown || !this.dragStart || this.dragStart.consumed) return;
    const dx = p.x - this.dragStart.startX;
    const dy = p.y - this.dragStart.startY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;

    let dr = 0;
    let dc = 0;
    if (Math.abs(dx) > Math.abs(dy)) dc = dx > 0 ? 1 : -1;
    else dr = dy > 0 ? 1 : -1;

    const fromCell = this.dragStart.cell;
    this.dragStart.consumed = true;
    this.dragStart = null;

    const targetRow = fromCell.row + dr;
    const targetCol = fromCell.col + dc;
    if (
      targetRow < 0 ||
      targetRow >= ROWS ||
      targetCol < 0 ||
      targetCol >= COLS
    )
      return;

    const targetCell = this.grid[targetRow][targetCol];
    if (!targetCell) return;

    this.attemptSwap(fromCell, targetCell);
  }

  private attemptSwap(a: Cell, b: Cell) {
    this.busy = true;
    this.swap(a, b);
    this.time.delayedCall(200, () => {
      const matched = this.resolveMatches(false);
      if (!matched) {
        // soft "nope" — swap back
        this.swap(a, b);
        this.time.delayedCall(200, () => {
          this.busy = false;
        });
      } else {
        // resolveMatches schedules its own follow-up; release lock
        // a bit later so cascades complete first.
        this.time.delayedCall(600, () => {
          this.busy = false;
        });
      }
    });
  }

  private swap(a: Cell, b: Cell) {
    const ax = a.orb.x, ay = a.orb.y;
    this.tweens.add({ targets: a.orb, x: b.orb.x, y: b.orb.y, duration: 180 });
    this.tweens.add({ targets: b.orb, x: ax, y: ay, duration: 180 });
    this.grid[a.row][a.col] = b;
    this.grid[b.row][b.col] = a;
    const ar = a.row, ac = a.col;
    a.row = b.row; a.col = b.col;
    b.row = ar; b.col = ac;
  }

  private resolveMatches(silent: boolean): boolean {
    const matches = new Set<string>();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 2; c++) {
        const a = this.grid[r][c], b = this.grid[r][c + 1], d = this.grid[r][c + 2];
        if (a && b && d && a.color === b.color && b.color === d.color) {
          matches.add(`${r},${c}`); matches.add(`${r},${c + 1}`); matches.add(`${r},${c + 2}`);
        }
      }
    }
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS - 2; r++) {
        const a = this.grid[r][c], b = this.grid[r + 1][c], d = this.grid[r + 2][c];
        if (a && b && d && a.color === b.color && b.color === d.color) {
          matches.add(`${r},${c}`); matches.add(`${r + 1},${c}`); matches.add(`${r + 2},${c}`);
        }
      }
    }
    if (matches.size === 0) return false;
    matches.forEach((key) => {
      const [r, c] = key.split(",").map(Number);
      const cell = this.grid[r][c];
      if (!cell) return;
      if (!silent) {
        this.tweens.add({
          targets: cell.orb,
          scale: 0,
          alpha: 0,
          duration: 260,
          onComplete: () => cell.orb.destroy(),
        });
      } else {
        cell.orb.destroy();
      }
      this.grid[r][c] = null;
    });
    this.cleared += matches.size;
    this.hud?.setText(`◐ ${this.cleared}`);

    // drop + refill
    this.time.delayedCall(silent ? 10 : 280, () => {
      for (let c = 0; c < COLS; c++) {
        for (let r = ROWS - 1; r >= 0; r--) {
          if (!this.grid[r][c]) {
            for (let above = r - 1; above >= 0; above--) {
              if (this.grid[above][c]) {
                const moving = this.grid[above][c]!;
                this.grid[r][c] = moving;
                this.grid[above][c] = null;
                moving.row = r;
                this.tweens.add({
                  targets: moving.orb,
                  y: this.boardY + r * this.cellSize,
                  duration: 180,
                });
                break;
              }
            }
            if (!this.grid[r][c]) this.grid[r][c] = this.makeOrb(r, c);
          }
        }
      }
      this.time.delayedCall(220, () => this.resolveMatches(false));
    });
    return true;
  }
}
