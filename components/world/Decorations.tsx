import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  type Group,
  type InstancedMesh,
  MathUtils,
  type MeshStandardMaterial,
  Object3D,
  Quaternion,
  TubeGeometry,
  Vector3,
} from "three";
import { decorations, type Decoration } from "@/config/decorations";
import { HOME_PLANET_ID } from "@/config/planets";
import { worldConfig } from "@/config/worldConfig";
import { sphericalToWorld } from "@/lib/math/sphericalCoords";
import { useGameStore } from "@/store/useGameStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { createAvatarAnim } from "@/lib/player/avatarAnim";
import type { PlayerTransform } from "@/types/world";
import ShadowBlob from "./ShadowBlob";
import PrimitiveFox from "@/components/player/PrimitiveFox";

const LOCAL_UP = new Vector3(0, 1, 0);

const FLOWER_PETAL = ["#f4a6c0", "#fdfbf6", "#c9b8ee"]; // variant 별 꽃잎 색
const MUSHROOM_CAP = ["#d96b5c", "#e7b24a"]; // variant 별 버섯 갓 색
const STAR_COLOR = ["#fff0c2", "#bfe6f5", "#e6d2ff"]; // variant 별 별 색
const GRASS_COLOR = ["#7fb86a", "#9ccb6f", "#cdb56a"]; // variant 별 들풀 색(초록·연두·마른풀)
const REED_STEM = ["#86a86a", "#b7a85f"]; // variant 별 갈대 줄기

// 결정적 의사난수(들풀 흩뿌리기용) — 같은 seed 면 항상 같은 배치(렌더 안정).
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 근접도 0..1 — 플레이어가 NEAR 안이면 1, FAR 밖이면 0.
const NEAR = 0.55;
const FAR = 1.7;
const proximityOf = (dist: number) => MathUtils.clamp((FAR - dist) / (FAR - NEAR), 0, 1);

const reduce = () => useSettingsStore.getState().reduceMotion;

// 인터랙티브 장식이 공통으로 받는 props.
interface InteractiveProps {
  /** 근접 판정 기준 표면 위치(월드). */
  proxPosition: Vector3;
  /** 플레이어 트랜스폼(읽기 전용). */
  transform: PlayerTransform;
  blob: boolean;
}

function setCursor(on: boolean) {
  document.body.style.cursor = on ? "pointer" : "auto";
}

// ── 나무 (뾰족한 소나무류) ───────────────────────────────────
function Tree({ phase, blob }: { phase: number; blob: boolean }) {
  const foliage = useRef<Group>(null);
  useFrame((state) => {
    if (reduce()) return;
    const f = foliage.current;
    if (!f) return;
    const t = state.clock.elapsedTime;
    f.rotation.z = Math.sin(t * 1.1 + phase) * 0.045;
    f.rotation.x = Math.cos(t * 0.8 + phase) * 0.03;
  });

  return (
    <group>
      {blob && <ShadowBlob radius={0.32} />}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.04, 0.055, 0.2, 6]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.9} />
      </mesh>
      <group ref={foliage} position={[0, 0.2, 0]}>
        <mesh position={[0, 0.13, 0]}>
          <coneGeometry args={[0.19, 0.26, 8]} />
          <meshStandardMaterial color="#7bb47e" flatShading roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <coneGeometry args={[0.15, 0.22, 8]} />
          <meshStandardMaterial color="#8cc089" flatShading roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <coneGeometry args={[0.11, 0.18, 8]} />
          <meshStandardMaterial color="#9bcf95" flatShading roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
}

// ── 바오바브 (큰 나무) ───────────────────────────────────────
function Baobab({ phase, blob }: { phase: number; blob: boolean }) {
  const crown = useRef<Group>(null);
  useFrame((state) => {
    if (reduce()) return;
    const c = crown.current;
    if (!c) return;
    const t = state.clock.elapsedTime;
    c.rotation.z = Math.sin(t * 0.7 + phase) * 0.03;
  });
  return (
    <group>
      {blob && <ShadowBlob radius={0.5} />}
      {/* 굵은 줄기 */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.09, 0.16, 0.44, 8]} />
        <meshStandardMaterial color="#937152" roughness={0.92} flatShading />
      </mesh>
      {/* 둥근 수관 */}
      <group ref={crown} position={[0, 0.5, 0]}>
        <mesh>
          <sphereGeometry args={[0.26, 14, 12]} />
          <meshStandardMaterial color="#6fa873" roughness={0.85} flatShading />
        </mesh>
        <mesh position={[0.22, 0.04, 0.05]}>
          <sphereGeometry args={[0.17, 12, 10]} />
          <meshStandardMaterial color="#7eb87f" roughness={0.85} flatShading />
        </mesh>
        <mesh position={[-0.2, 0.02, -0.04]}>
          <sphereGeometry args={[0.15, 12, 10]} />
          <meshStandardMaterial color="#82bd83" roughness={0.85} flatShading />
        </mesh>
        <mesh position={[0.02, 0.14, -0.18]}>
          <sphereGeometry args={[0.14, 12, 10]} />
          <meshStandardMaterial color="#76b07a" roughness={0.85} flatShading />
        </mesh>
      </group>
    </group>
  );
}

// ── 돌 ───────────────────────────────────────────────────────
function Rock({ blob }: { blob: boolean }) {
  return (
    <group>
      {blob && <ShadowBlob radius={0.26} />}
      <mesh position={[0, 0.07, 0]}>
        <icosahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial color="#9aa7a8" flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0.12, 0.045, 0.05]}>
        <icosahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial color="#aab4b2" flatShading roughness={0.95} />
      </mesh>
      <mesh position={[-0.1, 0.035, -0.04]} rotation={[0.3, 0.5, 0]}>
        <dodecahedronGeometry args={[0.06, 0]} />
        <meshStandardMaterial color="#8f9b9c" flatShading roughness={0.95} />
      </mesh>
    </group>
  );
}

// ── 집 ───────────────────────────────────────────────────────
function House({ blob }: { blob: boolean }) {
  return (
    <group>
      {blob && <ShadowBlob radius={0.34} />}
      <mesh position={[0, 0.11, 0]}>
        <boxGeometry args={[0.26, 0.22, 0.26]} />
        <meshStandardMaterial color="#ece0c8" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.31, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.22, 0.18, 4]} />
        <meshStandardMaterial color="#cf8a6b" flatShading roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.06, 0.131]}>
        <boxGeometry args={[0.08, 0.12, 0.01]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.8} />
      </mesh>
      <mesh position={[0.082, 0.14, 0.131]}>
        <boxGeometry args={[0.06, 0.06, 0.01]} />
        <meshStandardMaterial color="#bfe2ea" roughness={0.4} emissive="#bfe2ea" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.08, 0.36, -0.02]}>
        <boxGeometry args={[0.05, 0.13, 0.05]} />
        <meshStandardMaterial color="#c0856a" roughness={0.85} />
      </mesh>
    </group>
  );
}

// ── 꽃 ───────────────────────────────────────────────────────
function Flower({ variant = 0, phase }: { variant?: number; phase: number }) {
  const sway = useRef<Group>(null);
  const petal = FLOWER_PETAL[variant % FLOWER_PETAL.length];
  const petals = useMemo(() => [0, 1, 2, 3, 4].map((i) => (i / 5) * Math.PI * 2), []);

  useFrame((state) => {
    if (reduce()) return;
    const s = sway.current;
    if (!s) return;
    s.rotation.z = Math.sin(state.clock.elapsedTime * 1.6 + phase) * 0.12;
  });

  return (
    <group ref={sway}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.12, 6]} />
        <meshStandardMaterial color="#6fae78" roughness={0.8} />
      </mesh>
      {petals.map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.045, 0.14, Math.sin(angle) * 0.045]}>
          <sphereGeometry args={[0.03, 10, 8]} />
          <meshStandardMaterial color={petal} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.14, 0]}>
        <sphereGeometry args={[0.028, 10, 8]} />
        <meshStandardMaterial color="#f7c76b" roughness={0.5} />
      </mesh>
    </group>
  );
}

