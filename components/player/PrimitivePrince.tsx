import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { type Group, type Mesh } from "three";
import { type AvatarAnimState, damp } from "@/lib/player/avatarAnim";

// 어린왕자 아키타입 색 — 원본 사이트 에셋 복제가 아닌 독립 디자인.
const SKIN = "#f1c9a5";
const HAIR = "#edb94a"; // 금발
const COAT = "#3c7a6b"; // 청록 코트
const COAT_DARK = "#2f6256";
const SCARF = "#e8745c"; // 따뜻한 코랄 — 흩날리는 스카프
const SHOE = "#5b4a3f";
const EYE = "#39291f";

// 두 다리 (x: +오른쪽). 보행 시 반대 위상으로 스윙.
const LEGS: ReadonlyArray<{ x: number; sign: 1 | -1 }> = [
  { x: 0.055, sign: 1 },
  { x: -0.055, sign: -1 },
];
// 두 팔 — 다리와 반대로 스윙.
const ARMS: ReadonlyArray<{ x: number; sign: 1 | -1 }> = [
  { x: 0.1, sign: -1 },
  { x: -0.1, sign: 1 },
];

/**
 * primitive 로 빚은 어린왕자 — 행성을 거니는 플레이어 아바타(원작 아키타입의 독립 해석).
 * 절차적 걷기(다리·팔 스윙, 몸 기울임)와 흩날리는 스카프를 공유 anim 상태로 구동한다.
 * 로컬 +Y = 표면 위, +Z = 정면. 발끝이 y≈-playerHeight(0.22) 에 닿도록 구성.
 */
