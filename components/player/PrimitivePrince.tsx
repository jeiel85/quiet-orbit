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
 * 작은 행성 위에서 읽히는 사람형 플레이어.
 * 정확한 원작 캐릭터 모델이 아니라, 사람 비율을 가진 low-poly 소년 여행자로 재해석한다.
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
      {/* 사람 실루엣의 기준: 신발-다리-골반-몸통-목-머리 순서가 명확히 읽히게 한다. */}
      <group position={[0, 0, 0]}>
        {LEGS.map((leg, i) => (
          <group
            key={i}
            position={[leg.x, -0.02, 0]}
            ref={(el) => {
              legRefs.current[i] = el;
            }}
          >
            <mesh position={[0, -0.06, 0]} castShadow>
              <cylinderGeometry args={[0.027, 0.031, 0.13, 10]} />
              <meshStandardMaterial color={PANTS} roughness={0.82} />
            </mesh>
            <mesh position={[0, -0.155, 0.006]} castShadow>
              <cylinderGeometry args={[0.023, 0.027, 0.1, 10]} />
              <meshStandardMaterial color={PANTS} roughness={0.82} />
            </mesh>
            <mesh position={[0, -0.215, 0.03]} scale={[1.1, 0.72, 1.45]}>
              <sphereGeometry args={[0.033, 12, 8]} />
              <meshStandardMaterial color={SHOE} roughness={0.78} />
            </mesh>
          </group>
        ))}

        <group ref={torsoRef}>
          <mesh position={[0, -0.005, 0]} castShadow>
            <boxGeometry args={[0.14, 0.055, 0.075]} />
            <meshStandardMaterial color={COAT_DARK} roughness={0.78} />
          </mesh>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.074, 0.063, 0.23, 14]} />
            <meshStandardMaterial color={COAT} roughness={0.78} />
          </mesh>
          <mesh position={[0, 0.225, 0]} castShadow>
            <boxGeometry args={[0.19, 0.045, 0.075]} />
            <meshStandardMaterial color={COAT} roughness={0.76} />
          </mesh>

          {/* 재킷 앞판과 허리선. 뒤에서 봐도 몸통이 사람 옷처럼 보이게 얇은 레이어를 둔다. */}
          <mesh position={[-0.028, 0.105, 0.043]} rotation={[0, 0, -0.06]}>
            <boxGeometry args={[0.047, 0.19, 0.012]} />
            <meshStandardMaterial color="#448879" roughness={0.74} />
          </mesh>
          <mesh position={[0.028, 0.105, 0.043]} rotation={[0, 0, 0.06]}>
            <boxGeometry args={[0.047, 0.19, 0.012]} />
            <meshStandardMaterial color="#448879" roughness={0.74} />
          </mesh>
          <mesh position={[0, 0.01, 0.045]}>
            <boxGeometry args={[0.12, 0.014, 0.014]} />
            <meshStandardMaterial color={GOLD} roughness={0.45} />
          </mesh>
        </group>

        {ARMS.map((arm, i) => (
          <group
            key={i}
            position={[arm.x, 0.205, 0]}
            rotation={[0, 0, arm.x > 0 ? -0.18 : 0.18]}
            ref={(el) => {
              armRefs.current[i] = el;
            }}
          >
            <mesh position={[0, -0.075, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.023, 0.15, 10]} />
              <meshStandardMaterial color={COAT} roughness={0.78} />
            </mesh>
            <mesh position={[0, -0.165, 0]} castShadow>
              <cylinderGeometry args={[0.018, 0.019, 0.09, 10]} />
              <meshStandardMaterial color={COAT_DARK} roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.22, 0.003]} scale={[0.9, 1.15, 0.9]}>
              <sphereGeometry args={[0.023, 10, 8]} />
              <meshStandardMaterial color={SKIN} roughness={0.65} />
            </mesh>
          </group>
        ))}

        {/* 목과 스카프가 머리/몸통을 분리해 사람 구조를 분명하게 만든다. */}
        <mesh position={[0, 0.255, 0]}>
          <cylinderGeometry args={[0.024, 0.027, 0.055, 10]} />
          <meshStandardMaterial color={SKIN} roughness={0.62} />
        </mesh>
        <mesh position={[0, 0.265, 0]}>
          <torusGeometry args={[0.052, 0.016, 8, 18]} />
          <meshStandardMaterial color={SCARF} roughness={0.7} />
        </mesh>
        <group ref={scarfRef} position={[0, 0.25, -0.04]} rotation={[-0.18, 0, 0]}>
          <mesh position={[0, -0.065, -0.018]}>
            <boxGeometry args={[0.05, 0.14, 0.015]} />
            <meshStandardMaterial color={SCARF} roughness={0.7} />
          </mesh>
          <mesh position={[0.014, -0.15, -0.04]} rotation={[0, 0, 0.13]}>
            <boxGeometry args={[0.04, 0.095, 0.013]} />
            <meshStandardMaterial color="#d95f50" roughness={0.7} />
          </mesh>
        </group>

        <group ref={headRef} position={[0, 0.36, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.064, 20, 16]} />
            <meshStandardMaterial color={SKIN} roughness={0.58} />
          </mesh>

          {/* 귀와 코를 추가해 정면/측면에서 사람 얼굴로 읽히게 한다. */}
          <mesh position={[0.064, -0.004, 0]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshStandardMaterial color={SKIN_DARK} roughness={0.62} />
          </mesh>
          <mesh position={[-0.064, -0.004, 0]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshStandardMaterial color={SKIN_DARK} roughness={0.62} />
          </mesh>
          <mesh position={[0, -0.002, 0.061]} scale={[0.65, 0.8, 1.1]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshStandardMaterial color={SKIN_DARK} roughness={0.62} />
          </mesh>

          {/* 머리카락: 헬멧처럼 씌운 뒤, 이마/옆머리/뒤통수 덩어리로 사람 머리 형태를 만든다. */}
          <mesh position={[0, 0.032, -0.006]} scale={[1.08, 0.85, 1.06]} castShadow>
            <sphereGeometry args={[0.065, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
            <meshStandardMaterial color={HAIR} roughness={0.78} />
          </mesh>
          <mesh position={[0, 0.068, 0.02]} rotation={[0.35, 0, 0]}>
            <coneGeometry args={[0.029, 0.06, 7]} />
            <meshStandardMaterial color={HAIR} roughness={0.78} />
          </mesh>
          <mesh position={[0.034, 0.04, 0.018]} rotation={[0.25, 0, -0.55]}>
            <coneGeometry args={[0.021, 0.048, 6]} />
            <meshStandardMaterial color={HAIR_DARK} roughness={0.78} />
          </mesh>
          <mesh position={[-0.034, 0.04, 0.018]} rotation={[0.25, 0, 0.55]}>
            <coneGeometry args={[0.021, 0.048, 6]} />
            <meshStandardMaterial color={HAIR_DARK} roughness={0.78} />
          </mesh>
          <mesh position={[0, 0.006, -0.062]} scale={[1, 1.05, 0.55]}>
            <sphereGeometry args={[0.04, 10, 8]} />
            <meshStandardMaterial color={HAIR_DARK} roughness={0.78} />
          </mesh>

          <mesh position={[0.022, -0.004, 0.058]}>
            <sphereGeometry args={[0.007, 8, 8]} />
            <meshStandardMaterial color={EYE} roughness={0.3} />
          </mesh>
          <mesh position={[-0.022, -0.004, 0.058]}>
            <sphereGeometry args={[0.007, 8, 8]} />
            <meshStandardMaterial color={EYE} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.028, 0.059]} scale={[1.2, 0.35, 0.35]}>
            <sphereGeometry args={[0.01, 8, 6]} />
            <meshStandardMaterial color="#c97870" roughness={0.55} />
          </mesh>
        </group>

        <mesh position={[0.035, 0.15, 0.052]} rotation={[0, 0, 0.2]}>
          <icosahedronGeometry args={[0.016, 0]} />
          <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.12} roughness={0.45} />
        </mesh>
      </group>
    </group>
  );
}
