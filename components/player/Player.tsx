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

interface PlayerProps {
  /** Scene 이 소유하고 CameraRig 와 공유하는 트랜스폼. 여기서 매 프레임 갱신한다. */
  transform: PlayerTransform;
}

/**
 * 플레이어 = 둥근 동물 친구(여우풍). 로컬 +Y = 표면 위, +Z = 정면(얼굴/진행 방향).
 * - 이동 로직은 그대로(resolveMovement → 구면 이동). useFrame 안 React state 갱신 없음.
 * - bobbing 은 캐릭터만 적용하고, 발밑 그림자(blob)는 표면에 고정되도록 매 프레임 보정.
 */
export default function Player({ transform }: PlayerProps) {
  const groupRef = useRef<Group>(null);
  const shadowRef = useRef<Mesh>(null);
  const bob = useRef(0);
  const bobPhase = useRef(0);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);

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

    // bobbing (reduce motion 이면 생략).
    const moving = moveDir !== 0 && !reduceMotion;
    if (moving) bobPhase.current += delta * 9;
    const bobTarget = moving ? Math.sin(bobPhase.current) * 0.03 : 0;
    bob.current = MathUtils.lerp(bob.current, bobTarget, 1 - Math.exp(-10 * delta));

    group.position.copy(transform.position).addScaledVector(transform.up, bob.current);

    // 방향: 로컬 +Y = up, +Z = forward.
    _right.copy(transform.up).cross(transform.forward).normalize();
    _basis.makeBasis(_right, transform.up, transform.forward);
    _quat.setFromRotationMatrix(_basis);
    group.quaternion.copy(_quat);

    // 그림자는 캐릭터 bobbing 을 상쇄해 표면에 고정.
    if (shadowRef.current) {
      shadowRef.current.position.y = -worldConfig.playerHeight - bob.current + 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 발밑 그림자 (bobbing 상쇄됨) */}
      <ShadowBlob ref={shadowRef} radius={0.3} opacity={0.9} />

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

      {/* 귀 — 위로 선 원뿔, 살짝 바깥쪽으로 */}
      <mesh position={[0.085, 0.27, 0.1]} rotation={[0, 0, -0.25]}>
        <coneGeometry args={[0.055, 0.13, 12]} />
        <meshStandardMaterial color={FUR} roughness={0.7} />
      </mesh>
      <mesh position={[-0.085, 0.27, 0.1]} rotation={[0, 0, 0.25]}>
        <coneGeometry args={[0.055, 0.13, 12]} />
        <meshStandardMaterial color={FUR} roughness={0.7} />
      </mesh>

      {/* 꼬리 — 뒤로 올라가는 구 3개(끝은 크림) */}
      <mesh position={[0, 0.02, -0.2]}>
        <sphereGeometry args={[0.085, 14, 12]} />
        <meshStandardMaterial color={FUR} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.1, -0.27]}>
        <sphereGeometry args={[0.065, 14, 12]} />
        <meshStandardMaterial color={FUR} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.18, -0.31]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color={CREAM} roughness={0.75} />
      </mesh>

      {/* 발 — 짧은 원기둥 4개 (바닥이 표면에 닿음) */}
      {(
        [
          [0.1, 0.08],
          [-0.1, 0.08],
          [0.1, -0.08],
          [-0.1, -0.08],
        ] as const
      ).map(([x, z], i) => (
        <mesh key={i} position={[x, -0.16, z]}>
          <cylinderGeometry args={[0.045, 0.045, 0.12, 10]} />
          <meshStandardMaterial color={FUR_DARK} roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
}
