import * as Phaser from "phaser";
import { dimText, endScene, softText } from "../shared";

/**
 * Orb Matcher — Focus zone.
 * 6x6 grid of colored orbs. Tap one, tap an adjacent one to swap.
 * Matches of 3+ dissolve. No timer, no score pressure.
 * Session ends when user hits "done" button (soft complete at 180s).
 */

const COLORS = [0x7bd389, 0x5fa8d3, 0xb48ce0, 0xe0c27a, 0xe07a7a];
const COLS = 6;
const ROWS = 6;

type Cell = { orb: Phaser.GameObjects.Arc; color: number; row: number; col: number };

export default class OrbMatcher extends Phaser.Scene {
  private grid: (Cell | null)[][] = [];
  private selected: Cell | null = null;
  private boardX = 0;
  private boardY = 0;
  private cellSize = 56;
  private cleared = 0;
  private hud!: Phaser.GameObjects.Text;

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

    dimText(this, width / 2, 52, "Swap adjacent orbs. Match 3 or more.");

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
  }

  private makeOrb(row: number, col: number): Cell {
    const color = Phaser.Utils.Array.GetRandom(COLORS);
    const x = this.boardX + col * this.cellSize;
    const y = this.boardY + row * this.cellSize;
    const orb = this.add.circle(x, y, this.cellSize * 0.38, color);
    orb.setInteractive({ useHandCursor: true });
    orb.on("pointerdown", () => this.tap(row, col));
    return { orb, color, row, col };
  }

  private tap(row: number, col: number) {
    const cell = this.grid[row][col];
    if (!cell) return;
    if (!this.selected) {
      this.selected = cell;
      cell.orb.setStrokeStyle(3, 0xffffff, 0.8);
      return;
    }
    const sel = this.selected;
    sel.orb.setStrokeStyle();

    const adjacent =
      (Math.abs(sel.row - row) === 1 && sel.col === col) ||
      (Math.abs(sel.col - col) === 1 && sel.row === row);

    if (!adjacent || (sel.row === row && sel.col === col)) {
      this.selected = null;
      return;
    }

    this.swap(sel, cell);
    this.selected = null;
    this.time.delayedCall(180, () => {
      const matched = this.resolveMatches(false);
      if (!matched) this.swap(sel, cell); // swap back if no match
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
