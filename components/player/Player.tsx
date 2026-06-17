import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils, Matrix4, Quaternion, Vector3 } from "three";
import { resolveMovement } from "@/lib/input/movementInput";
import { moveAlongSurface, turn } from "@/lib/math/sphericalMovement";
import { worldConfig } from "@/config/worldConfig";
import { useGameStore } from "@/store/useGameStore";
import { useSettingsStore } from "@/store/useSettingsStore";
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
 * 플레이어 아바타 + 구면 이동 로직.
 * - 입력은 resolveMovement()(키보드+조이스틱 합산)에서 읽는다.
 * - 위치/방향은 transform(공유 ref)에 직접 쓰고, 그 값으로 group 을 배치한다.
 * - useFrame 안에서 React state 를 만들지 않는다(store 는 getState 로 비반응 읽기).
 */
export default function Player({ transform }: PlayerProps) {
  const groupRef = useRef<Group>(null);
  const bob = useRef(0); // 이동 중 미세한 위아래 흔들림
  const bobPhase = useRef(0);

  useFrame((_, rawDelta) => {
    // 탭 복귀 직후 큰 delta 로 순간이동하는 것을 방지.
    const delta = Math.min(rawDelta, 0.05);

    const game = useGameStore.getState();
    // 시작 전이거나 메시지 패널이 열려 있으면 이동 비활성화.
    const locked = !game.started || game.openedMessageId !== null;
    const { forward: rawForward, turn: rawTurn } = resolveMovement();
    const moveDir = locked ? 0 : rawForward;
    const turnDir = locked ? 0 : rawTurn;

    const { reduceMotion, isTouch } = useSettingsStore.getState();
    const speed = isTouch ? worldConfig.moveSpeed * 0.9 : worldConfig.moveSpeed;

    // 좌우 회전 (D = 우회전). 부호가 반대로 느껴지면 여기 부호만 뒤집으면 된다.
    turn(transform.forward, transform.up, -turnDir * worldConfig.turnSpeed * delta);

    // 전/후진 — 표면 위 대원 이동
    if (moveDir !== 0) {
      const arc = (moveDir * speed * delta) / worldConfig.surfaceRadius;
      moveAlongSurface(transform.position, transform.forward, worldConfig.surfaceRadius, arc);
    }

    // 법선(up) 갱신 — CameraRig 도 이 값을 읽는다.
    transform.up.copy(transform.position).normalize();

    const group = groupRef.current;
    if (!group) return;

    // 이동 중 bobbing (reduce motion 이면 생략).
    const moving = moveDir !== 0 && !reduceMotion;
    if (moving) bobPhase.current += delta * 9;
    const bobTarget = moving ? Math.sin(bobPhase.current) * 0.03 : 0;
    bob.current = MathUtils.lerp(bob.current, bobTarget, 1 - Math.exp(-10 * delta));

    // 위치: 표면 위 + bobbing 오프셋(up 방향)
    group.position.copy(transform.position).addScaledVector(transform.up, bob.current);

    // 방향: 로컬 +Y = up, +Z = forward 가 되도록 정규직교 기저로 회전 설정.
    _right.copy(transform.up).cross(transform.forward).normalize(); // up × forward
    _basis.makeBasis(_right, transform.up, transform.forward);
    _quat.setFromRotationMatrix(_basis);
    group.quaternion.copy(_quat);
  });

  return (
    <group ref={groupRef}>
      {/* 몸통 — 로컬 +Y(=표면 위)로 선 캡슐 */}
      <mesh>
        <capsuleGeometry args={[0.16, 0.26, 6, 16]} />
        <meshStandardMaterial color="#f6d68c" roughness={0.6} />
      </mesh>
      {/* 코 — 로컬 +Z(=진행 방향)를 가리키는 작은 원뿔로 방향을 보여준다. */}
      <mesh position={[0, 0.04, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.07, 0.14, 12]} />
        <meshStandardMaterial color="#e2952f" roughness={0.5} />
      </mesh>
    </group>
  );
}
