import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { type Group, type Mesh } from "three";
import { type AvatarAnimState, damp } from "@/lib/player/avatarAnim";

const FUR = "#e8965a";
const FUR_DARK = "#cf7a3f";
const CREAM = "#f6e8d6";
const DARK = "#39291f";

// 다리 배치 (x: +오른쪽, z: +앞). 대각선 보행 위상.
const LEGS: ReadonlyArray<{ x: number; z: number; sign: 1 | -1 }> = [
  { x: 0.1, z: 0.08, sign: 1 },
  { x: -0.1, z: 0.08, sign: -1 },
  { x: 0.1, z: -0.08, sign: -1 },
  { x: -0.1, z: -0.08, sign: 1 },
];

/**
 * primitive 로 빚은 둥근 여우 — GLB 로딩 중/실패 시 폴백 아바타.
 * 절차적 걷기(다리 스윙·기울임·귀·꼬리)는 공유 anim 상태를 읽어 자체 useFrame 에서 처리.
 * 로컬 +Y = 표면 위, +Z = 정면.
 */
export default function PrimitiveFox({ anim }: { anim: RefObject<AvatarAnimState> }) {
  const rigRef = useRef<Group>(null);
  const tailRef = useRef<Group>(null);
  const legRefs = useRef<Array<Group | null>>([null, null, null, null]);
  const earRefs = useRef<Array<Mesh | null>>([null, null]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const a = anim.current;

    const rig = rigRef.current;
    if (rig) {
      const rollTarget = a.reduceMotion ? 0 : -a.turn * 0.18;
      const pitchTarget = a.reduceMotion ? 0 : a.moving ? 0.06 : 0;
      rig.rotation.z = damp(rig.rotation.z, rollTarget, 8, delta);
      rig.rotation.x = damp(rig.rotation.x, pitchTarget, 8, delta);
    }

    const swing = Math.sin(a.phase) * 0.5;
    const legMoving = a.moving && !a.reduceMotion;
    for (let i = 0; i < LEGS.length; i++) {
      const leg = legRefs.current[i];
      if (!leg) continue;
      if (legMoving) leg.rotation.x = swing * LEGS[i].sign;
      else leg.rotation.x = damp(leg.rotation.x, 0, 14, delta);
    }

    const earFlop = a.reduceMotion
      ? 0
      : a.moving
        ? Math.sin(a.phase) * 0.12
        : Math.sin(a.elapsed * 1.3) * 0.04;
    if (earRefs.current[0]) earRefs.current[0].rotation.x = earFlop;
    if (earRefs.current[1]) earRefs.current[1].rotation.x = earFlop;

    const tail = tailRef.current;
    if (tail) {
      const sway = a.reduceMotion
        ? 0
        : a.moving
          ? Math.sin(a.phase * 0.5) * 0.25
          : Math.sin(a.elapsed * 1.5) * 0.1;
      tail.rotation.y = damp(tail.rotation.y, sway, 8, delta);
    }
  });

  return (
    <group ref={rigRef}>
      <mesh scale={[1, 0.9, 1.05]}>
        <sphereGeometry args={[0.2, 18, 16]} />
        <meshStandardMaterial color={FUR} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.02, 0.13]}>
        <sphereGeometry args={[0.12, 16, 14]} />
        <meshStandardMaterial color={CREAM} roughness={0.75} />
      </mesh>

      <mesh position={[0, 0.13, 0.12]}>
        <sphereGeometry args={[0.145, 18, 16]} />
        <meshStandardMaterial color={FUR} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.09, 0.24]}>
        <sphereGeometry args={[0.07, 14, 12]} />
        <meshStandardMaterial color={CREAM} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.1, 0.305]}>
        <sphereGeometry args={[0.025, 10, 10]} />
        <meshStandardMaterial color={DARK} roughness={0.4} />
      </mesh>
      <mesh position={[0.06, 0.16, 0.235]}>
        <sphereGeometry args={[0.023, 10, 10]} />
        <meshStandardMaterial color={DARK} roughness={0.3} />
      </mesh>
      <mesh position={[-0.06, 0.16, 0.235]}>
        <sphereGeometry args={[0.023, 10, 10]} />
        <meshStandardMaterial color={DARK} roughness={0.3} />
      </mesh>

      <mesh
        ref={(el) => {
          earRefs.current[0] = el;
        }}
        position={[0.085, 0.27, 0.1]}
        rotation={[0, 0, -0.25]}
      >
        <coneGeometry args={[0.055, 0.13, 12]} />
        <meshStandardMaterial color={FUR} roughness={0.7} />
      </mesh>
      <mesh
        ref={(el) => {
          earRefs.current[1] = el;
        }}
        position={[-0.085, 0.27, 0.1]}
        rotation={[0, 0, 0.25]}
      >
        <coneGeometry args={[0.055, 0.13, 12]} />
        <meshStandardMaterial color={FUR} roughness={0.7} />
      </mesh>

      <group ref={tailRef} position={[0, 0.05, -0.18]}>
        <mesh position={[0, -0.03, -0.02]}>
          <sphereGeometry args={[0.085, 14, 12]} />
          <meshStandardMaterial color={FUR} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.05, -0.09]}>
          <sphereGeometry args={[0.065, 14, 12]} />
          <meshStandardMaterial color={FUR} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.13, -0.13]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color={CREAM} roughness={0.75} />
        </mesh>
      </group>

      {LEGS.map((leg, i) => (
        <group
          key={i}
          position={[leg.x, -0.1, leg.z]}
          ref={(el) => {
            legRefs.current[i] = el;
          }}
        >
          <mesh position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.12, 10]} />
            <meshStandardMaterial color={FUR_DARK} roughness={0.75} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
