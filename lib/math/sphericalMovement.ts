import { Quaternion, Vector3 } from "three";

// 프레임마다 새 객체를 만들지 않도록 모듈 스코프 임시값을 재사용한다.
// (useFrame 는 단일 스레드에서 순차 실행되므로 안전)
const _up = new Vector3();
const _axis = new Vector3();
const _q = new Quaternion();

/**
 * heading(forward) 을 up 축 둘레로 angle(rad) 만큼 회전 — 좌우 회전(turn).
 * 부동소수 누적 오차로 forward 가 up 에서 살짝 벗어나는 것을 막기 위해 재정규화한다.
 */
export function turn(forward: Vector3, up: Vector3, angle: number): void {
  if (angle === 0) return;
  _q.setFromAxisAngle(up, angle);
  forward.applyQuaternion(_q);
  // up 성분 제거 후 단위화 → 항상 접평면 위의 단위 벡터 유지
  forward.addScaledVector(up, -forward.dot(up)).normalize();
}

/**
 * 구 표면 위에서 forward 방향의 대원(great circle)을 따라 arc(rad) 만큼 전/후진.
 * position 과 forward 를 같은 회전으로 함께 돌리고, position 을 표면 반지름으로 보정한다.
 *
 * 회전축 = up × forward. 이 축 둘레로 +arc 회전하면 position 의 방향(법선)이
 * forward 쪽으로 이동한다(= 전진). arc 부호로 전/후진을 정한다.
 */
export function moveAlongSurface(
  position: Vector3,
  forward: Vector3,
  surfaceRadius: number,
  arc: number,
): void {
  if (arc === 0) return;
  _up.copy(position).normalize();
  _axis.copy(_up).cross(forward).normalize(); // up × forward
  _q.setFromAxisAngle(_axis, arc);

  position.applyQuaternion(_q).normalize().multiplyScalar(surfaceRadius);
  forward.applyQuaternion(_q);

  // 새 위치의 법선에 맞춰 forward 재정규화 (접평면 유지)
  _up.copy(position).normalize();
  forward.addScaledVector(_up, -forward.dot(_up)).normalize();
}
