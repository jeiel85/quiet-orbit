import type { MessageProgress } from "@/types/message";

// localStorage 접근을 한 곳에 모은다 (Goal 5 확장 대비).
// 키는 프로젝트 네임스페이스로 구분한다.
const STORAGE_KEY = "quiet-orbit:message-progress";

const emptyProgress = (): MessageProgress => ({
  readMessageIds: [],
  lastReadAtById: {},
});

/**
 * 저장된 읽음 진행 상태를 읽는다.
 * - SSR/비브라우저 환경: 빈 상태 반환
 * - JSON 파싱 오류·형식 불일치: 빈 상태로 graceful 복구 (앱은 계속 동작)
 */
export function loadProgress(): MessageProgress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return emptyProgress();

    const obj = parsed as Record<string, unknown>;
    const readMessageIds = Array.isArray(obj.readMessageIds)
      ? obj.readMessageIds.filter((v): v is string => typeof v === "string")
      : [];
    const lastReadAtById =
      typeof obj.lastReadAtById === "object" && obj.lastReadAtById !== null
        ? (obj.lastReadAtById as Record<string, string>)
        : {};

    return { readMessageIds, lastReadAtById };
  } catch {
    return emptyProgress();
  }
}

/** 진행 상태를 저장한다. 실패(quota/프라이빗 모드 등)해도 조용히 무시한다. */
export function saveProgress(progress: MessageProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // 저장 실패는 무시 — 읽음 표시는 메모리 상태로 유지된다.
  }
}

/** 저장된 진행 상태를 제거한다. */
export function clearProgress(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 무시
  }
}
