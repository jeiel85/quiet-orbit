import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { type Material, type Mesh } from "three";

/**
 * 씬의 모든 mesh 에 그림자 cast/receive 를 켠다(데스크톱 전용).
 * 투명 헬퍼(가짜 그림자 plane: transparent + depthWrite=false)는 제외한다.
 * 메시마다 prop 을 다는 수고를 피하려고 마운트 후 traverse 로 일괄 설정.
 */
export default function EnableShadows() {
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as Material | Material[] | undefined;
      if (!Array.isArray(mat) && mat && mat.transparent && mat.depthWrite === false) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
  }, [scene]);

  return null;
}
