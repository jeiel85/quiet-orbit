import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { type Group } from "three";
import { type AvatarAnimState, damp } from "@/lib/player/avatarAnim";

// 어린왕자 아키타입 색 — 원본 사이트 에셋 복제가 아닌 독립 디자인.
const SKIN = "#f1c9a5";
const HAIR = "#edb94a";
const COAT = "#3c7a6b";
const COAT_DARK = "#2f6256";
const SCARF = "#e8745c";
const SHOE = "#5b4a3f";
const EYE = "#39291f";
const GOLD = "#f0c96a";

// 6~7등신 작은 인형 실루엣: 머리 지름≈0.1, 전체 높이≈0.66.
const LEGS: ReadonlyArray<{ x: number; sign: 1 | -1 }> = [
  { x: 0.04, sign: 1 },
  { x: -0.04, sign: -1 },
];
const ARMS: ReadonlyArray<{ x: number; sign: 1 | -1 }> = [
  { x: 0.078, sign: -1 },
  { x: -0.078, sign: 1 },
];

/**
 * primitive 로 빚은 어린왕자 — 행성 위에서 읽히도록 단순하지만 비율은 6~7등신에 맞춘다.
 * 로컬 +Y = 표면 위, +Z = 정면. 발끝이 y≈-0.22 에 닿아 worldConfig.playerHeight 와 맞는다.
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

    const rig = rigRef.current;
    if (rig) {
      const rollTarget = a.reduceMotion ? 0 : -a.turn * 0.13;
      const pitchTarget = a.reduceMotion ? 0 : moving ? 0.045 : 0;
      rig.rotation.z = damp(rig.rotation.z, rollTarget, 8, delta);
      rig.rotation.x = damp(rig.rotation.x, pitchTarget, 8, delta);
    }

    const swing = Math.sin(a.phase) * 0.5;
    for (let i = 0; i < LEGS.length; i++) {
      const leg = legRefs.current[i];
      if (!leg) continue;
      leg.rotation.x = moving ? swing * LEGS[i].sign : damp(leg.rotation.x, 0, 12, delta);
    }
    for (let i = 0; i < ARMS.length; i++) {
      const arm = armRefs.current[i];
      if (!arm) continue;
      const target = moving ? swing * ARMS[i].sign * 0.58 : 0;
      arm.rotation.x = moving ? target : damp(arm.rotation.x, 0, 10, delta);
    }

    const head = headRef.current;
    if (head) {
      const look = a.reduceMotion ? 0 : moving ? 0 : Math.sin(a.elapsed * 0.8) * 0.13;
      head.rotation.y = damp(head.rotation.y, look, 4, delta);
      head.rotation.z = a.reduceMotion ? 0 : Math.sin(a.elapsed * 1.1) * 0.025;
    }

    const scarf = scarfRef.current;
    if (scarf) {
      if (a.reduceMotion) {
        scarf.rotation.x = damp(scarf.rotation.x, -0.2, 6, delta);
        scarf.rotation.y = damp(scarf.rotation.y, 0, 6, delta);
      } else {
        const flutter = moving
          ? Math.sin(a.phase * 1.35) * 0.1
          : Math.sin(a.elapsed * 2.4) * 0.13;
        scarf.rotation.x = damp(scarf.rotation.x, (moving ? -0.72 : -0.18) + flutter, 7, delta);
        scarf.rotation.y = damp(scarf.rotation.y, Math.sin(a.elapsed * 2) * (moving ? 0.1 : 0.2), 6, delta);
      }
    }
  });

  return (
    <group ref={rigRef}>
      {/* 다리: 길게 내려와 6~7등신 비율을 만든다. */}
      {LEGS.map((leg, i) => (
        <group
          key={i}
          position={[leg.x, -0.02, 0]}
          ref={(el) => {
            legRefs.current[i] = el;
          }}
        >
          <mesh position={[0, -0.095, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.024, 0.21, 8]} />
            <meshStandardMaterial color={COAT_DARK} roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.205, 0.022]}>
            <boxGeometry args={[0.052, 0.03, 0.082]} />
            <meshStandardMaterial color={SHOE} roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* 슬림 코트 */}
      <mesh position={[0, 0.09, 0]} castShadow>
        <cylinderGeometry args={[0.052, 0.082, 0.25, 14]} />
        <meshStandardMaterial color={COAT} roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.025, 0]}>
        <cylinderGeometry args={[0.083, 0.083, 0.022, 14]} />
        <meshStandardMaterial color={COAT_DARK} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.09, 0.062]}>
        <boxGeometry args={[0.016, 0.19, 0.015]} />
        <meshStandardMaterial color={COAT_DARK} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.205, 0]}>
        <sphereGeometry args={[0.052, 12, 10]} />
        <meshStandardMaterial color={COAT} roughness={0.75} />
      </mesh>

      {/* 팔과 작은 손 */}
      {ARMS.map((arm, i) => (
        <group
          key={i}
          position={[arm.x, 0.17, 0]}
          rotation={[0, 0, arm.x > 0 ? -0.18 : 0.18]}
          ref={(el) => {
            armRefs.current[i] = el;
          }}
        >
          <mesh position={[0, -0.085, 0]} castShadow>
            <cylinderGeometry args={[0.017, 0.019, 0.19, 8]} />
            <meshStandardMaterial color={COAT} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.185, 0]}>
            <sphereGeometry args={[0.022, 10, 8]} />
            <meshStandardMaterial color={SKIN} roughness={0.68} />
          </mesh>
        </group>
      ))}

      {/* 스카프: 작은 몸에 비해 선명한 실루엣 포인트 */}
      <mesh position={[0, 0.255, 0]}>
        <torusGeometry args={[0.048, 0.017, 8, 16]} />
        <meshStandardMaterial color={SCARF} roughness={0.7} />
      </mesh>
      <group ref={scarfRef} position={[0, 0.245, -0.035]} rotation={[-0.18, 0, 0]}>
        <mesh position={[0, -0.06, -0.02]}>
          <boxGeometry args={[0.052, 0.14, 0.015]} />
          <meshStandardMaterial color={SCARF} roughness={0.7} />
        </mesh>
        <mesh position={[0.012, -0.145, -0.04]} rotation={[0, 0, 0.12]}>
          <boxGeometry args={[0.042, 0.1, 0.014]} />
          <meshStandardMaterial color={SCARF} roughness={0.7} />
        </mesh>
      </group>

      {/* 작은 머리 + 금발. 머리가 작아져 사람 비율이 읽힌다. */}
      <group ref={headRef} position={[0, 0.345, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.055, 18, 16]} />
          <meshStandardMaterial color={SKIN} roughness={0.58} />
        </mesh>
        <mesh position={[0, 0.025, -0.005]} scale={[1.08, 0.9, 1.08]} castShadow>
          <sphereGeometry args={[0.055, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          <meshStandardMaterial color={HAIR} roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.058, 0.016]} rotation={[0.25, 0, 0]}>
          <coneGeometry args={[0.026, 0.058, 7]} />
          <meshStandardMaterial color={HAIR} roughness={0.75} />
        </mesh>
        <mesh position={[0.032, 0.034, 0.0]} rotation={[0.2, 0, -0.4]}>
          <coneGeometry args={[0.018, 0.045, 6]} />
          <meshStandardMaterial color={HAIR} roughness={0.75} />
        </mesh>
        <mesh position={[-0.03, 0.035, 0.002]} rotation={[0.2, 0, 0.45]}>
          <coneGeometry args={[0.017, 0.042, 6]} />
          <meshStandardMaterial color={HAIR} roughness={0.75} />
        </mesh>

        {/* 작게만 찍어 가까이서 보일 정도의 표정 */}
        <mesh position={[0.019, -0.002, 0.049]}>
          <sphereGeometry args={[0.0065, 8, 8]} />
          <meshStandardMaterial color={EYE} roughness={0.28} />
        </mesh>
        <mesh position={[-0.019, -0.002, 0.049]}>
          <sphereGeometry args={[0.0065, 8, 8]} />
          <meshStandardMaterial color={EYE} roughness={0.28} />
        </mesh>
        <mesh position={[0, -0.023, 0.05]} scale={[1, 0.45, 0.4]}>
          <sphereGeometry args={[0.01, 8, 6]} />
          <meshStandardMaterial color="#d88d7c" roughness={0.5} />
        </mesh>
      </group>

      {/* 작은 왕자감만 남기는 별 배지 */}
      <mesh position={[0.035, 0.15, 0.067]} rotation={[0, 0, 0.2]}>
        <icosahedronGeometry args={[0.018, 0]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.15} roughness={0.45} />
      </mesh>
    </group>
  );
}
