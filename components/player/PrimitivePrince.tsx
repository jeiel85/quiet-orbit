import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { type Group } from "three";
import { type AvatarAnimState, damp } from "@/lib/player/avatarAnim";

// 원작 에셋 복제가 아닌, 작은 행성에 어울리는 독립적인 소년 여행자 팔레트.
const SKIN = "#f0c8a8";
const SKIN_DARK = "#db9c82";
const HAIR = "#e8b84e";
const HAIR_DARK = "#d59c35";
const COAT = "#3c7a6b";
const COAT_DARK = "#2f6256";
const PANTS = "#273f48";
const SCARF = "#e8745c";
const SHOE = "#4c3d35";
const EYE = "#35251d";
const GOLD = "#f0c96a";

const LEGS: ReadonlyArray<{ x: number; sign: 1 | -1 }> = [
  { x: 0.045, sign: 1 },
  { x: -0.045, sign: -1 },
];

const ARMS: ReadonlyArray<{ x: number; sign: 1 | -1 }> = [
  { x: 0.085, sign: -1 },
  { x: -0.085, sign: 1 },
];

/**
 * 작은 행성 위에서 읽히는 아기자기한 소년 여행자.
 * 성인형 6~7등신보다 머리가 크고 팔다리가 짧은 4등신대 실루엣으로 둔다.
 * 로컬 +Y = 표면 위, +Z = 정면. 발끝이 y≈-0.22 에 닿는다.
 */
