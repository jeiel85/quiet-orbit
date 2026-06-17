import { useMemo } from "react";
import { Vector3 } from "three";
import Planet from "@/components/world/Planet";
import Player from "@/components/player/Player";
import CameraRig from "@/components/player/CameraRig";
import MessageOrbGroup from "@/components/world/MessageOrbGroup";
import Decorations from "@/components/world/Decorations";
import { worldConfig } from "@/config/worldConfig";
import { theme } from "@/config/theme";
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
      {/* 먼 가장자리를 하늘색으로 살짝 흐려 깊이감 (가까운 플레이어엔 영향 없음). */}
      <fog attach="fog" args={[theme.sky, 9, 24]} />

      {/* 하늘(위)·따뜻한 땅(아래) 톤의 부드러운 채움광 + 약한 ambient + 따뜻한 key. */}
      <hemisphereLight args={["#dbeef6", "#e9d8b8", 0.85]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[6, 9, 4]} intensity={1.0} color="#fff3df" />

      <Planet />
      <Decorations />
      <MessageOrbGroup transform={playerTransform} />
      <Player transform={playerTransform} />
      <CameraRig transform={playerTransform} />
    </>
  );
}
