import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Matrix4, Quaternion, Vector3 } from "three";
import { worldConfig } from "@/config/worldConfig";
import { sphericalForward, sphericalToWorld } from "@/lib/math/sphericalCoords";
import { useGameStore } from "@/store/useGameStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { PlayerTransform, TravelState } from "@/types/world";

const _right = new Vector3();
const _basis = new Matrix4();
const _quat = new Quaternion();

const TRAIL_POINTS = Array.from({ length: 24 }, (_, i) => {
  const angle = (i / 24) * Math.PI * 2;
  const ring = i % 4;
  return {
    angle,
    radius: 0.55 + ring * 0.13,
    z: -0.7 - (i % 6) * 0.34,
    length: 0.25 + (i % 5) * 0.08,
    color: i % 3 === 0 ? "#fff0bd" : i % 3 === 1 ? "#c8ecff" : "#e2d2ff",
  };
});

function placePlayerAtTarget(transform: PlayerTransform, travel: TravelState) {
  const point = travel.targetPoint;
  const position = sphericalToWorld(point.theta, point.phi, worldConfig.surfaceRadius);
  transform.position.copy(position);
  transform.up.copy(position).normalize();
  transform.forward.copy(sphericalForward(point.theta, point.phi, point.heading));
}

/**
 * 행성 이동 중 별빛 터널을 렌더하고, 전환이 끝나면 플레이어를 목표 지점에 배치한다.
 * 진행률은 store 에 매 프레임 쓰지 않고 performance.now() 로 로컬 계산한다.
 */
export default function TravelTransition({ transform }: { transform: PlayerTransform }) {
  const travel = useGameStore((s) => s.travel);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const groupRef = useRef<Group>(null);
  const spinRef = useRef<Group>(null);
  const finishedKey = useRef<string | null>(null);
  const trailPoints = useMemo(() => TRAIL_POINTS, []);

  useEffect(() => {
    finishedKey.current = null;
  }, [travel?.spotId, travel?.startedAt]);

  useFrame((_, rawDelta) => {
    if (!travel) return;
    const delta = Math.min(rawDelta, 0.05);
    const progress = Math.min(1, (performance.now() - travel.startedAt) / travel.durationMs);

    const group = groupRef.current;
    if (group) {
      _right.copy(transform.up).cross(transform.forward).normalize();
      _basis.makeBasis(_right, transform.up, transform.forward);
      _quat.setFromRotationMatrix(_basis);
      group.quaternion.copy(_quat);
      group.position.copy(transform.position).addScaledVector(transform.up, 0.35);
      const swell = reduceMotion ? 1 : 0.85 + Math.sin(progress * Math.PI) * 0.55;
      group.scale.setScalar(swell);
    }
    if (spinRef.current && !reduceMotion) {
      spinRef.current.rotation.z += delta * 4.2;
      spinRef.current.position.z = -progress * 2.3;
    }

    if (progress >= 1 && finishedKey.current !== travel.spotId) {
      finishedKey.current = travel.spotId;
      placePlayerAtTarget(transform, travel);
      useGameStore.getState().finishTravel(travel.toPlanetId);
    }
  });

  if (!travel) return null;

  return (
    <group ref={groupRef}>
      <group ref={spinRef}>
        {trailPoints.map((point, i) => (
          <mesh
            key={i}
            position={[
              Math.cos(point.angle) * point.radius,
              Math.sin(point.angle) * point.radius,
              point.z,
            ]}
            rotation={[Math.PI / 2, 0, point.angle]}
          >
            <boxGeometry args={[0.018, point.length, 0.018]} />
            <meshBasicMaterial color={point.color} transparent opacity={0.78} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
