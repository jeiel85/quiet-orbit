import { CanvasTexture, type Texture } from "three";

// 부드러운 원형 그림자용 radial-gradient 텍스처를 한 번만 만들어 공유한다.
// canvas/document 의존 → 클라이언트에서만 생성(ssr:false 서브트리). 비브라우저면 null.
let cached: Texture | null = null;

export function getSoftShadowTexture(): Texture | null {
  if (typeof document === "undefined") return null;
  if (cached) return cached;

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, "rgba(0,0,0,0.42)");
  gradient.addColorStop(0.55, "rgba(0,0,0,0.18)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  cached = new CanvasTexture(canvas);
  return cached;
}
