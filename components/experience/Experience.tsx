"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import Scene from "./Scene";
import { theme } from "@/config/theme";
import { isTouchDevice } from "@/lib/device";
import { useKeyboardInput } from "@/components/controls/useKeyboardInput";
import { useInteractionKeys } from "@/components/controls/useInteractionKeys";
import InteractionHint from "@/components/ui/InteractionHint";
import IntroOverlay from "@/components/ui/IntroOverlay";
import MessagePanel from "@/components/ui/MessagePanel";
import MobileJoystick from "@/components/controls/MobileJoystick";

/**
 * 전체 화면 WebGL Canvas + UI 오버레이 레이어.
 * - 3D 레이어: <Canvas> 안의 Scene
 * - UI 레이어: 인트로 / 힌트 / 메시지 패널 / 모바일 조이스틱
 * 성능: 모바일은 dpr 상한과 antialias 를 낮춘다(설계 08).
 */
export default function Experience() {
  // 입력 리스너 부착 (싱글톤에 기록) + 메시지 상호작용 키.
  useKeyboardInput();
  useInteractionKeys();

  const touch = useMemo(() => isTouchDevice(), []);
  const dpr = useMemo<[number, number]>(() => (touch ? [1, 1.25] : [1, 1.5]), [touch]);

  return (
    <div className="fixed inset-0">
      <Canvas
        dpr={dpr}
        gl={{ antialias: !touch, powerPreference: "high-performance" }}
        camera={{ fov: 45, near: 0.1, far: 100, position: [0, 3, 7] }}
      >
        <color attach="background" args={[theme.sky]} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* UI 오버레이 레이어 — 기본은 클릭 통과(pointer-events-none).
          개별 UI 요소에서만 pointer-events 를 다시 켠다. */}
      <div className="pointer-events-none absolute inset-0 select-none">
        <header className="absolute left-5 top-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-text)] opacity-60">
            Quiet Orbit
          </p>
        </header>

        <InteractionHint />
      </div>

      {/* 자체적으로 pointer-events 를 켜는 인터랙티브 요소들. */}
      <MobileJoystick />
      <MessagePanel />
      <IntroOverlay />
    </div>
  );
}
