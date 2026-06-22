/**
 * 플레이어 아바타 외형 커스터마이징 도메인.
 *
 * 캐릭터는 단일 Kenney Mini GLB 에 팔레트 텍스처(colormap.png) 하나만 쓴다.
 * 신체 부위별 머티리얼 슬롯이 없고, 각 부위가 팔레트의 특정 "세로 색 컬럼"을 UV 로 가리킨다.
 * 따라서 외형 변경 = 그 팔레트 영역을 명암(그라데이션)을 보존한 채 다시 칠한 텍스처로 교체하는 것.
 * 모델의 스켈레톤·애니메이션 클립·rig 는 전혀 건드리지 않으므로 모션은 100% 그대로 유지된다.
 *
 * 아래 UV 영역은 GLB 의 정점 UV·POSITION 을 분석해 산출했다(부위↔팔레트 컬럼 매핑):
 *   피부=갈색 컬럼(얼굴+손), 머리=진회색 컬럼(머리 최상단),
 *   상의=초록 컬럼(상체), 하의=파랑 컬럼(하체), 신발=주황 컬럼(발).
 */

export const AVATAR_PARTS = ["skin", "hair", "top", "bottom", "shoes"] as const;
export type AvatarPart = (typeof AVATAR_PARTS)[number];

/** 부위 → 사용자 색(hex). */
export type AvatarAppearance = Record<AvatarPart, string>;

export const AVATAR_PART_LABELS: Record<AvatarPart, string> = {
  skin: "피부",
  hair: "머리",
  top: "상의",
  bottom: "하의",
  shoes: "신발",
};

/** colormap(0..1, top-origin v) 상에서 한 부위가 차지하는 직사각 팔레트 영역. */
export interface ColormapRegion {
  u: [number, number];
  v: [number, number];
}

/**
 * 부위별 리컬러 영역. 팔레트는 8칸 컬럼 그리드, v 0.5~0.75 = 옷(밝은 띠), v 0.75~1.0 = 피부/머리(어두운 띠).
 * 영역은 넉넉히 컬럼 전체를 덮어 텍스처 보간(bleed)까지 안전하게 칠한다 — 사용되지 않는 텍셀을 칠해도 무해하다.
 */
export const APPEARANCE_REGIONS: Record<AvatarPart, ColormapRegion> = {
  skin: { u: [0.625, 0.875], v: [0.75, 1.0] }, // col5·col6 하단 (얼굴+손, 양 메시 공통)
  hair: { u: [0.0, 0.125], v: [0.75, 1.0] }, //   col0 하단 (머리 최상단)
  top: { u: [0.125, 0.25], v: [0.5, 0.75] }, //   col1 중간 (상체)
  bottom: { u: [0.625, 0.75], v: [0.5, 0.75] }, // col5 중간 (하체)
  shoes: { u: [0.25, 0.375], v: [0.5, 0.75] }, //  col2 중간 (발)
};

/**
 * 기본 외형 = 원본 모델의 부위별 대표 색(중간 명도).
 * 리컬러는 "target === default" 인 부위를 건너뛰므로, 기본값일 때 텍스처는 원본과 픽셀 단위로 동일하다.
 */
export const DEFAULT_APPEARANCE: AvatarAppearance = {
  skin: "#9b5a41",
  hair: "#3d3d44",
  top: "#3dab78",
  bottom: "#5e72cc",
  shoes: "#ffb348",
};

export interface AvatarPreset {
  id: string;
  label: string;
  colors: AvatarAppearance;
}

/** 색이 조화롭게 묶인 큐레이션 외형 프리셋(감성 톤). */
export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: "traveler",
    label: "여행자",
    colors: { ...DEFAULT_APPEARANCE },
  },
  {
    id: "dusk",
    label: "노을",
    colors: { skin: "#b06a4a", hair: "#43302b", top: "#e0734a", bottom: "#8a5a86", shoes: "#f3b24a" },
  },
  {
    id: "abyss",
    label: "심해",
    colors: { skin: "#8c6f63", hair: "#26323c", top: "#2f8f9c", bottom: "#2f4f8f", shoes: "#66b3c2" },
  },
  {
    id: "meadow",
    label: "숲",
    colors: { skin: "#a06a44", hair: "#3a2e22", top: "#6fae45", bottom: "#6f5a3a", shoes: "#d8b06a" },
  },
  {
    id: "moonlight",
    label: "달빛",
    colors: { skin: "#9b5a41", hair: "#3a3f55", top: "#8290c4", bottom: "#4a5378", shoes: "#aab2cf" },
  },
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function isValidHex(value: unknown): value is string {
  return typeof value === "string" && HEX_RE.test(value);
}

/** 저장값·외부 입력을 검증해 항상 완전한 AvatarAppearance 로 정규화한다(잘못된 값은 기본값으로). */
export function sanitizeAppearance(input: unknown): AvatarAppearance {
  const obj = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const result = {} as AvatarAppearance;
  for (const part of AVATAR_PARTS) {
    const value = obj[part];
    result[part] = isValidHex(value) ? value.toLowerCase() : DEFAULT_APPEARANCE[part];
  }
  return result;
}

/** 현재 외형과 정확히 일치하는 프리셋 id (없으면 null — "직접 조정" 상태). */
export function matchPresetId(appearance: AvatarAppearance): string | null {
  for (const preset of AVATAR_PRESETS) {
    if (AVATAR_PARTS.every((p) => preset.colors[p].toLowerCase() === appearance[p].toLowerCase())) {
      return preset.id;
    }
  }
  return null;
}
