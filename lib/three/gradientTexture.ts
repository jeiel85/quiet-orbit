import { CanvasTexture, SRGBColorSpace, type Texture } from "three";

// 새벽빛 세로 그라데이션을 scene.background 용 텍스처로 한 번만 생성해 공유.
// scene.background 2D 텍스처는 화면을 채우며 그려지므로(세로 V 변화) 깔끔한 그라데이션 하늘이 된다.
// 포스트프로세싱(EffectComposer)이 배경까지 캡처하므로 투명 캔버스보다 안전하다.
let cached: Texture | null = null;

export function getSkyGradientTexture(): Texture | null {
  if (typeof document === "undefined") return null;
  if (cached) return cached;

  const w = 16;
  const h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#a7d8ef"); // 위: 새벽 하늘
  g.addColorStop(0.52, "#c8e9f1"); // 중간
  g.addColorStop(1, "#f2e3cd"); // 아래: 따뜻한 지평
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  cached = tex;
  return tex;
}
