import { theme } from "@/config/theme";
import { worldConfig } from "@/config/worldConfig";

/**
 * 작은 행성. Goal 2 에서는 sphereGeometry 한 개로 시작한다.
 * 이동/배치의 기준 반지름은 worldConfig.planetRadius 가 단일 소스다.
 * 후속(Goal 3~4): 장식 오브젝트, 텍스처, low-poly 지형으로 확장.
 */
export default function Planet() {
  return (
    <mesh>
      {/* flatShading 으로 은은한 패싯 느낌(low-poly) */}
      <sphereGeometry args={[worldConfig.planetRadius, 48, 32]} />
      <meshStandardMaterial color={theme.ground} flatShading roughness={0.95} />
    </mesh>
  );
}
