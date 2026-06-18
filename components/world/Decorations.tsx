import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { type Group, MathUtils, type MeshStandardMaterial, Quaternion, Vector3 } from "three";
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

  return (
    <group position={position} quaternion={quaternion} scale={decoration.scale ?? 1}>
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
    () => decorations.filter((decoration) => (decoration.planetId ?? HOME_PLANET_ID) === activePlanetId),
    [activePlanetId],
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
