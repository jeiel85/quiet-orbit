import { useMemo } from "react";
import { Environment, Lightformer, Sparkles } from "@react-three/drei";
import Planet from "@/components/world/Planet";
import Player from "@/components/player/Player";
import CameraRig from "@/components/player/CameraRig";
import MessageOrbGroup from "@/components/world/MessageOrbGroup";
import Decorations from "@/components/world/Decorations";
import TravelSpotGroup from "@/components/world/TravelSpotGroup";
import TravelTransition from "@/components/world/TravelTransition";
import GradientBackground from "./GradientBackground";
import EnableShadows from "./EnableShadows";
import PostFX from "./PostFX";
import { getPlanet, HOME_PLANET_ID } from "@/config/planets";
import { worldConfig } from "@/config/worldConfig";
import { sphericalForward, sphericalToWorld } from "@/lib/math/sphericalCoords";
import { useGameStore } from "@/store/useGameStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { PlayerTransform } from "@/types/world";

/**
 * 3D 월드의 최상위 구성 — 분위기 + 행성 + 플레이어 + 추적 카메라.
 * 데스크톱: 실시간 그림자 + 블룸 후처리. 모바일: 끄고 가짜 그림자로 대체(성능).
 */
export default function Scene() {
  const isTouch = useSettingsStore((s) => s.isTouch);
  const activePlanetId = useGameStore((s) => s.activePlanetId);
  const fancy = !isTouch; // 그림자/후처리는 데스크톱에서만
  const activePlanet = getPlanet(activePlanetId);

  const playerTransform = useMemo<PlayerTransform>(
    () => {
      const start = getPlanet(HOME_PLANET_ID).startPoint;
      const position = sphericalToWorld(start.theta, start.phi, worldConfig.surfaceRadius);
      return {
        position,
        forward: sphericalForward(start.theta, start.phi, start.heading),
        up: position.clone().normalize(),
      };
    },
    [],
  );

  return (
    <>
      <GradientBackground />
      <fog attach="fog" args={[activePlanet.fogColor, 9, 26]} />

      {/* 절차적 환경광(IBL) — 외부 HDR 없이 Lightformer 로 한 번 굽는다. */}
      <Environment frames={1} resolution={256} background={false}>
        <Lightformer form="circle" intensity={2.2} position={[0, 5, 2]} scale={7} color="#fff3df" />
        <Lightformer form="rect" intensity={1.0} position={[-5, 1, -3]} scale={5} color="#cfe8f7" />
        <Lightformer form="rect" intensity={0.6} position={[5, -2, 3]} scale={5} color="#e9d8b8" />
      </Environment>

      <hemisphereLight args={["#dbeef6", "#e9d8b8", 0.6]} />
      <ambientLight intensity={0.22} />
      <directionalLight
        castShadow={fancy}
        position={[6, 9, 4]}
        intensity={0.95}
        color="#fff3df"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.0004}
      />

      {/* 데스크톱: 전 mesh cast/receive 활성화 */}
      {fancy && <EnableShadows />}

      {/* 떠다니는 빛 입자 — 모바일은 개수를 줄인다. */}
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
      <Decorations transform={playerTransform} />
      <MessageOrbGroup transform={playerTransform} />
      <TravelSpotGroup transform={playerTransform} />
      <TravelTransition transform={playerTransform} />
      <Player transform={playerTransform} />
      <CameraRig transform={playerTransform} />

      {/* 데스크톱 전용 블룸/비네트 후처리 */}
      {fancy && <PostFX />}
    </>
  );
}
