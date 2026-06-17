import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import { decorations, type Decoration } from "@/config/decorations";
import { worldConfig } from "@/config/worldConfig";
import { sphericalToWorld } from "@/lib/math/sphericalCoords";
import ShadowBlob from "./ShadowBlob";

const LOCAL_UP = new Vector3(0, 1, 0);

const FLOWER_PETAL = ["#f4a6c0", "#fdfbf6", "#c9b8ee"]; // variant 별 꽃잎 색

function Tree() {
  return (
    <group>
      <ShadowBlob radius={0.32} />
      {/* 줄기 */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.04, 0.055, 0.2, 6]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.9} />
      </mesh>
      {/* 층층 잎 (아래→위로 작아짐) */}
      <mesh position={[0, 0.33, 0]}>
        <coneGeometry args={[0.19, 0.26, 8]} />
        <meshStandardMaterial color="#7bb47e" flatShading roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <coneGeometry args={[0.15, 0.22, 8]} />
        <meshStandardMaterial color="#8cc089" flatShading roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <coneGeometry args={[0.11, 0.18, 8]} />
        <meshStandardMaterial color="#9bcf95" flatShading roughness={0.85} />
      </mesh>
    </group>
  );
}

function Rock() {
  return (
    <group>
      <ShadowBlob radius={0.26} />
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

function House() {
  return (
    <group>
      <ShadowBlob radius={0.34} />
      {/* 본체 */}
      <mesh position={[0, 0.11, 0]}>
        <boxGeometry args={[0.26, 0.22, 0.26]} />
        <meshStandardMaterial color="#ece0c8" roughness={0.85} />
      </mesh>
      {/* 사각뿔 지붕 */}
      <mesh position={[0, 0.31, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.22, 0.18, 4]} />
        <meshStandardMaterial color="#cf8a6b" flatShading roughness={0.8} />
      </mesh>
      {/* 문 (정면 +Z) */}
      <mesh position={[0, 0.06, 0.131]}>
        <boxGeometry args={[0.08, 0.12, 0.01]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.8} />
      </mesh>
      {/* 창문 */}
      <mesh position={[0.082, 0.14, 0.131]}>
        <boxGeometry args={[0.06, 0.06, 0.01]} />
        <meshStandardMaterial color="#bfe2ea" roughness={0.4} emissive="#bfe2ea" emissiveIntensity={0.2} />
      </mesh>
      {/* 굴뚝 */}
      <mesh position={[0.08, 0.36, -0.02]}>
        <boxGeometry args={[0.05, 0.13, 0.05]} />
        <meshStandardMaterial color="#c0856a" roughness={0.85} />
      </mesh>
    </group>
  );
}

function Flower({ variant = 0 }: { variant?: number }) {
  const petal = FLOWER_PETAL[variant % FLOWER_PETAL.length];
  const petals = useMemo(
    () => [0, 1, 2, 3, 4].map((i) => (i / 5) * Math.PI * 2),
    [],
  );
  return (
    <group>
      {/* 줄기 */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.12, 6]} />
        <meshStandardMaterial color="#6fae78" roughness={0.8} />
      </mesh>
      {/* 꽃잎 */}
      {petals.map((angle, i) => (
        <mesh
          key={i}
          position={[Math.cos(angle) * 0.045, 0.14, Math.sin(angle) * 0.045]}
        >
          <sphereGeometry args={[0.03, 10, 8]} />
          <meshStandardMaterial color={petal} roughness={0.6} />
        </mesh>
      ))}
      {/* 가운데 */}
      <mesh position={[0, 0.14, 0]}>
        <sphereGeometry args={[0.028, 10, 8]} />
        <meshStandardMaterial color="#f7c76b" roughness={0.5} />
      </mesh>
    </group>
  );
}

function renderKind(decoration: Decoration) {
  switch (decoration.kind) {
    case "tree":
      return <Tree />;
    case "rock":
      return <Rock />;
    case "house":
      return <House />;
    case "flower":
      return <Flower variant={decoration.variant} />;
  }
}

function DecorationItem({ decoration }: { decoration: Decoration }) {
  const { position, quaternion } = useMemo(() => {
    const pos = sphericalToWorld(decoration.theta, decoration.phi, worldConfig.planetRadius);
    const up = pos.clone().normalize();
    // 로컬 +Y 를 표면 법선에 정렬 — 오브젝트가 표면에서 바깥쪽으로 선다.
    const quat = new Quaternion().setFromUnitVectors(LOCAL_UP, up);
    return { position: pos, quaternion: quat };
  }, [decoration]);

  return (
    <group position={position} quaternion={quaternion} scale={decoration.scale ?? 1}>
      {renderKind(decoration)}
    </group>
  );
}

/** 행성 표면 장식 — 정적(useFrame 없음), draw call 을 낮게 유지. */
export default function Decorations() {
  return (
    <>
      {decorations.map((decoration, i) => (
        <DecorationItem key={`${decoration.kind}-${i}`} decoration={decoration} />
      ))}
    </>
  );
}
