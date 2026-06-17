import { useMemo, forwardRef } from "react";
import { DoubleSide, type Mesh } from "three";
import { getSoftShadowTexture } from "@/lib/three/softShadowTexture";

interface ShadowBlobProps {
  /** 그림자 반경(월드 단위). */
  radius?: number;
  /** 표면 위 살짝 띄우는 로컬 y (z-fighting 방지). */
  y?: number;
  opacity?: number;
}

/**
 * 부드러운 가짜 그림자 — 표면(로컬 XZ 평면)에 눕힌 반투명 plane.
 * 오브젝트를 바닥에 안착시켜 보이게 한다(실 shadowmap 대신 저비용·안전).
 * ref 를 넘기면 매 프레임 위치 보정(플레이어 bobbing 상쇄)에 쓸 수 있다.
 */
const ShadowBlob = forwardRef<Mesh, ShadowBlobProps>(function ShadowBlob(
  { radius = 0.32, y = 0.02, opacity = 1 },
  ref,
) {
  const texture = useMemo(() => getSoftShadowTexture(), []);
  if (!texture) return null;

  return (
    <mesh ref={ref} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
      <planeGeometry args={[radius * 2, radius * 2]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        side={DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
});

export default ShadowBlob;
