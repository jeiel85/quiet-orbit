import { Vector3 } from "three";

/**
 * 구면 좌표 → 직교 월드 좌표.
 *   x = r·sin(phi)·cos(theta)
 *   y = r·cos(phi)
 *   z = r·sin(phi)·sin(theta)
 * phi=0 이 북극(+Y), phi=PI 가 남극(−Y).
 * 메시지 Orb 배치 등 표면 위 고정 지점을 계산할 때 사용한다.
 */
export function sphericalToWorld(theta: number, phi: number, radius: number): Vector3 {
  const sinPhi = Math.sin(phi);
  return new Vector3(
    radius * sinPhi * Math.cos(theta),
    radius * Math.cos(phi),
    radius * sinPhi * Math.sin(theta),
  );
}
