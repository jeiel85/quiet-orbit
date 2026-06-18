import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Matrix4, type Mesh, Quaternion, Vector3 } from "three";
import { resolveMovement } from "@/lib/input/movementInput";
import { moveAlongSurface, turn } from "@/lib/math/sphericalMovement";
import { createAvatarAnim, damp } from "@/lib/player/avatarAnim";
import { worldConfig } from "@/config/worldConfig";
import { useGameStore } from "@/store/useGameStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import ShadowBlob from "@/components/world/ShadowBlob";
import PlayerAvatar from "./PlayerAvatar";
import type { PlayerTransform } from "@/types/world";

// 프레임마다 재사용하는 임시값 (할당 없음).
const _right = new Vector3();
const _basis = new Matrix4();
const _quat = new Quaternion();

interface PlayerProps {
  /** Scene 이 소유하고 CameraRig 와 공유하는 트랜스폼. 여기서 매 프레임 갱신한다. */
  transform: PlayerTransform;
}

/**
 * 플레이어 컨트롤러 — 구면 이동 + 위치/방향/바운스만 담당한다.
 * 아바타(GLB/primitive)는 PlayerAvatar 가 그리고, 애니메이션 입력은 공유 anim ref 로 전달한다.
 * useFrame 안 React state 갱신 없음(store 는 getState 로 비반응 읽기).
 */
export default function Player({ transform }: PlayerProps) {
  // 가짜 그림자는 모바일에서만(데스크톱은 실시간 그림자).
  const isTouch = useSettingsStore((s) => s.isTouch);
  const groupRef = useRef<Group>(null);
  const shadowRef = useRef<Mesh>(null);
  const anim = useRef(createAvatarAnim());
  const phase = useRef(0);
  const elapsed = useRef(0);
  const bob = useRef(0);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    elapsed.current += delta;

    const game = useGameStore.getState();
    const locked = !game.started || game.openedMessageId !== null;
    const { forward: rawForward, turn: rawTurn } = resolveMovement();
    const moveDir = locked ? 0 : rawForward;
    const turnDir = locked ? 0 : rawTurn;

    const { reduceMotion, isTouch: touch } = useSettingsStore.getState();
    const speed = touch ? worldConfig.moveSpeed * 0.9 : worldConfig.moveSpeed;

    // 회전 (D = 우회전). 부호가 반대로 느껴지면 여기 부호만 뒤집으면 된다.
    turn(transform.forward, transform.up, -turnDir * worldConfig.turnSpeed * delta);

    if (moveDir !== 0) {
      const arc = (moveDir * speed * delta) / worldConfig.surfaceRadius;
      moveAlongSurface(transform.position, transform.forward, worldConfig.surfaceRadius, arc);
    }

    transform.up.copy(transform.position).normalize();

    const group = groupRef.current;
    if (!group) return;

    // 걸음 바운스 (reduce motion 이면 생략).
    const bounce = moveDir !== 0 && !reduceMotion;
    if (moveDir !== 0) phase.current += delta * 8;
    const bobTarget = bounce ? Math.abs(Math.sin(phase.current)) * 0.045 : 0;
    bob.current = damp(bob.current, bobTarget, 12, delta);
    group.position.copy(transform.position).addScaledVector(transform.up, bob.current);

    // 방향: 로컬 +Y = up, +Z = forward.
    _right.copy(transform.up).cross(transform.forward).normalize();
    _basis.makeBasis(_right, transform.up, transform.forward);
    _quat.setFromRotationMatrix(_basis);
    group.quaternion.copy(_quat);

    // 아바타 애니메이션 입력 갱신(공유 ref).
    const a = anim.current;
    a.moving = moveDir !== 0;
    a.turn = turnDir;
    a.phase = phase.current;
    a.elapsed = elapsed.current;
    a.reduceMotion = reduceMotion;

    // 그림자는 바운스를 상쇄해 표면에 고정.
    if (shadowRef.current) {
      shadowRef.current.position.y = -worldConfig.playerHeight - bob.current + 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {isTouch && <ShadowBlob ref={shadowRef} radius={0.3} opacity={0.9} />}
      <PlayerAvatar anim={anim} />
    </group>
  );
}