// ── 버섯 ─────────────────────────────────────────────────────
function Mushroom({ variant = 0, phase }: { variant?: number; phase: number }) {
  const sway = useRef<Group>(null);
  const cap = MUSHROOM_CAP[variant % MUSHROOM_CAP.length];
  useFrame((state) => {
    if (reduce()) return;
    const s = sway.current;
    if (!s) return;
    s.rotation.z = Math.sin(state.clock.elapsedTime * 1.3 + phase) * 0.07;
  });
  return (
    <group ref={sway}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.022, 0.028, 0.1, 8]} />
        <meshStandardMaterial color="#f3ead4" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.11, 0]} scale={[1, 0.6, 1]}>
        <sphereGeometry args={[0.07, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={cap} roughness={0.7} />
      </mesh>
      {/* 갓 위 점 */}
      <mesh position={[0.025, 0.13, 0.01]}>
        <sphereGeometry args={[0.011, 8, 8]} />
        <meshStandardMaterial color="#fdfbf6" roughness={0.6} />
      </mesh>
      <mesh position={[-0.02, 0.125, 0.03]}>
        <sphereGeometry args={[0.009, 8, 8]} />
        <meshStandardMaterial color="#fdfbf6" roughness={0.6} />
      </mesh>
    </group>
  );
}

// ── 장미 (유리돔, 인터랙티브) ────────────────────────────────
function Rose({ proxPosition, transform, blob }: InteractiveProps) {
  const bloomMat = useRef<MeshStandardMaterial>(null);
  const domeMat = useRef<MeshStandardMaterial>(null);
  const bloom = useRef<Group>(null);
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const p = proximityOf(transform.position.distanceTo(proxPosition));
    const rm = reduce();
    const t = state.clock.elapsedTime;
    if (bloom.current) {
      bloom.current.rotation.y += delta * (0.2 + p * 0.6);
      bloom.current.position.y = 0.205 + (rm ? 0 : Math.sin(t * 1.4) * 0.006 + p * 0.01);
    }
    if (bloomMat.current) {
      const target = 0.35 + p * 1.3 + (rm ? 0 : Math.sin(t * 2.5) * 0.08 * p);
      bloomMat.current.emissiveIntensity = MathUtils.lerp(bloomMat.current.emissiveIntensity, target, 1 - Math.exp(-6 * delta));
    }
    if (domeMat.current) {
      domeMat.current.opacity = MathUtils.lerp(domeMat.current.opacity, 0.16 + p * 0.12, 1 - Math.exp(-6 * delta));
    }
  });
  return (
    <group>
      {blob && <ShadowBlob radius={0.3} />}
      {/* 흙 받침 */}
      <mesh position={[0, 0.02, 0]} scale={[1, 0.5, 1]}>
        <sphereGeometry args={[0.12, 14, 10]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.95} />
      </mesh>
      {/* 줄기 */}
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.012, 0.014, 0.18, 6]} />
        <meshStandardMaterial color="#5f9468" roughness={0.8} />
      </mesh>
      {/* 잎 */}
      <mesh position={[0.05, 0.12, 0]} rotation={[0, 0, -0.7]} scale={[1, 0.4, 0.7]}>
        <sphereGeometry args={[0.04, 10, 8]} />
        <meshStandardMaterial color="#6aa771" roughness={0.8} />
      </mesh>
      {/* 꽃송이 */}
      <group ref={bloom} position={[0, 0.205, 0]}>
        <mesh>
          <coneGeometry args={[0.05, 0.08, 10]} />
          <meshStandardMaterial ref={bloomMat} color="#e8506a" emissive="#e8506a" emissiveIntensity={0.35} roughness={0.5} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.03, 0]} rotation={[0, 0.6, 0]}>
          <coneGeometry args={[0.035, 0.06, 8]} />
          <meshStandardMaterial color="#f0697f" emissive="#f0697f" emissiveIntensity={0.3} roughness={0.5} toneMapped={false} />
        </mesh>
      </group>
      {/* 유리돔 */}
      <mesh position={[0, 0.16, 0]}>
        <sphereGeometry args={[0.2, 18, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        <meshStandardMaterial ref={domeMat} color="#eaf6ff" transparent opacity={0.18} roughness={0.08} metalness={0.0} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <sphereGeometry args={[0.02, 10, 8]} />
        <meshStandardMaterial color="#cfe6f2" roughness={0.2} />
      </mesh>
    </group>
  );
}

// ── 화산 (인터랙티브) ────────────────────────────────────────
function Volcano({ proxPosition, transform, blob, active }: InteractiveProps & { active: boolean }) {
  const glowMat = useRef<MeshStandardMaterial>(null);
  const smoke = useRef<Group>(null);
  const smokeMat = useRef<MeshStandardMaterial>(null);
  const puff = useRef(0); // 클릭 시 1 → 감쇠
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const p = proximityOf(transform.position.distanceTo(proxPosition));
    const rm = reduce();
    const t = state.clock.elapsedTime;
    puff.current = Math.max(0, puff.current - delta * 0.7);

    if (glowMat.current && active) {
      const base = 0.6 + p * 1.1 + (rm ? 0 : Math.sin(t * 3) * 0.15);
      glowMat.current.emissiveIntensity = MathUtils.lerp(glowMat.current.emissiveIntensity, base + puff.current * 2, 1 - Math.exp(-7 * delta));
    }
    if (smoke.current && smokeMat.current) {
      // 활화산은 은은히 연기를 피우고, 클릭하면 한 번 크게 뿜는다.
      const drift = active && !rm ? (Math.sin(t * 0.8) * 0.5 + 0.5) * 0.25 : 0;
      const rise = drift + puff.current * 0.35;
      smoke.current.position.y = 0.34 + rise;
      const vis = (active ? 0.25 : 0) + puff.current * 0.6;
      smokeMat.current.opacity = MathUtils.lerp(smokeMat.current.opacity, vis, 1 - Math.exp(-6 * delta));
      const s = 0.5 + rise * 1.2 + puff.current * 0.6;
      smoke.current.scale.setScalar(s);
    }
  });
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    puff.current = 1;
  };
  return (
    <group onClick={onClick} onPointerOver={() => setCursor(true)} onPointerOut={() => setCursor(false)}>
      {blob && <ShadowBlob radius={0.34} />}
      {/* 화산체 (프러스텀) */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.1, 0.24, 0.3, 12]} />
        <meshStandardMaterial color="#6b574f" roughness={0.95} flatShading />
      </mesh>
      {/* 분화구 */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.085, 0.1, 0.04, 12]} />
        <meshStandardMaterial color="#4a3b35" roughness={0.9} />
      </mesh>
      {/* 용암 발광 (활화산만) */}
      {active && (
        <mesh position={[0, 0.315, 0]}>
          <circleGeometry args={[0.075, 12]} />
          <meshStandardMaterial ref={glowMat} color="#ff8a3c" emissive="#ff7a28" emissiveIntensity={0.6} roughness={0.4} toneMapped={false} />
        </mesh>
      )}
      {/* 연기 */}
      <group ref={smoke} position={[0, 0.34, 0]}>
        <mesh>
          <sphereGeometry args={[0.08, 10, 8]} />
          <meshStandardMaterial ref={smokeMat} color="#cfc9c4" transparent opacity={0} depthWrite={false} roughness={1} />
        </mesh>
      </group>
    </group>
  );
}

