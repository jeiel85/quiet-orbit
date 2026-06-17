import { useMemo } from "react";
import { getSkyGradientTexture } from "@/lib/three/gradientTexture";

/**
 * 새벽빛 그라데이션 텍스처를 scene.background 로 선언적으로 붙인다.
 * attach="background" → R3F 가 마운트 시 scene.background 에 설정하고 언마운트 시 복원.
 */
export default function GradientBackground() {
  const texture = useMemo(() => getSkyGradientTexture(), []);
  if (!texture) return null;
  return <primitive object={texture} attach="background" />;
}
