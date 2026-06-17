// 클라이언트 디바이스/접근성 감지 헬퍼. SSR 안전(window 가드).

/** 터치 위주 디바이스인지 (조이스틱 표시·성능 옵션 판단). */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  return coarse || "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

/** OS 의 "동작 줄이기" 설정 여부. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}