// ── 가로등 (인터랙티브) ──────────────────────────────────────
function Lamp({ proxPosition, transform, blob }: InteractiveProps) {
  const lampMat = useRef<MeshStandardMaterial>(null);
  const glowMat = useRef<MeshStandardMaterial>(null);
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const p = proximityOf(transform.position.distanceTo(proxPosition));
    const flicker = reduce() ? 0 : Math.sin(state.clock.elapsedTime * 8) * 0.06;
    const target = 0.7 + p * 1.8 + flicker;
    if (lampMat.current) lampMat.current.emissiveIntensity = MathUtils.lerp(lampMat.current.emissiveIntensity, target, 1 - Math.exp(-6 * delta));
    if (glowMat.current) glowMat.current.opacity = MathUtils.lerp(glowMat.current.opacity, 0.12 + p * 0.25, 1 - Math.exp(-6 * delta));
  });
  return (
    <group>
      {blob && <ShadowBlob radius={0.22} />}
      {/* 기둥 */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.018, 0.024, 0.4, 8]} />
        <meshStandardMaterial color="#46525a" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* 받침 */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.04, 8]} />
        <meshStandardMaterial color="#3a444a" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* 갓 */}
      <mesh position={[0, 0.43, 0]}>
        <coneGeometry args={[0.07, 0.06, 8]} />
        <meshStandardMaterial color="#3a444a" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* 등불 */}
      <mesh position={[0, 0.39, 0]}>
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshStandardMaterial ref={lampMat} color="#ffe6ab" emissive="#ffce72" emissiveIntensity={0.7} roughness={0.3} toneMapped={false} />
      </mesh>
      {/* 빛 번짐 */}
      <mesh position={[0, 0.39, 0]}>
        <sphereGeometry args={[0.1, 12, 10]} />
        <meshStandardMaterial ref={glowMat} color="#ffd98a" transparent opacity={0.12} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ── 별 (떠 있음, 인터랙티브) ─────────────────────────────────
// 별은 표면 위에 부유하므로 가짜 그림자(blob)가 없다 — InteractiveProps 의 blob 제외.
function Star({
  proxPosition,
  transform,
  variant = 0,
}: Omit<InteractiveProps, "blob"> & { variant?: number }) {
  const spin = useRef<Group>(null);
  const mat = useRef<MeshStandardMaterial>(null);
  const color = STAR_COLOR[variant % STAR_COLOR.length];
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const p = proximityOf(transform.position.distanceTo(proxPosition));
    const rm = reduce();
    const t = state.clock.elapsedTime;
    if (spin.current) {
      spin.current.rotation.y += delta * (0.4 + p * 1.4);
      spin.current.position.y = rm ? 0 : Math.sin(t * 1.2 + variant) * 0.03 + p * 0.04;
    }
    if (mat.current) {
      const twinkle = rm ? 0 : Math.sin(t * (3 + p * 4) + variant) * 0.3;
      mat.current.emissiveIntensity = MathUtils.lerp(mat.current.emissiveIntensity, 1.0 + p * 1.2 + twinkle, 1 - Math.exp(-7 * delta));
    }
  });
  return (
    <group ref={spin}>
      <mesh>
        <icosahedronGeometry args={[0.07, 0]} />
        <meshStandardMaterial ref={mat} color={color} emissive={color} emissiveIntensity={1.0} roughness={0.3} toneMapped={false} flatShading />
      </mesh>
    </group>
  );
}

// ── 여우 컴패니언 (인터랙티브) ───────────────────────────────
function FoxCompanion({ proxPosition, transform, blob }: InteractiveProps) {
  const anim = useRef(createAvatarAnim());
  const wrap = useRef<Group>(null);
  const hop = useRef(0); // 클릭 시 1 → 감쇠
  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const p = proximityOf(transform.position.distanceTo(proxPosition));
    const rm = reduce();
    // 가까이 오면 idle 애니메이션(귀·꼬리)이 빨라진다 = 반가워함.
    anim.current.elapsed += delta * (1 + p * 1.8);
    anim.current.reduceMotion = rm;
    hop.current = Math.max(0, hop.current - delta * 2.2);
    if (wrap.current) {
      const h = rm ? 0 : Math.sin((1 - hop.current) * Math.PI) * 0.12 * (hop.current > 0 ? 1 : 0);
      wrap.current.position.y = h;
    }
  });
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        hop.current = 1;
      }}
      onPointerOver={() => setCursor(true)}
      onPointerOut={() => setCursor(false)}
    >
      {blob && <ShadowBlob radius={0.26} />}
      {/* PrimitiveFox 는 발끝이 로컬 y≈-playerHeight 에 있다 — 스케일분만큼 올려 표면에 안착. */}
      <group ref={wrap} scale={0.72} position={[0, worldConfig.playerHeight * 0.72, 0]}>
        <PrimitiveFox anim={anim} />
      </group>
    </group>
  );
}

// ── 수정 클러스터 ───────────────────────────────────────────
function Crystal({ variant = 0, phase, blob }: { variant?: number; phase: number; blob: boolean }) {
  const group = useRef<Group>(null);
  const colors = ["#8fe0f0", "#ffd98a", "#c9b8ee"];
  const color = colors[variant % colors.length];
  useFrame((state) => {
    if (reduce()) return;
    const g = group.current;
    if (!g) return;
    g.rotation.y = Math.sin(state.clock.elapsedTime * 0.8 + phase) * 0.08;
  });
  return (
    <group>
      {blob && <ShadowBlob radius={0.26} />}
      <group ref={group}>
        <mesh position={[0, 0.14, 0]} rotation={[0.1, 0.2, 0]}>
          <coneGeometry args={[0.07, 0.28, 5]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.28} toneMapped={false} flatShading />
        </mesh>
        <mesh position={[0.09, 0.09, -0.04]} rotation={[0.25, 0.4, -0.35]}>
          <coneGeometry args={[0.045, 0.2, 5]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} roughness={0.35} toneMapped={false} flatShading />
        </mesh>
        <mesh position={[-0.08, 0.08, 0.03]} rotation={[-0.2, -0.4, 0.25]}>
          <coneGeometry args={[0.04, 0.18, 5]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.22} roughness={0.35} toneMapped={false} flatShading />
        </mesh>
      </group>
    </group>
  );
}

// ── 망원경 ─────────────────────────────────────────────────
function Telescope({ variant = 0, blob }: { variant?: number; blob: boolean }) {
  const metal = variant % 2 === 0 ? "#52606a" : "#5d5270";
  return (
    <group>
      {blob && <ShadowBlob radius={0.28} />}
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.016, 0.022, 0.26, 8]} />
        <meshStandardMaterial color={metal} roughness={0.55} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.25, 0.05]} rotation={[1.2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.055, 0.28, 12]} />
        <meshStandardMaterial color="#e8d9b8" roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.34, 0.16]} rotation={[1.2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.025, 12]} />
        <meshStandardMaterial color="#7fbad0" emissive="#7fbad0" emissiveIntensity={0.18} roughness={0.25} />
      </mesh>
      <mesh position={[0.07, 0.03, 0.04]} rotation={[0.45, 0, -0.45]}>
        <cylinderGeometry args={[0.01, 0.012, 0.24, 6]} />
        <meshStandardMaterial color={metal} roughness={0.7} />
      </mesh>
      <mesh position={[-0.07, 0.03, 0.04]} rotation={[0.45, 0, 0.45]}>
        <cylinderGeometry args={[0.01, 0.012, 0.24, 6]} />
        <meshStandardMaterial color={metal} roughness={0.7} />
      </mesh>
    </group>
  );
}

