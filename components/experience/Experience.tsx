"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Scene from "./Scene";
import { theme } from "@/config/theme";

/**
 * 전체 화면 WebGL Canvas + UI 오버레이 레이어.
 * - 3D 레이어: <Canvas> 안의 Scene
 * - UI 레이어: Canvas 위에 absolute 로 얹는 HTML (이후 인트로/힌트/메시지 패널 자리)
 */
export default function Experience() {
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
            Yoonseul Planet
          </p>
        </header>
      </div>
    </div>
  );
}
