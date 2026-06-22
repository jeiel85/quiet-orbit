import type { Vector3 } from "three";

export type PlanetId = "home" | "dawn" | "ember" | "violet" | "summit" | "tide" | "brook";

export interface SurfacePoint {
  theta: number;
  phi: number;
  /** 진행 방향 회전값(rad). 0이면 남쪽(phi 증가 방향), +이면 동쪽 방향으로 돈다. */
  heading?: number;
  /** 표면 기준 추가 높이. */
  radiusOffset?: number;
}

export interface PlanetDefinition {
  id: PlanetId;
  name: string;
  subtitle: string;
  groundColor: string;
  accentColor: string;
  fogColor: string;
  startPoint: SurfacePoint;
}

export interface TravelSpot extends SurfacePoint {
  id: string;
  planetId: PlanetId;
  targetPlanetId: PlanetId;
  targetPoint: SurfacePoint;
  label: string;
  description: string;
  color: string;
  variant?: number;
}

export interface TravelState {
  spotId: string;
  fromPlanetId: PlanetId;
  toPlanetId: PlanetId;
  targetPoint: SurfacePoint;
  label: string;
  startedAt: number;
  durationMs: number;
}

/**
 * Player 가 매 프레임 갱신하고 CameraRig 가 읽는 공유 트랜스폼.
 * React state 를 거치지 않고 ref 처럼 직접 변경한다 (프레임마다 re-render 금지).
 */
export interface PlayerTransform {
  /** 월드 좌표 — 행성 표면에서 playerHeight 만큼 위. 크기는 항상 surfaceRadius. */
  position: Vector3;
  /** 단위 접선 진행 방향 (heading). up 에 직교. */
  forward: Vector3;
  /** 단위 표면 법선 (= normalize(position)). */
  up: Vector3;
}

/**
 * 행성 표면 위의 점을 구면 좌표로 표현 (Goal 3 의 메시지 Orb 배치에 사용).
 * x = r sin(phi) cos(theta), y = r cos(phi), z = r sin(phi) sin(theta)
 */
export interface SphericalPoint {
  id: string;
  theta: number;
  phi: number;
  radiusOffset?: number;
}