// ── 편지함 ─────────────────────────────────────────────────
function Postbox({ variant = 0, blob }: { variant?: number; blob: boolean }) {
  const body = variant % 2 === 0 ? "#d46f5d" : "#6aa7b8";
  return (
    <group>
      {blob && <ShadowBlob radius={0.22} />}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.2, 7]} />
        <meshStandardMaterial color="#806a54" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.18, 0.12, 0.14]} />
        <meshStandardMaterial color={body} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.29, 0]} scale={[1, 0.5, 0.75]}>
        <sphereGeometry args={[0.09, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={body} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.24, 0.071]}>
        <boxGeometry args={[0.12, 0.025, 0.01]} />
        <meshStandardMaterial color="#f5e9cf" roughness={0.5} />
      </mesh>
    </group>
  );
}

// ── 작은 벤치 ───────────────────────────────────────────────
function Bench({ variant = 0, blob }: { variant?: number; blob: boolean }) {
  const wood = variant % 2 === 0 ? "#9b7350" : "#7e6a9b";
  return (
    <group>
      {blob && <ShadowBlob radius={0.32} />}
      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[0.34, 0.045, 0.12]} />
        <meshStandardMaterial color={wood} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.22, -0.055]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.34, 0.045, 0.11]} />
        <meshStandardMaterial color={wood} roughness={0.82} />
      </mesh>
      <mesh position={[0.12, 0.06, 0.03]}>
        <cylinderGeometry args={[0.012, 0.012, 0.12, 6]} />
        <meshStandardMaterial color="#5b4a3f" roughness={0.8} />
      </mesh>
      <mesh position={[-0.12, 0.06, 0.03]}>
        <cylinderGeometry args={[0.012, 0.012, 0.12, 6]} />
        <meshStandardMaterial color="#5b4a3f" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ── 바람개비 ───────────────────────────────────────────────
function Windmill({ variant = 0, phase, blob }: { variant?: number; phase: number; blob: boolean }) {
  const blades = useRef<Group>(null);
  const roof = variant % 2 === 0 ? "#cf8a6b" : "#8a84c8";
  useFrame((_, rawDelta) => {
    if (reduce()) return;
    const b = blades.current;
    if (!b) return;
    b.rotation.z += Math.min(rawDelta, 0.05) * (2.5 + variant * 0.35);
  });
  return (
    <group>
      {blob && <ShadowBlob radius={0.34} />}
      <mesh position={[0, 0.19, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.38, 6]} />
        <meshStandardMaterial color="#e6d8bf" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <coneGeometry args={[0.14, 0.14, 6]} />
        <meshStandardMaterial color={roof} roughness={0.75} flatShading />
      </mesh>
      <group ref={blades} position={[0, 0.28, 0.1]} rotation={[0, 0, phase]}>
        {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle) => (
          <mesh key={angle} position={[Math.cos(angle) * 0.08, Math.sin(angle) * 0.08, 0]} rotation={[0, 0, angle]}>
            <boxGeometry args={[0.16, 0.025, 0.012]} />
            <meshStandardMaterial color="#f8f0da" roughness={0.55} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ── 선인장 ─────────────────────────────────────────────────
function Cactus({ variant = 0, phase, blob }: { variant?: number; phase: number; blob: boolean }) {
  const sway = useRef<Group>(null);
  useFrame((state) => {
    if (reduce()) return;
    const s = sway.current;
    if (!s) return;
    s.rotation.z = Math.sin(state.clock.elapsedTime * 0.9 + phase) * 0.035;
  });
  return (
    <group>
      {blob && <ShadowBlob radius={0.24} />}
      <group ref={sway}>
        <mesh position={[0, 0.17, 0]}>
          <cylinderGeometry args={[0.055, 0.06, 0.34, 8]} />
          <meshStandardMaterial color={variant % 2 === 0 ? "#6fa873" : "#5d9670"} roughness={0.85} flatShading />
        </mesh>
        <mesh position={[0.075, 0.21, 0]} rotation={[0, 0, -0.8]}>
          <cylinderGeometry args={[0.027, 0.03, 0.18, 8]} />
          <meshStandardMaterial color="#6fa873" roughness={0.85} flatShading />
        </mesh>
        <mesh position={[-0.08, 0.13, 0]} rotation={[0, 0, 0.9]}>
          <cylinderGeometry args={[0.024, 0.027, 0.15, 8]} />
          <meshStandardMaterial color="#78b47b" roughness={0.85} flatShading />
        </mesh>
      </group>
    </group>
  );
}

// ── 작은 아치 ───────────────────────────────────────────────
function Arch({ blob }: { blob: boolean }) {
  return (
    <group>
      {blob && <ShadowBlob radius={0.36} />}
      <mesh position={[0.12, 0.18, 0]}>
        <cylinderGeometry args={[0.035, 0.045, 0.36, 8]} />
        <meshStandardMaterial color="#a59688" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[-0.12, 0.18, 0]}>
        <cylinderGeometry args={[0.035, 0.045, 0.36, 8]} />
        <meshStandardMaterial color="#a59688" roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0, 0.36, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.12, 0.035, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#b0a293" roughness={0.95} flatShading />
      </mesh>
    </group>
  );
}

// ── 작은 연못 ───────────────────────────────────────────────
function Pond() {
  return (
    <group>
      <mesh position={[0, 0.018, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.35, 0.8, 1]}>
        <circleGeometry args={[0.22, 24]} />
        <meshStandardMaterial color="#8dcdd8" emissive="#8dcdd8" emissiveIntensity={0.12} roughness={0.2} />
      </mesh>
      <mesh position={[0.14, 0.028, -0.04]} rotation={[0.2, 0.4, 0]}>
        <dodecahedronGeometry args={[0.04, 0]} />
        <meshStandardMaterial color="#d4c8ae" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[-0.16, 0.025, 0.06]} rotation={[0.4, 0.1, 0.2]}>
        <dodecahedronGeometry args={[0.035, 0]} />
        <meshStandardMaterial color="#b7b0a0" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

// ── 작은 위성 ───────────────────────────────────────────────
function Satellite({ variant = 0, phase }: { variant?: number; phase: number }) {
  const group = useRef<Group>(null);
  useFrame((state, rawDelta) => {
    if (reduce()) return;
    const g = group.current;
    if (!g) return;
    g.rotation.y += Math.min(rawDelta, 0.05) * 0.65;
    g.position.y = Math.sin(state.clock.elapsedTime * 1.2 + phase) * 0.035;
  });
  return (
    <group ref={group}>
      <mesh>
        <boxGeometry args={[0.16, 0.1, 0.12]} />
        <meshStandardMaterial color={variant % 2 === 0 ? "#d8d4c8" : "#c7c5e8"} roughness={0.55} metalness={0.25} />
      </mesh>
      <mesh position={[0.17, 0, 0]}>
        <boxGeometry args={[0.16, 0.055, 0.01]} />
        <meshStandardMaterial color="#6aa7d8" emissive="#6aa7d8" emissiveIntensity={0.18} roughness={0.35} />
      </mesh>
      <mesh position={[-0.17, 0, 0]}>
        <boxGeometry args={[0.16, 0.055, 0.01]} />
        <meshStandardMaterial color="#6aa7d8" emissive="#6aa7d8" emissiveIntensity={0.18} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[0.6, 0, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.12, 6]} />
        <meshStandardMaterial color="#f0e7cf" roughness={0.45} metalness={0.3} />
      </mesh>
    </group>
  );
}

// ── 조개 ───────────────────────────────────────────────────
function Shell({ variant = 0, blob }: { variant?: number; blob: boolean }) {
  const color = variant % 2 === 0 ? "#f2d6c8" : "#e6d2ff";
  return (
    <group>
      {blob && <ShadowBlob radius={0.16} />}
      <mesh position={[0, 0.04, 0]} scale={[1.2, 0.55, 0.85]} rotation={[0.2, 0.4, 0]}>
        <sphereGeometry args={[0.085, 14, 10]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.075, 0.025]} rotation={[0.25, 0.4, 0]}>
        <torusGeometry args={[0.052, 0.006, 6, 16, Math.PI]} />
        <meshStandardMaterial color="#f8efe0" roughness={0.5} />
      </mesh>
    </group>
  );
}

// ── 손등불 ─────────────────────────────────────────────────
function Lantern({ variant = 0, proxPosition, transform, blob }: InteractiveProps & { variant?: number }) {
  const mat = useRef<MeshStandardMaterial>(null);
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const p = proximityOf(transform.position.distanceTo(proxPosition));
    const flicker = reduce() ? 0 : Math.sin(state.clock.elapsedTime * 5.5 + variant) * 0.08;
    if (mat.current) {
      mat.current.emissiveIntensity = MathUtils.lerp(mat.current.emissiveIntensity, 0.8 + p * 1.3 + flicker, 1 - Math.exp(-7 * delta));
    }
  });
  return (
    <group>
      {blob && <ShadowBlob radius={0.18} />}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.009, 0.012, 0.24, 6]} />
        <meshStandardMaterial color="#5c5149" roughness={0.75} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.055, 12, 10]} />
        <meshStandardMaterial ref={mat} color="#ffe2a8" emissive="#ffd07a" emissiveIntensity={0.8} roughness={0.2} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.31, 0]}>
        <torusGeometry args={[0.045, 0.006, 6, 12]} />
        <meshStandardMaterial color="#5c5149" roughness={0.75} metalness={0.25} />
      </mesh>
    </group>
  );
}