export default function PrimitivePrince({ anim }: { anim: RefObject<AvatarAnimState> }) {
  const rigRef = useRef<Group>(null);
  const torsoRef = useRef<Group>(null);
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
      rig.rotation.z = damp(rig.rotation.z, a.reduceMotion ? 0 : -a.turn * 0.1, 8, delta);
      rig.rotation.x = damp(rig.rotation.x, a.reduceMotion ? 0 : moving ? 0.035 : 0, 8, delta);
    }

    const torso = torsoRef.current;
    if (torso) {
      torso.rotation.y = a.reduceMotion ? 0 : Math.sin(a.phase) * (moving ? 0.035 : 0);
    }

    const swing = Math.sin(a.phase) * 0.46;
    for (let i = 0; i < LEGS.length; i++) {
      const leg = legRefs.current[i];
      if (!leg) continue;
      leg.rotation.x = moving ? swing * LEGS[i].sign : damp(leg.rotation.x, 0, 12, delta);
    }

    for (let i = 0; i < ARMS.length; i++) {
      const arm = armRefs.current[i];
      if (!arm) continue;
      const target = moving ? swing * ARMS[i].sign * 0.55 : 0;
      arm.rotation.x = moving ? target : damp(arm.rotation.x, 0, 10, delta);
    }

    const head = headRef.current;
    if (head) {
      const idleLook = a.reduceMotion || moving ? 0 : Math.sin(a.elapsed * 0.75) * 0.12;
      head.rotation.y = damp(head.rotation.y, idleLook, 4, delta);
      head.rotation.z = a.reduceMotion ? 0 : Math.sin(a.elapsed * 1.05) * 0.018;
    }

    const scarf = scarfRef.current;
    if (scarf) {
      if (a.reduceMotion) {
        scarf.rotation.x = damp(scarf.rotation.x, -0.18, 6, delta);
        scarf.rotation.y = damp(scarf.rotation.y, 0, 6, delta);
      } else {
        const flutter = moving
          ? Math.sin(a.phase * 1.35) * 0.08
          : Math.sin(a.elapsed * 2.4) * 0.11;
        scarf.rotation.x = damp(scarf.rotation.x, (moving ? -0.64 : -0.18) + flutter, 7, delta);
        scarf.rotation.y = damp(scarf.rotation.y, Math.sin(a.elapsed * 2) * (moving ? 0.08 : 0.18), 6, delta);
      }
    }
  });

  return (
    <group ref={rigRef}>
      {/* 사람 실루엣의 기준은 유지하되, 어린 여행자처럼 둥글고 짧은 비율로 읽히게 한다. */}
      <group position={[0, 0, 0]}>
        {LEGS.map((leg, i) => (
          <group
            key={i}
            position={[leg.x, -0.045, 0]}
            ref={(el) => {
              legRefs.current[i] = el;
            }}
          >
            <mesh position={[0, -0.05, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.034, 0.105, 10]} />
              <meshStandardMaterial color={PANTS} roughness={0.82} />
            </mesh>
            <mesh position={[0, -0.13, 0.006]} castShadow>
              <cylinderGeometry args={[0.026, 0.029, 0.078, 10]} />
              <meshStandardMaterial color={PANTS} roughness={0.82} />
            </mesh>
            <mesh position={[0, -0.185, 0.03]} scale={[1.16, 0.72, 1.48]}>
              <sphereGeometry args={[0.035, 12, 8]} />
              <meshStandardMaterial color={SHOE} roughness={0.78} />
            </mesh>
          </group>
        ))}

        <group ref={torsoRef}>
          <mesh position={[0, 0.0, 0]} castShadow>
            <boxGeometry args={[0.145, 0.06, 0.08]} />
            <meshStandardMaterial color={COAT_DARK} roughness={0.78} />
          </mesh>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.086, 0.07, 0.2, 14]} />
            <meshStandardMaterial color={COAT} roughness={0.78} />
          </mesh>
          <mesh position={[0, 0.195, 0]} castShadow>
            <boxGeometry args={[0.165, 0.04, 0.078]} />
            <meshStandardMaterial color={COAT} roughness={0.76} />
          </mesh>

          {/* 재킷 앞판과 허리선. 뒤에서 봐도 몸통이 사람 옷처럼 보이게 얇은 레이어를 둔다. */}
          <mesh position={[-0.03, 0.09, 0.045]} rotation={[0, 0, -0.06]}>
            <boxGeometry args={[0.052, 0.16, 0.012]} />
            <meshStandardMaterial color="#448879" roughness={0.74} />
          </mesh>
          <mesh position={[0.03, 0.09, 0.045]} rotation={[0, 0, 0.06]}>
            <boxGeometry args={[0.052, 0.16, 0.012]} />
            <meshStandardMaterial color="#448879" roughness={0.74} />
          </mesh>
          <mesh position={[0, 0.018, 0.047]}>
            <boxGeometry args={[0.125, 0.014, 0.014]} />
            <meshStandardMaterial color={GOLD} roughness={0.45} />
          </mesh>
        </group>

        {ARMS.map((arm, i) => (
          <group
            key={i}
            position={[arm.x, 0.175, 0]}
            rotation={[0, 0, arm.x > 0 ? -0.24 : 0.24]}
            ref={(el) => {
              armRefs.current[i] = el;
            }}
          >
            <mesh position={[0, -0.065, 0]} castShadow>
              <cylinderGeometry args={[0.023, 0.026, 0.12, 10]} />
              <meshStandardMaterial color={COAT} roughness={0.78} />
            </mesh>
            <mesh position={[0, -0.14, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.022, 0.075, 10]} />
              <meshStandardMaterial color={COAT_DARK} roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.185, 0.003]} scale={[1.05, 1.15, 1.05]}>
              <sphereGeometry args={[0.026, 10, 8]} />
              <meshStandardMaterial color={SKIN} roughness={0.65} />
            </mesh>
          </group>
        ))}

        {/* 목과 스카프가 머리/몸통을 분리해 사람 구조를 분명하게 만든다. */}
        <mesh position={[0, 0.225, 0]}>
          <cylinderGeometry args={[0.026, 0.03, 0.05, 10]} />
          <meshStandardMaterial color={SKIN} roughness={0.62} />
        </mesh>
        <mesh position={[0, 0.235, 0]}>
          <torusGeometry args={[0.058, 0.018, 8, 18]} />
          <meshStandardMaterial color={SCARF} roughness={0.7} />
        </mesh>
        <group ref={scarfRef} position={[0, 0.225, -0.043]} rotation={[-0.18, 0, 0]}>
          <mesh position={[0, -0.058, -0.018]}>
            <boxGeometry args={[0.054, 0.125, 0.015]} />
            <meshStandardMaterial color={SCARF} roughness={0.7} />
          </mesh>
          <mesh position={[0.014, -0.13, -0.04]} rotation={[0, 0, 0.13]}>
            <boxGeometry args={[0.044, 0.08, 0.013]} />
            <meshStandardMaterial color="#d95f50" roughness={0.7} />
          </mesh>
        </group>

        <group ref={headRef} position={[0, 0.322, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.081, 20, 16]} />
            <meshStandardMaterial color={SKIN} roughness={0.58} />
          </mesh>

          {/* 귀와 코를 추가해 정면/측면에서 사람 얼굴로 읽히게 한다. */}
          <mesh position={[0.079, -0.004, 0]}>
            <sphereGeometry args={[0.017, 8, 8]} />
            <meshStandardMaterial color={SKIN_DARK} roughness={0.62} />
          </mesh>
          <mesh position={[-0.079, -0.004, 0]}>
            <sphereGeometry args={[0.017, 8, 8]} />
            <meshStandardMaterial color={SKIN_DARK} roughness={0.62} />
          </mesh>
          <mesh position={[0, -0.002, 0.078]} scale={[0.7, 0.8, 1.05]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshStandardMaterial color={SKIN_DARK} roughness={0.62} />
          </mesh>

          {/* 머리카락: 헬멧처럼 씌운 뒤, 이마/옆머리/뒤통수 덩어리로 사람 머리 형태를 만든다. */}
          <mesh position={[0, 0.04, -0.007]} scale={[1.08, 0.85, 1.06]} castShadow>
            <sphereGeometry args={[0.082, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
            <meshStandardMaterial color={HAIR} roughness={0.78} />
          </mesh>
          <mesh position={[0, 0.088, 0.025]} rotation={[0.35, 0, 0]}>
            <coneGeometry args={[0.035, 0.073, 7]} />
            <meshStandardMaterial color={HAIR} roughness={0.78} />
          </mesh>
          <mesh position={[0.043, 0.052, 0.022]} rotation={[0.25, 0, -0.55]}>
            <coneGeometry args={[0.026, 0.058, 6]} />
            <meshStandardMaterial color={HAIR_DARK} roughness={0.78} />
          </mesh>
          <mesh position={[-0.043, 0.052, 0.022]} rotation={[0.25, 0, 0.55]}>
            <coneGeometry args={[0.026, 0.058, 6]} />
            <meshStandardMaterial color={HAIR_DARK} roughness={0.78} />
          </mesh>
          <mesh position={[0, 0.004, -0.078]} scale={[1, 1.05, 0.55]}>
            <sphereGeometry args={[0.05, 10, 8]} />
            <meshStandardMaterial color={HAIR_DARK} roughness={0.78} />
          </mesh>

          <mesh position={[0.028, -0.006, 0.074]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshStandardMaterial color={EYE} roughness={0.3} />
          </mesh>
          <mesh position={[-0.028, -0.006, 0.074]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshStandardMaterial color={EYE} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.035, 0.075]} scale={[1.25, 0.35, 0.35]}>
            <sphereGeometry args={[0.012, 8, 6]} />
            <meshStandardMaterial color="#c97870" roughness={0.55} />
          </mesh>
        </group>

        <mesh position={[0.035, 0.125, 0.055]} rotation={[0, 0, 0.2]}>
          <icosahedronGeometry args={[0.016, 0]} />
          <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.12} roughness={0.45} />
        </mesh>
      </group>
    </group>
  );
}
