import { MathUtils } from "three";

/**
 * Player(컨트롤러)가 매 프레임 갱신하고 아바타(GLB/primitive)가 읽는 공유 애니메이션 입력.
 * ref 로 공유하므로 re-render 없이 컨트롤러↔아바타가 통신한다.
 */
export interface AvatarAnimState {
  /** 이동 중인지 (걷기 클립/다리 스윙 트리거). */
  moving: boolean;
  /** 현재 회전 입력 (-1..1) — 몸 기울임. */
  turn: number;
  /** 걸음 주기 누적값. */
  phase: number;
  /** idle 시간 누적값. */
  elapsed: number;
  /** OS 동작 줄이기 — 보조 모션 정지. */
  reduceMotion: boolean;
}

export function createAvatarAnim(): AvatarAnimState {
  return { moving: false, turn: 0, phase: 0, elapsed: 0, reduceMotion: false };
}

/** 프레임율 독립 지수 감쇠 보간. */
export const damp = (current: number, target: number, lambda: number, dt: number): number =>
  MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