// ── 낮은 구름 ───────────────────────────────────────────────
function Cloud({ phase }: { phase: number }) {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (reduce()) return;
    const g = group.current;
    if (!g) return;
    g.position.y = Math.sin(state.clock.elapsedTime * 0.6 + phase) * 0.04;
    g.rotation.y = Math.sin(state.clock.elapsedTime * 0.4 + phase) * 0.12;
  });
  return (
    <group ref={group}>
      <mesh position={[-0.08, 0, 0]} scale={[1.1, 0.75, 0.9]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshStandardMaterial color="#f4f6f1" roughness={0.85} />
      </mesh>
      <mesh position={[0.02, 0.02, 0]} scale={[1.15, 0.8, 0.95]}>
        <sphereGeometry args={[0.11, 12, 10]} />
        <meshStandardMaterial color="#fffaf1" roughness={0.85} />
      </mesh>
      <mesh position={[0.12, -0.005, 0]} scale={[1.0, 0.7, 0.85]}>
        <sphereGeometry args={[0.08, 12, 10]} />
        <meshStandardMaterial color="#eef2f4" roughness={0.85} />
      </mesh>
    </group>
  );
}

// ── 종이배 ─────────────────────────────────────────────────
function PaperBoat({ variant = 0, phase }: { variant?: number; phase: number }) {
  const boat = useRef<Group>(null);
  useFrame((state) => {
    if (reduce()) return;
    const b = boat.current;
    if (!b) return;
    b.rotation.z = Math.sin(state.clock.elapsedTime * 1.2 + phase) * 0.08;
    b.rotation.x = Math.cos(state.clock.elapsedTime * 0.8 + phase) * 0.04;
  });
  return (
    <group ref={boat}>
      <mesh position={[-0.045, 0.055, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.12, 0.018, 0.08]} />
        <meshStandardMaterial color={variant % 2 === 0 ? "#f8f0da" : "#e6d2ff"} roughness={0.55} />
      </mesh>
      <mesh position={[0.045, 0.055, 0]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.12, 0.018, 0.08]} />
        <meshStandardMaterial color="#fff7e4" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.105, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.055, 0.11, 3]} />
        <meshStandardMaterial color="#f5c879" roughness={0.5} />
      </mesh>
    </group>
  );
}

// ── 돌고리 ─────────────────────────────────────────────────
function RingStone({ variant = 0, blob }: { variant?: number; blob: boolean }) {
  const stone = variant % 2 === 0 ? "#a8a5b2" : "#b7a58e";
  return (
    <group>
      {blob && <ShadowBlob radius={0.3} />}
      <mesh position={[0, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.13, 0.028, 8, 18]} />
        <meshStandardMaterial color={stone} roughness={0.95} flatShading />
      </mesh>
      <mesh position={[0.15, 0.045, 0.04]} rotation={[0.4, 0.2, 0]}>
        <dodecahedronGeometry args={[0.055, 0]} />
        <meshStandardMaterial color={stone} roughness={0.95} flatShading />
      </mesh>
      <mesh position={[-0.13, 0.04, -0.05]} rotation={[0.1, 0.5, 0.2]}>
        <dodecahedronGeometry args={[0.045, 0]} />
        <meshStandardMaterial color="#928f9b" roughness={0.95} flatShading />
      </mesh>
    </group>
  );
}

// ── 작은 깃발 ───────────────────────────────────────────────
function TinyFlag({ variant = 0, phase, blob }: { variant?: number; phase: number; blob: boolean }) {
  const flag = useRef<Group>(null);
  const color = variant % 2 === 0 ? "#f5b66c" : "#9fd7e5";
  useFrame((state) => {
    if (reduce()) return;
    const f = flag.current;
    if (!f) return;
    f.rotation.y = Math.sin(state.clock.elapsedTime * 2.2 + phase) * 0.18;
  });
  return (
    <group>
      {blob && <ShadowBlob radius={0.16} />}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.008, 0.01, 0.28, 6]} />
        <meshStandardMaterial color="#6d5c4f" roughness={0.75} />
      </mesh>
      <group ref={flag} position={[0.055, 0.24, 0]}>
        <mesh>
          <boxGeometry args={[0.11, 0.065, 0.012]} />
          <meshStandardMaterial color={color} roughness={0.55} />
        </mesh>
      </group>
    </group>
  );
}

