import { create } from "zustand";
import { isTouchDevice, prefersReducedMotion } from "@/lib/device";
import { soundManager } from "@/lib/audio/soundManager";
import { loadAppearance, saveAppearance } from "@/lib/storage/localAppearance";
import {
  DEFAULT_APPEARANCE,
  type AvatarAppearance,
  type AvatarPart,
} from "@/lib/player/avatarAppearance";

interface SettingsStore {
  /** OS "동작 줄이기" — 부유/회전 등 지속 애니메이션을 끈다. */
  reduceMotion: boolean;
  /** 터치 디바이스 여부 — 조이스틱 표시·모바일 성능 옵션. */
  isTouch: boolean;
  /** 사운드 on/off (기본 off, 접근성 문서 권장). */
  soundEnabled: boolean;
  /** 플레이어 아바타 외형(부위별 색) — localStorage 영속. 모션과 무관. */
  appearance: AvatarAppearance;

  setReduceMotion: (value: boolean) => void;
  setSoundEnabled: (value: boolean) => void;
  /** 한 부위 색만 바꾼다. */
  setAppearancePart: (part: AvatarPart, color: string) => void;
  /** 외형 전체를 교체한다(프리셋 적용). */
  setAppearance: (appearance: AvatarAppearance) => void;
  /** 기본 외형으로 되돌린다. */
  resetAppearance: () => void;
}

// 모듈 로드 시 디바이스/접근성 설정 + 저장된 외형으로 초기화 (ssr:false 서브트리 → 클라이언트에서만 평가).
export const useSettingsStore = create<SettingsStore>((set, get) => ({
  reduceMotion: prefersReducedMotion(),
  isTouch: isTouchDevice(),
  soundEnabled: false,
  appearance: loadAppearance(),

  setReduceMotion: (value) => set({ reduceMotion: value }),
  setSoundEnabled: (value) => {
    soundManager.setEnabled(value);
    set({ soundEnabled: value });
  },

  setAppearancePart: (part, color) => {
    const next = { ...get().appearance, [part]: color };
    saveAppearance(next);
    set({ appearance: next });
  },
  setAppearance: (appearance) => {
    const next = { ...appearance };
    saveAppearance(next);
    set({ appearance: next });
  },
  resetAppearance: () => {
    const next = { ...DEFAULT_APPEARANCE };
    saveAppearance(next);
    set({ appearance: next });
  },
}));
