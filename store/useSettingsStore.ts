import { create } from "zustand";
import { isTouchDevice, prefersReducedMotion } from "@/lib/device";
import { soundManager } from "@/lib/audio/soundManager";

interface SettingsStore {
  /** OS "동작 줄이기" — 부유/회전 등 지속 애니메이션을 끈다. */
  reduceMotion: boolean;
  /** 터치 디바이스 여부 — 조이스틱 표시·모바일 성능 옵션. */
  isTouch: boolean;
  /** 사운드 on/off (기본 off, 접근성 문서 권장). */
  soundEnabled: boolean;

  setReduceMotion: (value: boolean) => void;
  setSoundEnabled: (value: boolean) => void;
}

// 모듈 로드 시 디바이스/접근성 설정으로 초기화 (ssr:false 서브트리 → 클라이언트에서만 평가).
export const useSettingsStore = create<SettingsStore>((set) => ({
  reduceMotion: prefersReducedMotion(),
  isTouch: isTouchDevice(),
  soundEnabled: false,

  setReduceMotion: (value) => set({ reduceMotion: value }),
  setSoundEnabled: (value) => {
    soundManager.setEnabled(value);
    set({ soundEnabled: value });
  },
}));