// ── 혜성 조각 ───────────────────────────────────────────────
function Comet({ variant = 0, phase }: { variant?: number; phase: number }) {
  const group = useRef<Group>(null);
  const color = variant % 2 === 0 ? "#fff0bd" : "#c8ecff";
  useFrame((state, rawDelta) => {
    if (reduce()) return;
    const g = group.current;
    if (!g) return;
    g.rotation.y += Math.min(rawDelta, 0.05) * 0.8;
    g.position.y = Math.sin(state.clock.elapsedTime * 1.1 + phase) * 0.035;
  });
  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[0.075, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.05} roughness={0.25} toneMapped={false} flatShading />
      </mesh>
      <mesh position={[0, 0, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.045, 0.28, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} transparent opacity={0.55} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ── 작은 뮤직박스 (인터랙티브) ───────────────────────────────
function MusicBox({
  variant = 0,
  phase,
  proxPosition,
  transform,
  blob,
}: InteractiveProps & { variant?: number; phase: number }) {
  const lid = useRef<Group>(null);
  const crank = useRef<Group>(null);
  const note = useRef<Group>(null);
  const noteMat = useRef<MeshStandardMaterial>(null);
  const burst = useRef(0);
  const wood = variant % 2 === 0 ? "#b8845b" : "#7f75aa";
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const p = proximityOf(transform.position.distanceTo(proxPosition));
    const rm = reduce();
    const t = state.clock.elapsedTime;
    burst.current = Math.max(0, burst.current - delta * 1.2);

    if (lid.current) lid.current.rotation.x = MathUtils.lerp(lid.current.rotation.x, -0.18 - p * 0.8 - burst.current * 0.25, 1 - Math.exp(-7 * delta));
    if (crank.current && !rm) crank.current.rotation.z += delta * (1.2 + p * 5 + burst.current * 7);
    if (note.current) {
      note.current.position.y = 0.35 + (rm ? 0 : Math.sin(t * 1.8 + phase) * 0.035) + p * 0.08 + burst.current * 0.12;
      note.current.rotation.y += delta * (0.5 + p * 1.8);
    }
    if (noteMat.current) noteMat.current.emissiveIntensity = MathUtils.lerp(noteMat.current.emissiveIntensity, 0.25 + p * 1.4 + burst.current * 1.6, 1 - Math.exp(-8 * delta));
  });
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        burst.current = 1;
      }}
      onPointerOver={() => setCursor(true)}
      onPointerOut={() => setCursor(false)}
    >
      {blob && <ShadowBlob radius={0.28} />}
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[0.26, 0.18, 0.22]} />
        <meshStandardMaterial color={wood} roughness={0.78} />
      </mesh>
      <group ref={lid} position={[0, 0.19, -0.08]}>
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[0.28, 0.035, 0.23]} />
          <meshStandardMaterial color={variant % 2 === 0 ? "#e0b078" : "#a89bd6"} roughness={0.62} />
        </mesh>
      </group>
      <group ref={crank} position={[0.15, 0.12, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.035, 0.006, 6, 12]} />
          <meshStandardMaterial color="#f0c96a" roughness={0.45} metalness={0.25} />
        </mesh>
        <mesh position={[0.04, 0, 0]}>
          <sphereGeometry args={[0.014, 8, 6]} />
          <meshStandardMaterial color="#fff0bd" roughness={0.4} />
        </mesh>
      </group>
      <group ref={note} position={[0, 0.35, 0]}>
        <mesh>
          <sphereGeometry args={[0.025, 8, 6]} />
          <meshStandardMaterial ref={noteMat} color="#ffe8a8" emissive="#ffe8a8" emissiveIntensity={0.25} toneMapped={false} />
        </mesh>
        <mesh position={[0.035, 0.065, 0]}>
          <boxGeometry args={[0.012, 0.12, 0.012]} />
          <meshStandardMaterial color="#ffe8a8" emissive="#ffe8a8" emissiveIntensity={0.25} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

// ── 편지 나선 (인터랙티브) ───────────────────────────────────
function LetterSpiral({
  variant = 0,
  phase,
  proxPosition,
  transform,
  blob,
}: InteractiveProps & { variant?: number; phase: number }) {
  const ring = useRef<Group>(null);
  const glow = useRef<MeshStandardMaterial>(null);
  const burst = useRef(0);
  const papers = useMemo(() => [0, 1, 2, 3].map((i) => (i / 4) * Math.PI * 2), []);
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const p = proximityOf(transform.position.distanceTo(proxPosition));
    burst.current = Math.max(0, burst.current - delta * 1.35);
    if (ring.current && !reduce()) {
      ring.current.rotation.y += delta * (0.35 + p * 1.4 + burst.current * 2);
      ring.current.position.y = Math.sin(state.clock.elapsedTime * 1.1 + phase) * 0.025 + p * 0.035;
    }
    if (glow.current) glow.current.opacity = MathUtils.lerp(glow.current.opacity, 0.12 + p * 0.2 + burst.current * 0.22, 1 - Math.exp(-8 * delta));
  });
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        burst.current = 1;
      }}
      onPointerOver={() => setCursor(true)}
      onPointerOut={() => setCursor(false)}
    >
      {blob && <ShadowBlob radius={0.22} />}
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.014, 0.018, 0.26, 6]} />
        <meshStandardMaterial color="#776657" roughness={0.76} />
      </mesh>
      <group ref={ring} position={[0, 0.27, 0]}>
        {papers.map((angle, i) => (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.14, i * 0.035, Math.sin(angle) * 0.14]}
            rotation={[0.35, -angle + Math.PI / 2, Math.sin(phase + i) * 0.3]}
          >
            <boxGeometry args={[0.09, 0.055, 0.006]} />
            <meshStandardMaterial color={i % 2 === variant % 2 ? "#fff3dc" : "#dcecf5"} roughness={0.5} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.19, 12, 10]} />
          <meshStandardMaterial ref={glow} color="#dcecff" transparent opacity={0.12} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

// ── 물방울 샘 (인터랙티브) ───────────────────────────────────
function BubbleSpring({
  variant = 0,
  phase,
  proxPosition,
  transform,
  blob,
}: InteractiveProps & { variant?: number; phase: number }) {
  const water = useRef<MeshStandardMaterial>(null);
  const bubbles = useRef<Group>(null);
  const burst = useRef(0);
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const p = proximityOf(transform.position.distanceTo(proxPosition));
    const rm = reduce();
    const t = state.clock.elapsedTime;
    burst.current = Math.max(0, burst.current - delta * 1.1);
    if (water.current) water.current.emissiveIntensity = MathUtils.lerp(water.current.emissiveIntensity, 0.18 + p * 0.45 + burst.current * 0.5, 1 - Math.exp(-7 * delta));
    if (bubbles.current && !rm) {
      bubbles.current.position.y = Math.sin(t * 1.6 + phase) * 0.04 + p * 0.08 + burst.current * 0.16;
      bubbles.current.rotation.y += delta * (0.35 + p);
    }
  });
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        burst.current = 1;
      }}
      onPointerOver={() => setCursor(true)}
      onPointerOut={() => setCursor(false)}
    >
      {blob && <ShadowBlob radius={0.32} />}
      <mesh position={[0, 0.065, 0]} scale={[1.2, 0.45, 1]}>
        <sphereGeometry args={[0.16, 14, 10]} />
        <meshStandardMaterial color={variant % 2 === 0 ? "#b7a58e" : "#a8a5b2"} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.125, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.13, 20]} />
        <meshStandardMaterial ref={water} color="#8ed6e2" emissive="#8ed6e2" emissiveIntensity={0.18} roughness={0.24} toneMapped={false} />
      </mesh>
      <group ref={bubbles} position={[0, 0.23, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos(phase + i) * 0.06, i * 0.055, Math.sin(phase + i) * 0.045]}>
            <sphereGeometry args={[0.025 - i * 0.004, 8, 6]} />
            <meshStandardMaterial color="#d9f6ff" transparent opacity={0.72} roughness={0.1} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ── 달문 (인터랙티브) ───────────────────────────────────────
