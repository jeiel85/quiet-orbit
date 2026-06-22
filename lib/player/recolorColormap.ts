import { CanvasTexture, SRGBColorSpace } from "three";
import {
  APPEARANCE_REGIONS,
  AVATAR_PARTS,
  DEFAULT_APPEARANCE,
  type AvatarAppearance,
} from "./avatarAppearance";

/**
 * colormap 팔레트 텍스처를 부위별 사용자 색으로 다시 칠한다.
 * 각 부위 영역은 원본의 명암(HSL 의 L)을 보존하고 색상/채도만 사용자 색으로 바꾼다 →
 * 셰이딩/그라데이션이 그대로 살아 모델이 평평해지지 않는다.
 *
 * 모델의 지오메트리·스켈레톤·애니메이션과 무관 — baseColor 텍스처만 교체하므로 모션은 유지된다.
 */

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** 원본 colormap 이미지를 사용자 외형으로 칠한 캔버스를 만든다(브라우저 전용). */
function paintColormap(
  source: CanvasImageSource,
  width: number,
  height: number,
  appearance: AvatarAppearance,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas;
  ctx.drawImage(source, 0, 0, width, height);

  for (const part of AVATAR_PARTS) {
    const target = appearance[part];
    const ref = DEFAULT_APPEARANCE[part];
    // 기본값과 같은 부위는 건드리지 않는다 → 원본 픽셀 보존(HSL 왕복 오차 없음).
    if (target.toLowerCase() === ref.toLowerCase()) continue;

    const region = APPEARANCE_REGIONS[part];
    const x0 = Math.floor(region.u[0] * width);
    const y0 = Math.floor(region.v[0] * height);
    const w = Math.ceil((region.u[1] - region.u[0]) * width);
    const h = Math.ceil((region.v[1] - region.v[0]) * height);
    if (w <= 0 || h <= 0) continue;

    const [tr, tg, tb] = hexToRgb(target);
    const [, ts, tl] = rgbToHsl(tr, tg, tb);
    const [th] = rgbToHsl(tr, tg, tb);
    const [, , rl] = rgbToHsl(...hexToRgb(ref));
    // 명암 스케일: 원본 부위의 중간 명도(rl)를 사용자 색의 명도(tl)에 맞춰 램프 전체를 끌어올리거나 낮춘다.
    const lScale = rl > 0.001 ? tl / rl : 1;

    const img = ctx.getImageData(x0, y0, w, h);
    const data = img.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // 사용되지 않는 검정 텍셀은 건너뛴다(팔레트 빈 칸).
      if (r + g + b < 24) continue;
      const [, , l] = rgbToHsl(r, g, b);
      const [nr, ng, nb] = hslToRgb(th, ts, clamp01(l * lScale));
      data[i] = nr;
      data[i + 1] = ng;
      data[i + 2] = nb;
    }
    ctx.putImageData(img, x0, y0);
  }

  return canvas;
}

/**
 * 사용자 외형으로 칠한 colormap 을 three CanvasTexture 로 만든다.
 * 원본 GLTF 텍스처와 동일하게 flipY=false, sRGB 로 맞춰 UV 샘플링이 어긋나지 않게 한다.
 */
export function buildAppearanceTexture(
  source: CanvasImageSource,
  width: number,
  height: number,
  appearance: AvatarAppearance,
): CanvasTexture {
  const canvas = paintColormap(source, width, height, appearance);
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.flipY = false;
  tex.needsUpdate = true;
  return tex;
}
