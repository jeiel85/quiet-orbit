import { DEFAULT_APPEARANCE, sanitizeAppearance, type AvatarAppearance } from "@/lib/player/avatarAppearance";

// 아바타 외형 커스터마이징을 localStorage 에 영속화한다(메시지 진행도와 분리된 네임스페이스 키).
const STORAGE_KEY = "quiet-orbit:avatar-appearance";

/**
 * 저장된 외형을 읽는다.
 * - SSR/비브라우저, 미저장, 파싱 오류: 기본 외형으로 graceful 복구
 * - 일부 필드가 잘못돼도 sanitizeAppearance 가 해당 부위만 기본값으로 메운다
 */
export function loadAppearance(): AvatarAppearance {
  if (typeof window === "undefined") return { ...DEFAULT_APPEARANCE };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_APPEARANCE };
    return sanitizeAppearance(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_APPEARANCE };
  }
}

/** 외형을 저장한다. 실패(quota/프라이빗 모드 등)해도 조용히 무시한다. */
export function saveAppearance(appearance: AvatarAppearance): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
  } catch {
    // 저장 실패는 무시 — 외형은 메모리 상태로 유지된다.
  }
}
