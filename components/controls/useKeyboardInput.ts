import { useEffect, useRef, type RefObject } from "react";

export interface MovementInput {
  /** 전/후진: 1 = 전진(W/↑), -1 = 후진(S/↓), 0 = 정지 */
  forward: number;
  /** 좌우 회전: -1 = 좌회전(A/←), 1 = 우회전(D/→), 0 = 없음 */
  turn: number;
}

const MOVE_KEYS = new Set([
  "w",
  "a",
  "s",
  "d",
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
]);

/**
 * 키보드 이동 입력을 ref 로 노출한다.
 * 값은 keydown/keyup 이벤트에서만 갱신되고, 프레임 루프(useFrame)는 ref 를 읽기만 한다.
 * → 매 프레임 React state 갱신이 발생하지 않는다.
 */
export function useKeyboardInput(): RefObject<MovementInput> {
  const input = useRef<MovementInput>({ forward: 0, turn: 0 });

  useEffect(() => {
    const pressed = new Set<string>();

    const recompute = () => {
      let forward = 0;
      let turn = 0;
      if (pressed.has("w") || pressed.has("arrowup")) forward += 1;
      if (pressed.has("s") || pressed.has("arrowdown")) forward -= 1;
      if (pressed.has("d") || pressed.has("arrowright")) turn += 1;
      if (pressed.has("a") || pressed.has("arrowleft")) turn -= 1;
      input.current.forward = forward;
      input.current.turn = turn;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (!MOVE_KEYS.has(key)) return;
      // 방향키가 페이지를 스크롤하지 않도록 막는다.
      if (key.startsWith("arrow")) e.preventDefault();
      if (!pressed.has(key)) {
        pressed.add(key);
        recompute();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (pressed.delete(key)) recompute();
    };

    // 탭 전환·포커스 이탈 시 키가 눌린 채로 남아 계속 움직이는 것을 방지.
    const reset = () => {
      pressed.clear();
      input.current.forward = 0;
      input.current.turn = 0;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", reset);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", reset);
    };
  }, []);

  return input;
}
