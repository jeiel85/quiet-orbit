import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { MathUtils, type Mesh, type MeshStandardMaterial, Vector3 } from "three";
import { worldConfig } from "@/config/worldConfig";
import { useGameStore } from "@/store/useGameStore";
import { useMessageStore } from "@/store/useMessageStore";
import type { Message, MessageTone } from "@/types/message";

// 톤별 Orb 색상.
const TONE_COLOR: Record<MessageTone, string> = {
  warm: "#f7b15c",
  quiet: "#8fd0e0",
  hope: "#ffd98a",
  memory: "#c5b6f0",
};
const DEFAULT_COLOR = "#f7c76b";

interface MessageOrbProps {
  message: Message;
  /** 행성 표면 위 고정 월드 위치. */
  worldPosition: Vector3;
  /** 표면 법선(= worldPosition 정규화) — 위아래 floating 방향. */
  up: Vector3;
}

const _pos = new Vector3();

/**
 * 빛나는 메시지 Orb.
 * - read/unread 와 active(근접) 상태에 따라 크기·발광을 다르게 한다(요구사항 12).
 * - 시각 상태는 useFrame 안에서 ref/getState 로 갱신 — 프레임마다 React state 갱신 없음.
 * - read 여부만 reactive 구독(드물게 1회 변함)해 기본 표현을 결정.
 */
export default function MessageOrb({ message, worldPosition, up }: MessageOrbProps) {
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<MeshStandardMaterial>(null);
  const isRead = useMessageStore((s) => s.readMessageIds.includes(message.id));
  const color = message.tone ? TONE_COLOR[message.tone] : DEFAULT_COLOR;

  // id 기반 결정적 위상차 — 모든 Orb 가 동시에 출렁이지 않게.
  const phase = useMemo(() => (message.id.charCodeAt(0) % 7) * 0.9, [message.id]);
  const elapsed = useRef(0);
  const scaleRef = useRef(isRead ? 0.7 : 1);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    elapsed.current += delta;

    const game = useGameStore.getState();
    const active = game.activeMessageId === message.id && game.openedMessageId === null;

    // 위아래 floating
    const bob = Math.sin(elapsed.current * 1.4 + phase) * 0.05;
    _pos.copy(worldPosition).addScaledVector(up, bob);
    mesh.position.copy(_pos);
    mesh.rotation.y += delta * 0.6;

    // 크기: read 면 작게, active 면 살짝 커짐
    const base = isRead ? 0.7 : 1;
    const targetScale = active ? base * 1.3 : base;
    scaleRef.current = MathUtils.lerp(scaleRef.current, targetScale, 1 - Math.exp(-8 * delta));
    mesh.scale.setScalar(scaleRef.current);

    // 발광 강도
    if (matRef.current) {
      const targetE = isRead ? 0.3 : active ? 1.9 : 1.0;
      matRef.current.emissiveIntensity = MathUtils.lerp(
        matRef.current.emissiveIntensity,
        targetE,
        1 - Math.exp(-8 * delta),
      );
    }
  });

  const handleOpen = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const game = useGameStore.getState();
    // 가까이(active) 있을 때만 열린다 — 멀리서 클릭으로 열리지 않게 해 "걸어가 발견" 감각 유지.
    if (game.activeMessageId === message.id && game.openedMessageId === null) {
      game.openMessage(message.id);
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={worldPosition}
      onClick={handleOpen}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <icosahedronGeometry args={[worldConfig.orb.radius, 0]} />
      <meshStandardMaterial
        ref={matRef}
        color={color}
        emissive={color}
        emissiveIntensity={isRead ? 0.3 : 1}
        roughness={0.35}
        toneMapped={false}
      />
    </mesh>
  );
}
