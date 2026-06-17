"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Scene from "./Scene";
import { theme } from "@/config/theme";
import { useInteractionKeys } from "@/components/controls/useInteractionKeys";
import InteractionHint from "@/components/ui/InteractionHint";
import MessagePanel from "@/components/ui/MessagePanel";

/**
 * 전체 화면 WebGL Canvas + UI 오버레이 레이어.
 * - 3D 레이어: <Canvas> 안의 Scene
 * - UI 레이어: Canvas 위에 absolute 로 얹는 HTML (이후 인트로/힌트/메시지 패널 자리)
 */
export default function Experience() {
  // Space/Enter 로 메시지 열기, Esc 로 닫기.
  useInteractionKeys();

  return (
    <div className="fixed inset-0">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
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

      {/* 메시지 패널 — 자체적으로 pointer-events 를 켠다(배경/버튼 클릭). */}
      <MessagePanel />
    </div>
  );
}