function MoonGate({
  variant = 0,
  phase,
  proxPosition,
  transform,
  blob,
}: InteractiveProps & { variant?: number; phase: number }) {
  const gate = useRef<Group>(null);
  const halo = useRef<MeshStandardMaterial>(null);
  const stars = useRef<Group>(null);
  const pulse = useRef(0);
  const color = variant % 2 === 0 ? "#d9ccff" : "#bfe6f5";
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const p = proximityOf(transform.position.distanceTo(proxPosition));
    pulse.current = Math.max(0, pulse.current - delta * 1.4);
    if (gate.current) gate.current.scale.setScalar(MathUtils.lerp(gate.current.scale.x, 1 + p * 0.08 + pulse.current * 0.12, 1 - Math.exp(-7 * delta)));
    if (stars.current && !reduce()) stars.current.rotation.z += delta * (0.45 + p * 1.3 + pulse.current * 2);
    if (halo.current) halo.current.opacity = MathUtils.lerp(halo.current.opacity, 0.18 + p * 0.24 + pulse.current * 0.25 + Math.sin(state.clock.elapsedTime * 2 + phase) * 0.02, 1 - Math.exp(-8 * delta));
  });
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        pulse.current = 1;
      }}
      onPointerOver={() => setCursor(true)}
      onPointerOut={() => setCursor(false)}
    >
      {blob && <ShadowBlob radius={0.4} />}
      <group ref={gate} position={[0, 0.26, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.028, 8, 24]} />
          <meshStandardMaterial color="#9f98ae" roughness={0.84} flatShading />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.155, 0.01, 6, 20]} />
          <meshStandardMaterial ref={halo} color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={0.18} depthWrite={false} toneMapped={false} />
        </mesh>
        <group ref={stars}>
          {[0, 1, 2].map((i) => {
            const angle = phase + (i / 3) * Math.PI * 2;
            return (
              <mesh key={i} position={[Math.cos(angle) * 0.1, Math.sin(angle) * 0.1, 0.02]}>
                <icosahedronGeometry args={[0.022, 0]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} roughness={0.3} toneMapped={false} flatShading />
              </mesh>
            );
          })}
        </group>
      </group>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.34, 0.06, 0.12]} />
        <meshStandardMaterial color="#8f8798" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

// ── 산 (낮은 봉우리, variant 1 = 설산) ───────────────────────
function Mountain({ variant = 0, blob }: { variant?: number; blob: boolean }) {
  const snow = variant === 1;
  return (
    <group>
      {blob && <ShadowBlob radius={0.6} />}
      <mesh position={[0, 0.32, 0]}>
        <coneGeometry args={[0.52, 0.66, 7]} />
        <meshStandardMaterial color="#8d9a8e" flatShading roughness={0.96} />
      </mesh>
      <mesh position={[0.28, 0.18, -0.1]} rotation={[0, 0.6, 0.06]}>
        <coneGeometry args={[0.3, 0.44, 6]} />
        <meshStandardMaterial color="#7e8b82" flatShading roughness={0.96} />
      </mesh>
      <mesh position={[-0.24, 0.14, 0.09]} rotation={[0, 0.3, -0.05]}>
        <coneGeometry args={[0.24, 0.36, 6]} />
        <meshStandardMaterial color="#97a39a" flatShading roughness={0.96} />
      </mesh>
      {snow && (
        <mesh position={[0, 0.52, 0]}>
          <coneGeometry args={[0.21, 0.24, 7]} />
          <meshStandardMaterial color="#eef4f6" flatShading roughness={0.7} />
        </mesh>
      )}
    </group>
  );
}

// ── 바다/호수 (표면 곡률을 따라가는 구면 캡 + 은은한 반짝임) ──
// 평면 디스크는 큰 바다에서 가장자리가 행성 표면 위로 떠 보인다 →
// 행성과 같은 중심의 구면 캡으로 만들어 어느 크기든 표면을 감싸게 한다.
function makeWaterCap(arc: number, rings = 8, segments = 40): BufferGeometry {
  const R = worldConfig.planetRadius + 0.02; // 표면 살짝 위
  const base = worldConfig.planetRadius;
  const positions: number[] = [];
  const indices: number[] = [];
  for (let r = 0; r <= rings; r++) {
    const a = (r / rings) * arc;
    const y = R * Math.cos(a) - base; // 로컬 +Y = 법선, 정점은 표면을 따라 내려간다
    const ringR = R * Math.sin(a);
    for (let s = 0; s <= segments; s++) {
      const b = (s / segments) * Math.PI * 2;
      positions.push(ringR * Math.cos(b), y, ringR * Math.sin(b));
    }
  }
  const row = segments + 1;
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const a0 = r * row + s;
      const b0 = (r + 1) * row + s;
      indices.push(a0, b0, a0 + 1, a0 + 1, b0, b0 + 1);
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function Water({ phase, size = 1 }: { phase: number; size?: number }) {
  const mat = useRef<MeshStandardMaterial>(null);
  // size(=decoration.scale)로 바다의 호(arc) 반경을 키운다. 그룹 scale 은 water 에서 1 로 고정(캡 왜곡 방지).
  const geo = useMemo(() => makeWaterCap(MathUtils.clamp(0.4 * size, 0.18, 1.0)), [size]);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame((state) => {
    if (reduce()) return;
    const m = mat.current;
    if (!m) return;
    m.emissiveIntensity = 0.12 + Math.sin(state.clock.elapsedTime * 0.8 + phase) * 0.05;
  });
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial
        ref={mat}
        color="#86cdd8"
        emissive="#86cdd8"
        emissiveIntensity={0.12}
        roughness={0.2}
        transparent
        opacity={0.88}
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  );
}

// ── 강/시내 (표면에 드레이프된 굽이치는 반투명 리본) ─────────
function River({ phase }: { phase: number }) {
  const mat = useRef<MeshStandardMaterial>(null);
  const geo = useMemo(() => {
    const R = worldConfig.planetRadius + 0.015;
    const base = worldConfig.planetRadius;
    // 로컬 평면의 (x,z) 제어점을 행성 구면에 얹어(y 계산) 강이 표면을 따라 흐르게 한다.
    const drape = (x: number, z: number) => {
      const rho = Math.hypot(x, z);
      const y = Math.sqrt(Math.max(0, R * R - rho * rho)) - base;
      return new Vector3(x, y, z);
    };
    const curve = new CatmullRomCurve3([
      drape(-0.95, -0.45),
      drape(-0.4, -0.12),
      drape(0.05, 0.2),
      drape(0.5, -0.06),
      drape(0.98, 0.42),
    ]);
    return new TubeGeometry(curve, 60, 0.07, 8, false);
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame((state) => {
    if (reduce()) return;
    const m = mat.current;
    if (!m) return;
    m.emissiveIntensity = 0.1 + Math.sin(state.clock.elapsedTime * 1.1 + phase) * 0.05;
  });
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial
        ref={mat}
        color="#86cdd8"
        emissive="#86cdd8"
        emissiveIntensity={0.12}
        roughness={0.2}
        transparent
        opacity={0.9}
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  );
}

// ── 들풀 무더기 (InstancedMesh — 한 항목이 여러 포기, 정적이라 reduce-motion 안전) ──
function GrassPatch({ variant = 0, blob, seed }: { variant?: number; blob: boolean; seed: number }) {
  const ref = useRef<InstancedMesh>(null);
  const count = blob ? 16 : 28;
  const base = GRASS_COLOR[variant % GRASS_COLOR.length];
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const rand = mulberry32(seed + 1);
    const dummy = new Object3D();
    const col = new Color();
    for (let i = 0; i < count; i++) {
      const ang = rand() * Math.PI * 2;
      const rad = Math.sqrt(rand()) * (0.42 + variant * 0.02);
      const h = 0.07 + rand() * 0.1;
      dummy.position.set(Math.cos(ang) * rad, h / 2, Math.sin(ang) * rad);
      dummy.rotation.set((rand() - 0.5) * 0.2, rand() * Math.PI, (rand() - 0.5) * 0.35);
      dummy.scale.set(0.7 + rand() * 0.6, h / 0.12, 0.7 + rand() * 0.6);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      col.set(base).offsetHSL(0, 0, (rand() - 0.5) * 0.12);
      mesh.setColorAt(i, col);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    // 인스턴스 행렬을 반영한 경계구 재계산 — 기본 컬링은 인스턴스를 고려하지 않아
    // 패치 중심이 화면 밖이면 보이는 풀까지 잘못 컬링된다.
    mesh.computeBoundingSphere();
  }, [count, seed, base, variant]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <coneGeometry args={[0.02, 0.12, 4]} />
      <meshStandardMaterial flatShading roughness={0.9} />
    </instancedMesh>
  );
}

