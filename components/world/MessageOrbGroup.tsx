import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { messages } from "@/config/messages";
import { HOME_PLANET_ID } from "@/config/planets";
import { worldConfig } from "@/config/worldConfig";
import { sphericalToWorld } from "@/lib/math/sphericalCoords";
import { useGameStore } from "@/store/useGameStore";
import MessageOrb from "./MessageOrb";
import type { PlayerTransform } from "@/types/world";

interface MessageOrbGroupProps {
  /** Player 가 갱신하는 공유 트랜스폼 — 근접 판정에 사용(읽기 전용). */
  transform: PlayerTransform;
}

/**
 * 모든 메시지 Orb 배치 + 근접 판정.
 * 매 프레임 가장 가까운 Orb 를 찾되, activeMessageId 는 "값이 바뀔 때만" 갱신한다
 * → 진입/이탈 시에만 store 업데이트, 프레임마다 re-render 없음.
 */
export default function MessageOrbGroup({ transform }: MessageOrbGroupProps) {
  const activePlanetId = useGameStore((s) => s.activePlanetId);
  const orbs = useMemo(
    () =>
      messages
        .filter((message) => (message.planetId ?? HOME_PLANET_ID) === activePlanetId)
        .map((message) => {
          const radius =
            worldConfig.planetRadius + (message.position.radiusOffset ?? worldConfig.orb.heightOffset);
          const worldPosition = sphericalToWorld(message.position.theta, message.position.phi, radius);
          return { message, worldPosition, up: worldPosition.clone().normalize() };
        }),
    [activePlanetId],
  );

  const lastActive = useRef<string | null>(null);

  useEffect(() => {
    lastActive.current = null;
    useGameStore.getState().setActiveMessageId(null);
  }, [activePlanetId]);

  useFrame(() => {
    if (useGameStore.getState().travel !== null) {
      if (lastActive.current !== null) {
        lastActive.current = null;
        useGameStore.getState().setActiveMessageId(null);
      }
      return;
    }

    let nearestId: string | null = null;
    let nearestDist: number = worldConfig.interactionRadius;
    for (const orb of orbs) {
      const dist = transform.position.distanceTo(orb.worldPosition);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestId = orb.message.id;
      }
    }
    if (nearestId !== lastActive.current) {
      lastActive.current = nearestId;
      useGameStore.getState().setActiveMessageId(nearestId);
    }
  });

  return (
    <>
      {orbs.map((orb) => (
        <MessageOrb
          key={orb.message.id}
          message={orb.message}
          worldPosition={orb.worldPosition}
          up={orb.up}
        />
      ))}
    </>
  );
}
