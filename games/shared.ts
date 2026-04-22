import * as Phaser from "phaser";

export function motionFromRegistry(scene: Phaser.Scene): number {
  const sensory = scene.registry.get("sensory") as { motion: "low" | "medium" | "high" } | undefined;
  if (!sensory) return 1;
  if (sensory.motion === "low") return 0.55;
  if (sensory.motion === "high") return 1.15;
  return 1;
}

export function endScene(scene: Phaser.Scene, reason: "finished" | "timeout" = "finished") {
  const onEnd = scene.registry.get("onEnd") as
    | ((reason: "finished" | "timeout") => void)
    | undefined;
  onEnd?.(reason);
}

export function softText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size = 18,
) {
  return scene.add
    .text(x, y, text, {
      fontFamily: "system-ui, sans-serif",
      fontSize: `${size}px`,
      color: "#e9edf2",
    })
    .setOrigin(0.5);
}

export function dimText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size = 14,
) {
  return scene.add
    .text(x, y, text, {
      fontFamily: "system-ui, sans-serif",
      fontSize: `${size}px`,
      color: "#8a96a6",
    })
    .setOrigin(0.5);
}
