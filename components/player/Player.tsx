import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils, Matrix4, type Mesh, Quaternion, Vector3 } from "three";
import { resolveMovement } from "@/lib/input/movementInput";
import { moveAlongSurface, turn } from "@/lib/math/sphericalMovement";
import { worldConfig } from "@/config/worldConfig";
import { useGameStore } from "@/store/useGameStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import ShadowBlob from "@/components/world/ShadowBlob";
import type { PlayerTransform } from "@/types/world";

// 프레임마다 재사용하는 임시값 (할당 없음).
const _right = new Vector3();
const _basis = new Matrix4();
const _quat = new Quaternion();

// 둥근 캐릭터 색.
const FUR = "#e8965a";
const FUR_DARK = "#cf7a3f";
const CREAM = "#f6e8d6";
const DARK = "#39291f";

// 다리 배치 (x: +오른쪽, z: +앞). 대각선 보행 위상(같은 부호끼리 함께 스윙).
const LEGS: ReadonlyArray<{ x: number; z: number; sign: 1 | -1 }> = [
  { x: 0.1, z: 0.08, sign: 1 }, // 앞-오른
  { x: -0.1, z: 0.08, sign: -1 }, // 앞-왼
  { x: 0.1, z: -0.08, sign: -1 }, // 뒤-오른
  { x: -0.1, z: -0.08, sign: 1 }, // 뒤-왼
];

const damp = (current: number, target: number, lambda: number, dt: number) =>
  MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));

interface PlayerProps {
  /** Scene 이 소유하고 CameraRig 와 공유하는 트랜스폼. 여기서 매 프레임 갱신한다. */
  transform: PlayerTransform;
}

/**
 * 플레이어 = 둥근 동물 친구(여우풍). 로컬 +Y = 표면 위, +Z = 정면(얼굴/진행 방향).
 * - 이동 로직은 그대로(resolveMovement → 구면 이동). useFrame 안 React state 갱신 없음.
 * - 걷기 모션은 primitive 를 절차적으로 애니메이션: 다리 스윙 + 바운스 + 꼬리 + 회전 기울임.
 * - reduce motion 이면 모든 모션 정지.
 */
