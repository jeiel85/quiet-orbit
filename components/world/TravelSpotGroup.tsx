import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { MathUtils, type Group, type MeshStandardMaterial, Quaternion, Vector3 } from "three";
import { getTravelSpotsForPlanet } from "@/config/planets";
import { worldConfig } from "@/config/worldConfig";
import { sphericalToWorld } from "@/lib/math/sphericalCoords";
import { useGameStore } from "@/store/useGameStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { PlayerTransform, TravelSpot } from "@/types/world";

const LOCAL_UP = new Vector3(0, 1, 0);
const _scale = new Vector3();

interface TravelSpotGroupProps {
  transform: PlayerTransform;
}

interface TravelSpotRenderData {
  spot: TravelSpot;
  position: Vector3;
  interactPosition: Vector3;
  up: Vector3;
  quaternion: Quaternion;
}

function setCursor(on: boolean) {
  document.body.style.cursor = on ? "pointer" : "auto";
}

function TravelSpotMarker({ data }: { data: TravelSpotRenderData }) {
  const marker = useRef<Group>(null);
  const ring = useRef<Group>(null);
  const coreMat = useRef<MeshStandardMaterial>(null);
  const activeId = useGameStore((s) => s.activeTravelSpotId);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const active = activeId === data.spot.id;
  const phase = (data.spot.variant ?? 0) * 0.8 + data.spot.id.length * 0.07;

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;
    if (marker.current) {
      const pulse = reduceMotion ? 0 : Math.sin(t * 2.2 + phase) * 0.04;
      const targetScale = active ? 1.22 + pulse : 1 + pulse * 0.4;
      marker.current.scale.lerp(_scale.setScalar(targetScale), 1 - Math.exp(-8 * delta));
      marker.current.position.y = reduceMotion ? 0 : Math.sin(t * 1.15 + phase) * 0.025;
    }
    if (ring.current && !reduceMotion) {
      ring.current.rotation.y += delta * (active ? 1.35 : 0.45);
    }
    if (coreMat.current) {
      const glow = active ? 1.8 : 0.9;
      coreMat.current.emissiveIntensity = MathUtils.lerp(
        coreMat.current.emissiveIntensity,
        glow,
        1 - Math.exp(-7 * delta),
      );
    }
  });

  const beginTravel = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const game = useGameStore.getState();
    if (game.travel === null && game.activeTravelSpotId === data.spot.id) {
      game.beginTravel(data.spot);
    }
  };

  return (
    <group position={data.position} quaternion={data.quaternion}>
      <group
        ref={marker}
        onClick={beginTravel}
        onPointerOver={() => setCursor(true)}
        onPointerOut={() => setCursor(false)}
      >
        <mesh position={[0, 0.015, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.012, 8, 28]} />
          <meshStandardMaterial color={data.spot.color} emissive={data.spot.color} emissiveIntensity={0.18} roughness={0.4} toneMapped={false} />
        </mesh>

        <group ref={ring} position={[0, 0.25, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.14, 0.01, 8, 24]} />
            <meshStandardMaterial color={data.spot.color} emissive={data.spot.color} emissiveIntensity={0.7} roughness={0.3} toneMapped={false} />
          </mesh>
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <icosahedronGeometry args={[worldConfig.travelSpot.markerRadius, 0]} />
            <meshStandardMaterial
              ref={coreMat}
              color={data.spot.color}
              emissive={data.spot.color}
              emissiveIntensity={0.9}
              roughness={0.2}
              toneMapped={false}
              flatShading
            />
          </mesh>
        </group>

        {/* 표면에 박힌 작은 발판들 */}
        <mesh position={[0.18, 0.04, 0.06]} rotation={[0.2, 0.4, 0.1]}>
          <dodecahedronGeometry args={[0.055, 0]} />
          <meshStandardMaterial color="#d8d0bd" roughness={0.9} flatShading />
        </mesh>
        <mesh position={[-0.13, 0.035, -0.12]} rotation={[0.4, 0.1, 0.2]}>
          <dodecahedronGeometry args={[0.045, 0]} />
          <meshStandardMaterial color="#b9c7c8" roughness={0.9} flatShading />
        </mesh>
      </group>
    </group>
  );
}

/**
 * 현재 행성의 5개 이동 스팟을 그리고 가장 가까운 스팟을 감지한다.
 * activeTravelSpotId 는 값이 바뀔 때만 갱신한다.
 */
export default function TravelSpotGroup({ transform }: TravelSpotGroupProps) {
  const activePlanetId = useGameStore((s) => s.activePlanetId);
  const spots = useMemo<TravelSpotRenderData[]>(
    () =>
      getTravelSpotsForPlanet(activePlanetId).map((spot) => {
        const surface = sphericalToWorld(spot.theta, spot.phi, worldConfig.planetRadius);
        const position = sphericalToWorld(
          spot.theta,
          spot.phi,
          worldConfig.planetRadius + (spot.radiusOffset ?? worldConfig.travelSpot.heightOffset),
        );
        const interactPosition = sphericalToWorld(spot.theta, spot.phi, worldConfig.surfaceRadius);
        const up = surface.clone().normalize();
        const quaternion = new Quaternion().setFromUnitVectors(LOCAL_UP, up);
        return { spot, position, interactPosition, up, quaternion };
      }),
    [activePlanetId],
  );

  const lastActive = useRef<string | null>(null);

  useEffect(() => {
    lastActive.current = null;
    useGameStore.getState().setActiveTravelSpotId(null);
  }, [activePlanetId]);

  useFrame(() => {
    const game = useGameStore.getState();
    if (game.travel !== null || game.openedMessageId !== null) {
      if (lastActive.current !== null) {
        lastActive.current = null;
        game.setActiveTravelSpotId(null);
      }
      return;
    }

    let nearestId: string | null = null;
    let nearestDist: number = worldConfig.travelSpot.interactionRadius;
    for (const item of spots) {
      const dist = transform.position.distanceTo(item.interactPosition);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestId = item.spot.id;
      }
    }

    if (nearestId !== lastActive.current) {
      lastActive.current = nearestId;
      game.setActiveTravelSpotId(nearestId);
    }
  });

  return (
    <>
      {spots.map((data) => (
        <TravelSpotMarker key={data.spot.id} data={data} />
      ))}
    </>
  );
}
