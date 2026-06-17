export interface MovementVector {
  /** 전/후진 의도: 1 = 전진, -1 = 후진, 0 = 정지. */
  forward: number;
  /** 좌우 회전 의도: -1 = 좌회전, 1 = 우회전, 0 = 없음. */
  turn: number;
}

// 키보드와 조이스틱 입력을 보관하는 공유 가변 싱글톤.
// HTML 오버레이(조이스틱)와 R3F Player 가 React state/re-render 없이 공유한다.
// useFrame 은 매 프레임 resolveMovement() 로 합쳐 읽기만 한다.
const keyboard: MovementVector = { forward: 0, turn: 0 };
const joystick: MovementVector = { forward: 0, turn: 0 };

export const movementInput = { keyboard, joystick };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** 키보드 + 조이스틱을 합친 최종 이동 의도. forward/turn ∈ [-1, 1]. */
export function resolveMovement(): MovementVector {
  return {
    forward: clamp(keyboard.forward + joystick.forward, -1, 1),
    turn: clamp(keyboard.turn + joystick.turn, -1, 1),
  };
}

/** 조이스틱 입력 초기화 (터치 종료 시). */
export function resetJoystick(): void {
  joystick.forward = 0;
  joystick.turn = 0;
}
