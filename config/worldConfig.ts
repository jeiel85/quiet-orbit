// 월드/이동/카메라 튜닝 값을 한 곳에 모은다.
// 수치를 바꿔도 컴포넌트 코드는 그대로 — Goal 2 이동·카메라 감각을 여기서 조정한다.

const planetRadius = 3;
// 플레이어 중심이 행성 표면에서 떠 있는 높이. 아바타 절반 높이와 맞춰 바닥이 표면에 닿게 한다.
const playerHeight = 0.3;

export const worldConfig = {
  planetRadius,
  playerHeight,
  // 플레이어 중심이 위치하는 구의 반지름 (행성 중심 기준).
  surfaceRadius: planetRadius + playerHeight,

  // 이동
  moveSpeed: 1.6, // 표면을 따라가는 속도 (units/sec)
  turnSpeed: 2.0, // 좌우 회전 속도 (rad/sec)

  // 상호작용 (Goal 3)
  interactionRadius: 0.55,

  // 메시지 Orb
  orb: {
    heightOffset: 0.42, // 행성 표면 위로 띄우는 기본 높이
    radius: 0.17, // Orb 지오메트리 반지름
  },

  // 3인칭 추적 카메라
  camera: {
    distance: 4.5, // 플레이어 뒤쪽(−forward) 거리
    height: 2.0, // 플레이어 위쪽(up) 높이
    lookHeight: 0.4, // 바라보는 지점을 플레이어 머리 쪽으로 올리는 양
    lerp: 4, // 추적 부드러움 (클수록 빠르게 붙음)
  },
} as const;

export type WorldConfig = typeof worldConfig;