export default function Player({ transform }: PlayerProps) {
  // 가짜 그림자는 모바일에서만(데스크톱은 실시간 그림자). 렌더 시점 분기용 reactive 구독.
  const isTouch = useSettingsStore((s) => s.isTouch);
  const groupRef = useRef<Group>(null); // 월드 위치/방향 + 바운스
  const rigRef = useRef<Group>(null); // 회전 기울임(roll/pitch)
  const tailRef = useRef<Group>(null); // 꼬리 스윙
  const shadowRef = useRef<Mesh>(null);
  const legRefs = useRef<Array<Group | null>>([null, null, null, null]);
  const earRefs = useRef<Array<Mesh | null>>([null, null]);

  const phase = useRef(0); // 걸음 주기
  const elapsed = useRef(0); // idle 시간(항상 증가)
  const bob = useRef(0);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    elapsed.current += delta;

    const game = useGameStore.getState();
    const locked = !game.started || game.openedMessageId !== null;
    const { forward: rawForward, turn: rawTurn } = resolveMovement();
    const moveDir = locked ? 0 : rawForward;
    const turnDir = locked ? 0 : rawTurn;

    const { reduceMotion, isTouch } = useSettingsStore.getState();
    const speed = isTouch ? worldConfig.moveSpeed * 0.9 : worldConfig.moveSpeed;

    // 회전 (D = 우회전). 부호가 반대로 느껴지면 여기 부호만 뒤집으면 된다.
    turn(transform.forward, transform.up, -turnDir * worldConfig.turnSpeed * delta);

    if (moveDir !== 0) {
      const arc = (moveDir * speed * delta) / worldConfig.surfaceRadius;
      moveAlongSurface(transform.position, transform.forward, worldConfig.surfaceRadius, arc);
    }

    transform.up.copy(transform.position).normalize();

    const group = groupRef.current;
    if (!group) return;

    const moving = moveDir !== 0 && !reduceMotion;
    if (moving) phase.current += delta * 8;

    // 위치 + 걸음 바운스(걸음마다 한 번씩 위로).
    const bobTarget = moving ? Math.abs(Math.sin(phase.current)) * 0.045 : 0;
    bob.current = damp(bob.current, bobTarget, 12, delta);
    group.position.copy(transform.position).addScaledVector(transform.up, bob.current);

    // 방향: 로컬 +Y = up, +Z = forward.
    _right.copy(transform.up).cross(transform.forward).normalize();
    _basis.makeBasis(_right, transform.up, transform.forward);
    _quat.setFromRotationMatrix(_basis);
    group.quaternion.copy(_quat);

    // 회전 시 몸을 기울이고(roll), 이동 중 살짝 앞으로 숙인다(pitch).
    const rig = rigRef.current;
    if (rig) {
      const rollTarget = reduceMotion ? 0 : -turnDir * 0.18;
      const pitchTarget = reduceMotion ? 0 : moving ? 0.06 : 0;
      rig.rotation.z = damp(rig.rotation.z, rollTarget, 8, delta);
      rig.rotation.x = damp(rig.rotation.x, pitchTarget, 8, delta);
    }

    // 다리 스윙(대각선 보행). 이동 중엔 직접, 정지 중엔 0 으로 수렴.
    const swing = Math.sin(phase.current) * 0.5;
    for (let i = 0; i < LEGS.length; i++) {
      const leg = legRefs.current[i];
      if (!leg) continue;
      if (moving) leg.rotation.x = swing * LEGS[i].sign;
      else leg.rotation.x = damp(leg.rotation.x, 0, 14, delta);
    }

    // 귀: 걸을 때 까딱, 정지 중 은은한 idle. (base z 회전은 유지하고 x 만 건드림)
    const earFlop = reduceMotion
      ? 0
      : moving
        ? Math.sin(phase.current) * 0.12
        : Math.sin(elapsed.current * 1.3) * 0.04;
    if (earRefs.current[0]) earRefs.current[0].rotation.x = earFlop;
    if (earRefs.current[1]) earRefs.current[1].rotation.x = earFlop;

    // 꼬리: 이동 중 크게, 정지 중 은은한 idle 흔들림.
    const tail = tailRef.current;
    if (tail) {
      const sway = reduceMotion
        ? 0
        : moving
          ? Math.sin(phase.current * 0.5) * 0.25
          : Math.sin(elapsed.current * 1.5) * 0.1;
      tail.rotation.y = damp(tail.rotation.y, sway, 8, delta);
    }

    // 그림자는 바운스를 상쇄해 표면에 고정.
    if (shadowRef.current) {
      shadowRef.current.position.y = -worldConfig.playerHeight - bob.current + 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 발밑 가짜 그림자 — 모바일 전용(바운스 상쇄, rig 기울임 영향 안 받게 group 직속) */}
      {isTouch && <ShadowBlob ref={shadowRef} radius={0.3} opacity={0.9} />}

      {/* 움직이는 몸체 리그 — 기울임/스윙은 모두 이 안에서 */}
      <group ref={rigRef}>
        {/* 몸통 — 살짝 눌린 둥근 구 */}
        <mesh scale={[1, 0.9, 1.05]}>
          <sphereGeometry args={[0.2, 18, 16]} />
          <meshStandardMaterial color={FUR} roughness={0.7} />
        </mesh>
        {/* 가슴/배 — 크림색 패치 */}
        <mesh position={[0, -0.02, 0.13]}>
          <sphereGeometry args={[0.12, 16, 14]} />
          <meshStandardMaterial color={CREAM} roughness={0.75} />
        </mesh>

        {/* 머리 */}
        <mesh position={[0, 0.13, 0.12]}>
          <sphereGeometry args={[0.145, 18, 16]} />
          <meshStandardMaterial color={FUR} roughness={0.7} />
        </mesh>
        {/* 주둥이 */}
        <mesh position={[0, 0.09, 0.24]}>
          <sphereGeometry args={[0.07, 14, 12]} />
          <meshStandardMaterial color={CREAM} roughness={0.75} />
        </mesh>
        {/* 코 */}
        <mesh position={[0, 0.1, 0.305]}>
          <sphereGeometry args={[0.025, 10, 10]} />
          <meshStandardMaterial color={DARK} roughness={0.4} />
        </mesh>
        {/* 눈 */}
        <mesh position={[0.06, 0.16, 0.235]}>
          <sphereGeometry args={[0.023, 10, 10]} />
          <meshStandardMaterial color={DARK} roughness={0.3} />
        </mesh>
        <mesh position={[-0.06, 0.16, 0.235]}>
          <sphereGeometry args={[0.023, 10, 10]} />
          <meshStandardMaterial color={DARK} roughness={0.3} />
        </mesh>

        {/* 귀 */}
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

        {/* 꼬리 — base 피벗에서 흔들리는 구 3개(끝은 크림) */}
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

        {/* 발 — 엉덩이 피벗 group 에서 스윙, 안쪽에 원기둥이 매달림 */}
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
    </group>
  );
}
