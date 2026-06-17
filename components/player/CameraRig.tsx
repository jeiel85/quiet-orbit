import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { worldConfig } from "@/config/worldConfig";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { PlayerTransform } from "@/types/world";

const _desired = new Vector3();
const _target = new Vector3();

interface CameraRigProps {
  /** Player 가 매 프레임 갱신하는 공유 트랜스폼을 읽기만 한다. */
  transform: PlayerTransform;
}

/**
 * 플레이어를 부드럽게 따라가는 3인칭 카메라.
 * - 위치: 플레이어 뒤(−forward) + 위(up)
 * - up 벡터를 표면 법선으로 맞춰 행성 기준 수평을 유지한다.
 * - 프레임율과 무관한 지수 감쇠 lerp 로 추적이 튀지 않게 한다.
 * 렌더 출력이 없는 로직 전용 컴포넌트(null 반환).
 */
export default function CameraRig({ transform }: CameraRigProps) {
  const camera = useThree((state) => state.camera);
  const snapped = useRef(false);
  const cam = worldConfig.camera;

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);

    // 모바일은 카메라를 약간 멀게 둔다(설계 권장 — 좁은 화면에서 시야 확보).
    const distance = useSettingsStore.getState().isTouch ? cam.distance * 1.15 : cam.distance;

    _desired
      .copy(transform.position)
      .addScaledVector(transform.up, cam.height)
      .addScaledVector(transform.forward, -distance);

    if (!snapped.current) {
      // 첫 프레임은 Canvas 기본 카메라 위치에서 날아오지 않도록 즉시 스냅.
      camera.position.copy(_desired);
      snapped.current = true;
    } else {
      const t = 1 - Math.exp(-cam.lerp * delta);
      camera.position.lerp(_desired, t);
    }

    camera.up.copy(transform.up);
    _target.copy(transform.position).addScaledVector(transform.up, cam.lookHeight);
    camera.lookAt(_target);
  });

  return null;
}
