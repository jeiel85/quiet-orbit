import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { type Group } from "three";
import { type AvatarAnimState, damp } from "@/lib/player/avatarAnim";

// Kenney Animated Characters 3의 CC0 저폴리 장난감 인상을 참고하되, 직접 복제하지 않은 Quiet Orbit 소년 여행자.
const SKIN = "#f2c4a1";
const SKIN_SHADE = "#d9967a";
const HAIR = "#dba23d";
const HAIR_SHADE = "#b97828";
const TUNIC = "#3f8f80";
const TUNIC_SHADE = "#2d6f67";
const SHORTS = "#31495a";
const SCARF = "#e96f5b";
const SCARF_DARK = "#c94f45";
const SHOE = "#4a3b34";
const EYE = "#33251e";
const GOLD = "#f3c95f";
const SATCHEL = "#9b6a3d";
const SATCHEL_DARK = "#6f492c";

const LEGS: ReadonlyArray<{ x: number; sign: 1 | -1 }> = [
  { x: 0.045, sign: 1 },
  { x: -0.045, sign: -1 },
];

const ARMS: ReadonlyArray<{ x: number; sign: 1 | -1 }> = [
  { x: 0.1, sign: -1 },
  { x: -0.1, sign: 1 },
];

/**
 * 작고 둥근 저폴리 소년 여행자.
 * 발끝은 로컬 y≈-0.205에 닿고, 큰 머리와 짧은 팔다리로 성인형이 아닌 피규어 비율을 유지한다.
 */