// ── 갈대 (물가의 가는 줄기, 바람에 흔들림) ───────────────────
function Reed({ phase, variant = 0 }: { phase: number; variant?: number }) {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (reduce()) return;
    const g = group.current;
    if (!g) return;
    g.rotation.z = Math.sin(state.clock.elapsedTime * 1.4 + phase) * 0.12;
  });
  const stem = REED_STEM[variant % REED_STEM.length];
  const tuft = variant % 2 === 0 ? "#7d9a5f" : "#b8a85c";
  const blades = useMemo(
    () => [
      { x: 0, z: 0, h: 0.34, t: 0 },
      { x: 0.05, z: 0.04, h: 0.27, t: 0.5 },
      { x: -0.05, z: 0.03, h: 0.3, t: 1.0 },
      { x: 0.02, z: -0.05, h: 0.24, t: 1.6 },
    ],
    [],
  );
  return (
    <group ref={group}>
      {blades.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]} rotation={[0, 0, Math.sin(b.t) * 0.12]}>
          <mesh position={[0, b.h / 2, 0]}>
            <cylinderGeometry args={[0.006, 0.012, b.h, 5]} />
            <meshStandardMaterial color={stem} roughness={0.85} flatShading />
          </mesh>
          <mesh position={[0, b.h, 0]}>
            <coneGeometry args={[0.022, 0.07, 6]} />
            <meshStandardMaterial color={tuft} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function renderKind(
  decoration: Decoration,
  index: number,
  blob: boolean,
  proxPosition: Vector3,
  transform: PlayerTransform,
) {
  const phase = index * 1.3;
  switch (decoration.kind) {
    case "tree":
      return <Tree phase={phase} blob={blob} />;
    case "baobab":
      return <Baobab phase={phase} blob={blob} />;
    case "rock":
      return <Rock blob={blob} />;
    case "house":
      return <House blob={blob} />;
    case "flower":
      return <Flower variant={decoration.variant} phase={phase} />;
    case "mushroom":
      return <Mushroom variant={decoration.variant} phase={phase} />;
    case "rose":
      return <Rose proxPosition={proxPosition} transform={transform} blob={blob} />;
    case "volcano":
      return <Volcano proxPosition={proxPosition} transform={transform} blob={blob} active={(decoration.variant ?? 0) === 1} />;
    case "lamp":
      return <Lamp proxPosition={proxPosition} transform={transform} blob={blob} />;
    case "star":
      return <Star proxPosition={proxPosition} transform={transform} variant={decoration.variant} />;
    case "fox":
      return <FoxCompanion proxPosition={proxPosition} transform={transform} blob={blob} />;
    case "crystal":
      return <Crystal variant={decoration.variant} phase={phase} blob={blob} />;
    case "telescope":
      return <Telescope variant={decoration.variant} blob={blob} />;
    case "postbox":
      return <Postbox variant={decoration.variant} blob={blob} />;
    case "bench":
      return <Bench variant={decoration.variant} blob={blob} />;
    case "windmill":
      return <Windmill variant={decoration.variant} phase={phase} blob={blob} />;
    case "cactus":
      return <Cactus variant={decoration.variant} phase={phase} blob={blob} />;
    case "arch":
      return <Arch blob={blob} />;
    case "pond":
      return <Pond />;
    case "satellite":
      return <Satellite variant={decoration.variant} phase={phase} />;
    case "shell":
      return <Shell variant={decoration.variant} blob={blob} />;
    case "lantern":
      return <Lantern proxPosition={proxPosition} transform={transform} blob={blob} variant={decoration.variant} />;
    case "cloud":
      return <Cloud phase={phase} />;
    case "paperBoat":
      return <PaperBoat variant={decoration.variant} phase={phase} />;
    case "ringStone":
      return <RingStone variant={decoration.variant} blob={blob} />;
    case "tinyFlag":
      return <TinyFlag variant={decoration.variant} phase={phase} blob={blob} />;
    case "comet":
      return <Comet variant={decoration.variant} phase={phase} />;
    case "musicBox":
      return <MusicBox variant={decoration.variant} phase={phase} proxPosition={proxPosition} transform={transform} blob={blob} />;
    case "letterSpiral":
      return <LetterSpiral variant={decoration.variant} phase={phase} proxPosition={proxPosition} transform={transform} blob={blob} />;
    case "bubbleSpring":
      return <BubbleSpring variant={decoration.variant} phase={phase} proxPosition={proxPosition} transform={transform} blob={blob} />;
    case "moonGate":
      return <MoonGate variant={decoration.variant} phase={phase} proxPosition={proxPosition} transform={transform} blob={blob} />;
    case "mountain":
      return <Mountain variant={decoration.variant} blob={blob} />;
    case "water":
      return <Water phase={phase} size={decoration.scale ?? 1} />;
    case "river":
      return <River phase={phase} />;
    case "grass":
      return (
        <GrassPatch
          variant={decoration.variant}
          blob={blob}
          seed={Math.round((decoration.theta * 131 + decoration.phi * 197) * 1000) + index}
        />
      );
    case "reed":
      return <Reed phase={phase} variant={decoration.variant} />;
  }
}

function DecorationItem({
  decoration,
  index,
  blob,
  transform,
}: {
  decoration: Decoration;
  index: number;
  blob: boolean;
  transform: PlayerTransform;
}) {
  const { position, quaternion, proxPosition } = useMemo(() => {
    const surface = sphericalToWorld(decoration.theta, decoration.phi, worldConfig.planetRadius);
    const radius = worldConfig.planetRadius + (decoration.radiusOffset ?? 0);
    const pos = sphericalToWorld(decoration.theta, decoration.phi, radius);
    const up = surface.clone().normalize();
    // 로컬 +Y 를 표면 법선에 정렬 — 오브젝트가 표면에서 바깥쪽으로 선다.
    const quat = new Quaternion().setFromUnitVectors(LOCAL_UP, up);
    return { position: pos, quaternion: quat, proxPosition: surface };
  }, [decoration]);

  // water 는 자체적으로 행성 곡률을 따르는 캡 지오메트리를 만들므로 그룹 scale 로 키우면
  // 캡이 구에서 떨어진다 → water 만 scale 1 고정(크기는 Water 의 size prop 으로 처리).
  const groupScale = decoration.kind === "water" ? 1 : decoration.scale ?? 1;

  return (
    <group position={position} quaternion={quaternion} scale={groupScale}>
      {renderKind(decoration, index, blob, proxPosition, transform)}
    </group>
  );
}

/**
 * 행성 표면 장식 — 나무/꽃/버섯은 바람에 흔들리고, 장미·화산·가로등·별·여우는
 * 플레이어 근접/클릭에 반응한다(ref 기반, 프레임마다 React state 갱신 없음).
 * 가짜 그림자(blob)는 모바일에서만(데스크톱은 실시간 그림자가 처리).
 */
export default function Decorations({ transform }: { transform: PlayerTransform }) {
  const isTouch = useSettingsStore((s) => s.isTouch);
  const activePlanetId = useGameStore((s) => s.activePlanetId);
  const visibleDecorations = useMemo(
    () =>
      decorations.filter(
        (decoration) =>
          (decoration.planetId ?? HOME_PLANET_ID) === activePlanetId &&
          !(isTouch && decoration.mobileHidden),
      ),
    [activePlanetId, isTouch],
  );

  return (
    <>
      {visibleDecorations.map((decoration, i) => (
        <DecorationItem
          key={`${activePlanetId}-${decoration.kind}-${i}`}
          decoration={decoration}
          index={i}
          blob={isTouch}
          transform={transform}
        />
      ))}
    </>
  );
}
