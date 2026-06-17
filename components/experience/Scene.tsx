import { useMemo } from "react";
import { Vector3 } from "three";
import { Environment, Lightformer, Sparkles } from "@react-three/drei";
import Planet from "@/components/world/Planet";
import Player from "@/components/player/Player";
import CameraRig from "@/components/player/CameraRig";
import MessageOrbGroup from "@/components/world/MessageOrbGroup";
import Decorations from "@/components/world/Decorations";
import { worldConfig } from "@/config/worldConfig";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { PlayerTransform } from "@/types/world";

// 먼 가장자리가 녹아드는 포그 색 — 하늘 그라데이션 중간톤에 맞춘다.
const FOG_COLOR = "#d4e7ea";

/**
 * 3D 월드의 최상위 구성 — 분위기 + 행성 + 플레이어 + 추적 카메라.
 * 조명은 절차적 Environment(IBL) + hemisphere + 따뜻한 key 조합.
 */
export default function Scene() {
  const isTouch = useSettingsStore((s) => s.isTouch);

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
      <fog attach="fog" args={[FOG_COLOR, 9, 26]} />

      {/* 절차적 환경광(IBL) — 외부 HDR 없이 Lightformer 로 한 번 굽는다.
          머티리얼에 부드러운 반사/그라데이션을 더해 질감을 살린다. */}
      <Environment frames={1} resolution={256} background={false}>
        <Lightformer form="circle" intensity={2.2} position={[0, 5, 2]} scale={7} color="#fff3df" />
        <Lightformer form="rect" intensity={1.0} position={[-5, 1, -3]} scale={5} color="#cfe8f7" />
        <Lightformer form="rect" intensity={0.6} position={[5, -2, 3]} scale={5} color="#e9d8b8" />
      </Environment>

      {/* 직접광 — 하늘/땅 톤 채움 + 약한 ambient + 따뜻한 key. */}
      <hemisphereLight args={["#dbeef6", "#e9d8b8", 0.6]} />
      <ambientLight intensity={0.22} />
      <directionalLight position={[6, 9, 4]} intensity={0.95} color="#fff3df" />

      {/* 떠다니는 빛 입자 — 조용한 분위기. 모바일은 개수를 줄인다. */}
      <Sparkles
        count={isTouch ? 28 : 64}
        scale={9}
        size={2.4}
        speed={0.25}
        noise={0.5}
        color="#fff1cf"
        opacity={0.55}
      />

      <Planet />
      <Decorations />
      <MessageOrbGroup transform={playerTransform} />
      <Player transform={playerTransform} />
      <CameraRig transform={playerTransform} />
    </>
  );
}
