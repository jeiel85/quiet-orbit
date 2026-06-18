import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { movementInput, resetJoystick } from "@/lib/input/movementInput";
import { useGameStore } from "@/store/useGameStore";
import { useSettingsStore } from "@/store/useSettingsStore";

// knob 가 base 중심에서 최대로 벗어나는 픽셀 거리. 이 값에서 입력이 ±1 이 된다.
const MAX_RADIUS = 44;

/**
 * 모바일 가상 조이스틱 (탱크식: 위=전진, 좌우=회전).
 * - 터치 디바이스 + 시작 이후에만 표시.
 * - 입력은 movementInput.joystick 싱글톤에 직접 기록(re-render 없음).
 * - knob 위치는 ref 로 직접 transform — 드래그 중 React state 갱신 안 함.
 */
export default function MobileJoystick() {
  const isTouch = useSettingsStore((s) => s.isTouch);
  const started = useGameStore((s) => s.started);
  const travel = useGameStore((s) => s.travel);

  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const pointerId = useRef<number | null>(null);
  const center = useRef({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  if (!isTouch || !started || travel) return null;

  const updateFrom = (clientX: number, clientY: number) => {
    let dx = clientX - center.current.x;
    let dy = clientY - center.current.y;
    const dist = Math.hypot(dx, dy);
    if (dist > MAX_RADIUS) {
      dx = (dx / dist) * MAX_RADIUS;
      dy = (dy / dist) * MAX_RADIUS;
    }
    if (knobRef.current) knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    // 위로 밀면 전진(+), 오른쪽으로 밀면 우회전(+).
    movementInput.joystick.forward = -dy / MAX_RADIUS;
    movementInput.joystick.turn = dx / MAX_RADIUS;
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    center.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    pointerId.current = e.pointerId;
    base.setPointerCapture(e.pointerId);
    setActive(true);
    updateFrom(e.clientX, e.clientY);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== e.pointerId) return;
    updateFrom(e.clientX, e.clientY);
  };

  const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== e.pointerId) return;
    pointerId.current = null;
    setActive(false);
    resetJoystick();
    if (knobRef.current) knobRef.current.style.transform = "translate(0px, 0px)";
  };

  return (
    <div className="pointer-events-auto absolute bottom-8 left-8 z-10 touch-none select-none">
      <div
        ref={baseRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        className="relative flex h-28 w-28 items-center justify-center rounded-full border border-[color:var(--color-text)]/15 bg-[color:var(--color-text)]/10 backdrop-blur-sm"
      >
        <div
          ref={knobRef}
          className={`h-14 w-14 rounded-full bg-[color:var(--color-background)]/90 shadow-md transition-[box-shadow] ${
            active ? "ring-2 ring-[color:var(--color-accent)]" : ""
          }`}
        />
      </div>
    </div>
  );
}
