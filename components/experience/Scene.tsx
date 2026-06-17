import { useMemo } from "react";
import { Vector3 } from "three";
import Planet from "@/components/world/Planet";
import Player from "@/components/player/Player";
import CameraRig from "@/components/player/CameraRig";
import MessageOrbGroup from "@/components/world/MessageOrbGroup";
import Decorations from "@/components/world/Decorations";
import { worldConfig } from "@/config/worldConfig";
import type { PlayerTransform } from "@/types/world";

/**
 * 3D 월드의 최상위 구성 — 조명 + 행성 + 플레이어 + 추적 카메라.
 * Player(쓰기)와 CameraRig(읽기)가 공유하는 트랜스폼을 여기서 생성해 props 로 내린다.
 * 이 객체는 매 프레임 ref 처럼 직접 변경되며 React state 를 거치지 않는다.
 */
export default function Scene() {
  const playerTransform = useMemo<PlayerTransform>(
    () => ({
      // 북극(0, surfaceRadius, 0)에서 시작, +Z 를 바라봄(북극 접평면 위의 단위 벡터).
      position: new Vector3(0, worldConfig.surfaceRadius, 0),
      forward: new Vector3(0, 0, 1),
      up: new Vector3(0, 1, 0),
    }),
    [],
  );

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} />

      <Planet />
      <Decorations />
      <MessageOrbGroup transform={playerTransform} />
      <Player transform={playerTransform} />
      <CameraRig transform={playerTransform} />
    </>
  );
}