export default function PrimitivePrince({ anim }: { anim: RefObject<AvatarAnimState> }) {
  const rigRef = useRef<Group>(null);
  const torsoRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const scarfRef = useRef<Group>(null);
  const pouchRef = useRef<Group>(null);
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
      const idleLook = a.reduceMotion || moving ? 0 : Math.sin(a.elapsed * 0.75) * 0.11;
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
          : Math.sin(a.elapsed * 2.4) * 0.1;
        scarf.rotation.x = damp(scarf.rotation.x, (moving ? -0.62 : -0.18) + flutter, 7, delta);
        scarf.rotation.y = damp(scarf.rotation.y, Math.sin(a.elapsed * 2) * (moving ? 0.08 : 0.16), 6, delta);
      }
    }

    const pouch = pouchRef.current;
    if (pouch) {
      const bounce = a.reduceMotion ? 0 : Math.sin(a.phase + 0.6) * (moving ? 0.04 : 0.012);
      pouch.rotation.z = damp(pouch.rotation.z, bounce, 7, delta);
    }
  });

  return (
    <group ref={rigRef}>
      <group position={[0, 0, 0]}>
        {LEGS.map((leg, i) => (
          <group
            key={i}
            position={[leg.x, -0.035, 0]}
            ref={(el) => {
              legRefs.current[i] = el;
            }}
          >
            <mesh position={[0, -0.042, 0]} castShadow>
              <cylinderGeometry args={[0.035, 0.038, 0.09, 8]} />
              <meshStandardMaterial color={SHORTS} roughness={0.82} flatShading />
            </mesh>
            <mesh position={[0, -0.108, 0.002]} castShadow>
              <cylinderGeometry args={[0.026, 0.029, 0.065, 8]} />
              <meshStandardMaterial color={SKIN} roughness={0.7} flatShading />
            </mesh>
            <mesh position={[0, -0.172, 0.028]} scale={[1.2, 0.72, 1.55]} castShadow>
              <sphereGeometry args={[0.038, 8, 6]} />
              <meshStandardMaterial color={SHOE} roughness={0.78} flatShading />
            </mesh>
          </group>
        ))}

        <group ref={torsoRef}>
          <mesh position={[0, 0.005, 0]} castShadow>
            <boxGeometry args={[0.15, 0.07, 0.088]} />
            <meshStandardMaterial color={SHORTS} roughness={0.82} flatShading />
          </mesh>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.093, 0.078, 0.185, 10]} />
            <meshStandardMaterial color={TUNIC} roughness={0.78} flatShading />
          </mesh>
          <mesh position={[0, 0.19, 0]} castShadow>
            <boxGeometry args={[0.175, 0.038, 0.082]} />
            <meshStandardMaterial color={TUNIC} roughness={0.76} flatShading />
          </mesh>
          <mesh position={[0, 0.104, 0.051]}>
            <boxGeometry args={[0.046, 0.165, 0.012]} />
            <meshStandardMaterial color={TUNIC_SHADE} roughness={0.78} flatShading />
          </mesh>
          <mesh position={[0, 0.02, 0.052]}>
            <boxGeometry args={[0.13, 0.014, 0.014]} />
            <meshStandardMaterial color={GOLD} roughness={0.45} flatShading />
          </mesh>
          <mesh position={[0, 0.08, -0.056]} castShadow>
            <boxGeometry args={[0.122, 0.12, 0.036]} />
            <meshStandardMaterial color={SATCHEL_DARK} roughness={0.82} flatShading />
          </mesh>
        </group>

        {ARMS.map((arm, i) => (
          <group
            key={i}
            position={[arm.x, 0.17, 0]}
            rotation={[0, 0, arm.x > 0 ? -0.28 : 0.28]}
            ref={(el) => {
              armRefs.current[i] = el;
            }}
          >
            <mesh position={[0, -0.065, 0]} castShadow>
              <cylinderGeometry args={[0.026, 0.029, 0.12, 8]} />
              <meshStandardMaterial color={TUNIC} roughness={0.78} flatShading />
            </mesh>
            <mesh position={[0, -0.15, 0.006]} scale={[1.1, 1.0, 1.08]} castShadow>
              <sphereGeometry args={[0.033, 8, 6]} />
              <meshStandardMaterial color={SKIN} roughness={0.66} flatShading />
            </mesh>
          </group>
        ))}

        <mesh position={[0, 0.224, 0]} castShadow>
          <cylinderGeometry args={[0.029, 0.032, 0.045, 8]} />
          <meshStandardMaterial color={SKIN} roughness={0.62} flatShading />
        </mesh>
        <mesh position={[0, 0.232, 0]}>
          <torusGeometry args={[0.061, 0.018, 8, 18]} />
          <meshStandardMaterial color={SCARF} roughness={0.7} flatShading />
        </mesh>
        <group ref={scarfRef} position={[0, 0.222, -0.046]} rotation={[-0.18, 0, 0]}>
          <mesh position={[0, -0.055, -0.017]} castShadow>
            <boxGeometry args={[0.058, 0.118, 0.016]} />
            <meshStandardMaterial color={SCARF} roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0.014, -0.124, -0.039]} rotation={[0, 0, 0.13]} castShadow>
            <boxGeometry args={[0.046, 0.074, 0.014]} />
            <meshStandardMaterial color={SCARF_DARK} roughness={0.7} flatShading />
          </mesh>
        </group>

        <group ref={pouchRef} position={[-0.115, 0.075, 0.03]} rotation={[0.05, -0.1, -0.08]}>
          <mesh castShadow>
            <boxGeometry args={[0.052, 0.07, 0.026]} />
            <meshStandardMaterial color={SATCHEL} roughness={0.82} flatShading />
          </mesh>
          <mesh position={[0, 0.024, 0.015]}>
            <boxGeometry args={[0.045, 0.014, 0.01]} />
            <meshStandardMaterial color={SATCHEL_DARK} roughness={0.82} flatShading />
          </mesh>
        </group>
        <mesh position={[-0.055, 0.145, 0.054]} rotation={[0, 0, -0.52]}>
          <boxGeometry args={[0.018, 0.172, 0.012]} />
          <meshStandardMaterial color={SATCHEL_DARK} roughness={0.82} flatShading />
        </mesh>

        <group ref={headRef} position={[0, 0.323, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.095, 12, 10]} />
            <meshStandardMaterial color={SKIN} roughness={0.58} flatShading />
          </mesh>
          <mesh position={[0.088, -0.004, -0.004]} scale={[0.72, 0.92, 0.54]} castShadow>
            <sphereGeometry args={[0.024, 8, 6]} />
            <meshStandardMaterial color={SKIN_SHADE} roughness={0.62} flatShading />
          </mesh>
          <mesh position={[-0.088, -0.004, -0.004]} scale={[0.72, 0.92, 0.54]} castShadow>
            <sphereGeometry args={[0.024, 8, 6]} />
            <meshStandardMaterial color={SKIN_SHADE} roughness={0.62} flatShading />
          </mesh>

          <mesh position={[0, 0.043, -0.006]} scale={[1.04, 0.76, 1.04]} castShadow>
            <sphereGeometry args={[0.099, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
            <meshStandardMaterial color={HAIR} roughness={0.8} flatShading />
          </mesh>
          <mesh position={[0.048, 0.024, 0.056]} rotation={[0.24, -0.12, -0.6]} castShadow>
            <coneGeometry args={[0.029, 0.055, 6]} />
            <meshStandardMaterial color={HAIR_SHADE} roughness={0.8} flatShading />
          </mesh>
          <mesh position={[-0.04, 0.026, 0.058]} rotation={[0.22, 0.1, 0.54]} castShadow>
            <coneGeometry args={[0.027, 0.05, 6]} />
            <meshStandardMaterial color={HAIR} roughness={0.8} flatShading />
          </mesh>
          <mesh position={[0, 0.018, -0.085]} scale={[1, 1.05, 0.5]} castShadow>
            <sphereGeometry args={[0.054, 8, 6]} />
            <meshStandardMaterial color={HAIR_SHADE} roughness={0.8} flatShading />
          </mesh>

          <mesh position={[0.031, -0.01, 0.088]}>
            <sphereGeometry args={[0.009, 8, 6]} />
            <meshStandardMaterial color={EYE} roughness={0.35} />
          </mesh>
          <mesh position={[-0.031, -0.01, 0.088]}>
            <sphereGeometry args={[0.009, 8, 6]} />
            <meshStandardMaterial color={EYE} roughness={0.35} />
          </mesh>
          <mesh position={[0, -0.024, 0.091]} scale={[0.58, 0.54, 0.72]}>
            <sphereGeometry args={[0.011, 8, 6]} />
            <meshStandardMaterial color={SKIN_SHADE} roughness={0.62} flatShading />
          </mesh>
          <mesh position={[0, -0.048, 0.088]} scale={[1.2, 0.34, 0.34]}>
            <sphereGeometry args={[0.011, 8, 6]} />
            <meshStandardMaterial color="#b86b65" roughness={0.55} />
          </mesh>
        </group>

        <mesh position={[0.038, 0.127, 0.058]} rotation={[0, 0, 0.2]}>
          <icosahedronGeometry args={[0.016, 0]} />
          <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.12} roughness={0.45} />
        </mesh>
      </group>
    </group>
  );
}
