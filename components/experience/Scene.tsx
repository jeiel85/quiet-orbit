import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { theme } from "@/config/theme";

/**
 * 3D 월드의 최상위 구성. Goal 1 단계에서는 조명 + 테스트 행성만 둔다.
 * Goal 2 에서 Planet / Player / CameraRig 로 확장한다.
 */
export default function Scene() {
  const planetRef = useRef<Mesh>(null);

  // 프레임마다 ref 로 직접 회전시킨다 — React state 갱신을 만들지 않는다.
  // (docs/design/AGENTS.md: Prefer refs inside useFrame)
  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} />

      {/* 테스트용 행성 프리뷰 — Goal 2 에서 components/world/Planet.tsx 로 교체 */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshStandardMaterial color={theme.ground} />
      </mesh>
    </>
  );
}