export default function PrimitivePrince({ anim }: { anim: RefObject<AvatarAnimState> }) {
  const rigRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const scarfRef = useRef<Group>(null);
  const legRefs = useRef<Array<Group | null>>([null, null]);
  const armRefs = useRef<Array<Group | null>>([null, null]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const a = anim.current;
    const moving = a.moving && !a.reduceMotion;

    // 몸 기울임 — 회전 방향으로 살짝 롤, 이동 중 앞으로 살짝 피치.
    const rig = rigRef.current;
    if (rig) {
      const rollTarget = a.reduceMotion ? 0 : -a.turn * 0.16;
      const pitchTarget = a.reduceMotion ? 0 : moving ? 0.07 : 0;
      rig.rotation.z = damp(rig.rotation.z, rollTarget, 8, delta);
      rig.rotation.x = damp(rig.rotation.x, pitchTarget, 8, delta);
    }

    // 다리/팔 스윙.
    const swing = Math.sin(a.phase) * 0.55;
    for (let i = 0; i < LEGS.length; i++) {
      const leg = legRefs.current[i];
      if (!leg) continue;
      if (moving) leg.rotation.x = swing * LEGS[i].sign;
      else leg.rotation.x = damp(leg.rotation.x, 0, 12, delta);
    }
    for (let i = 0; i < ARMS.length; i++) {
      const arm = armRefs.current[i];
      if (!arm) continue;
      const target = moving ? swing * ARMS[i].sign * 0.7 : 0;
      arm.rotation.x = moving ? target : damp(arm.rotation.x, 0, 10, delta);
    }

    // 머리 idle — 가만히 있을 때 천천히 둘러봄.
    const head = headRef.current;
    if (head) {
      const look = a.reduceMotion ? 0 : moving ? 0 : Math.sin(a.elapsed * 0.8) * 0.18;
      head.rotation.y = damp(head.rotation.y, look, 4, delta);
    }

    // 스카프 — 이동 중엔 뒤로 흐르고(−Z 쪽으로 들림), idle 엔 부드럽게 펄럭임.
    const scarf = scarfRef.current;
    if (scarf) {
      if (a.reduceMotion) {
        scarf.rotation.x = damp(scarf.rotation.x, -0.2, 6, delta);
        scarf.rotation.y = damp(scarf.rotation.y, 0, 6, delta);
      } else {
        const flutter = moving
          ? Math.sin(a.phase * 1.3) * 0.12
          : Math.sin(a.elapsed * 2.6) * 0.16;
        const pitchTarget = (moving ? -0.85 : -0.2) + flutter;
        const yawTarget = Math.sin(a.elapsed * 2) * (moving ? 0.12 : 0.28);
        scarf.rotation.x = damp(scarf.rotation.x, pitchTarget, 7, delta);
        scarf.rotation.y = damp(scarf.rotation.y, yawTarget, 6, delta);
      }
    }
  });

  return (
    <group ref={rigRef}>
      {/* 코트(몸통) — 아래가 넓게 퍼지는 실루엣 */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.12, 0.2, 14]} />
        <meshStandardMaterial color={COAT} roughness={0.8} />
      </mesh>
      {/* 허리 벨트 */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.113, 0.113, 0.025, 14]} />
        <meshStandardMaterial color={COAT_DARK} roughness={0.7} />
      </mesh>
      {/* 코트 앞섶 라인 */}
      <mesh position={[0, 0.06, 0.085]}>
        <boxGeometry args={[0.02, 0.18, 0.02]} />
        <meshStandardMaterial color={COAT_DARK} roughness={0.7} />
      </mesh>

      {/* 다리 (엉덩이 피벗에서 스윙) */}
      {LEGS.map((leg, i) => (
        <group
          key={i}
          position={[leg.x, -0.04, 0]}
          ref={(el) => {
            legRefs.current[i] = el;
          }}
        >
          <mesh position={[0, -0.09, 0]} castShadow>
            <cylinderGeometry args={[0.032, 0.03, 0.18, 8]} />
            <meshStandardMaterial color={COAT_DARK} roughness={0.85} />
          </mesh>
          {/* 신발 */}
          <mesh position={[0, -0.17, 0.02]}>
            <boxGeometry args={[0.06, 0.04, 0.1]} />
            <meshStandardMaterial color={SHOE} roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* 팔 (어깨 피벗에서 스윙) */}
      {ARMS.map((arm, i) => (
        <group
          key={i}
          position={[arm.x, 0.13, 0]}
          ref={(el) => {
            armRefs.current[i] = el;
          }}
        >
          <mesh position={[0, -0.07, 0]} castShadow>
            <cylinderGeometry args={[0.026, 0.024, 0.14, 8]} />
            <meshStandardMaterial color={COAT} roughness={0.8} />
          </mesh>
          {/* 손 */}
          <mesh position={[0, -0.15, 0]}>
            <sphereGeometry args={[0.028, 10, 8]} />
            <meshStandardMaterial color={SKIN} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 스카프 — 목 둘레 + 뒤로 흩날리는 자락 */}
      <mesh position={[0, 0.17, 0]}>
        <torusGeometry args={[0.062, 0.026, 8, 16]} />
        <meshStandardMaterial color={SCARF} roughness={0.7} />
      </mesh>
      <group ref={scarfRef} position={[0, 0.16, -0.04]} rotation={[-0.2, 0, 0]}>
        <mesh position={[0, -0.07, -0.02]}>
          <boxGeometry args={[0.07, 0.16, 0.02]} />
          <meshStandardMaterial color={SCARF} roughness={0.7} />
        </mesh>
        <mesh position={[0.015, -0.17, -0.04]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[0.055, 0.12, 0.018]} />
          <meshStandardMaterial color={SCARF} roughness={0.7} />
        </mesh>
      </group>

      {/* 머리 */}
      <group ref={headRef} position={[0, 0.25, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.095, 18, 16]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
        {/* 금발 — 머리 위를 덮는 캡 + 앞머리 */}
        <mesh position={[0, 0.045, -0.01]} scale={[1.08, 0.95, 1.08]} castShadow>
          <sphereGeometry args={[0.092, 18, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          <meshStandardMaterial color={HAIR} roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.085, 0.03]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.04, 0.08, 8]} />
          <meshStandardMaterial color={HAIR} roughness={0.75} />
        </mesh>
        {/* 눈 */}
        <mesh position={[0.035, 0.0, 0.082]}>
          <sphereGeometry args={[0.013, 8, 8]} />
          <meshStandardMaterial color={EYE} roughness={0.3} />
        </mesh>
        <mesh position={[-0.035, 0.0, 0.082]}>
          <sphereGeometry args={[0.013, 8, 8]} />
          <meshStandardMaterial color={EYE} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}
