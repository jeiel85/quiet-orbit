import { useEffect } from "react";
import { movementInput } from "@/lib/input/movementInput";

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
 * 키보드 이동 입력을 공유 싱글톤(movementInput.keyboard)에 기록한다.
 * 값은 keydown/keyup 에서만 갱신되고 프레임 루프는 resolveMovement() 로 읽기만 한다
 * → 매 프레임 React state 갱신 없음. 부수효과 전용 훅이라 반환값이 없다.
 */
export function useKeyboardInput(): void {
  useEffect(() => {
    const pressed = new Set<string>();

    const recompute = () => {
      let forward = 0;
      let turn = 0;
      if (pressed.has("w") || pressed.has("arrowup")) forward += 1;
      if (pressed.has("s") || pressed.has("arrowdown")) forward -= 1;
      if (pressed.has("d") || pressed.has("arrowright")) turn += 1;
      if (pressed.has("a") || pressed.has("arrowleft")) turn -= 1;
      movementInput.keyboard.forward = forward;
      movementInput.keyboard.turn = turn;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (!MOVE_KEYS.has(key)) return;
      if (key.startsWith("arrow")) e.preventDefault(); // 페이지 스크롤 방지
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
      movementInput.keyboard.forward = 0;
      movementInput.keyboard.turn = 0;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", reset);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", reset);
      reset();
    };
  }, []);
}
