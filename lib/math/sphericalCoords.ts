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

/**
 * 구면 좌표 지점의 접평면에서 진행 방향을 만든다.
 * heading=0 은 phi 증가 방향(북극에서 남극으로), +값은 동쪽(theta 증가 방향)으로 회전한다.
 */
export function sphericalForward(theta: number, phi: number, heading = 0): Vector3 {
  const east = new Vector3(-Math.sin(theta), 0, Math.cos(theta)).normalize();
  const south = new Vector3(
    Math.cos(phi) * Math.cos(theta),
    -Math.sin(phi),
    Math.cos(phi) * Math.sin(theta),
  ).normalize();

  return south.multiplyScalar(Math.cos(heading)).addScaledVector(east, Math.sin(heading)).normalize();
}
