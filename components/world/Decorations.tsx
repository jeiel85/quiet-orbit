import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";
import { decorations, type Decoration, type DecorationKind } from "@/config/decorations";
import { worldConfig } from "@/config/worldConfig";
import { sphericalToWorld } from "@/lib/math/sphericalCoords";

const LOCAL_UP = new Vector3(0, 1, 0);

function Tree() {
  return (
    <group>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 0.18, 6]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <coneGeometry args={[0.16, 0.34, 7]} />
        <meshStandardMaterial color="#8cbf86" flatShading roughness={0.85} />
      </mesh>
    </group>
  );
}

function Rock() {
  return (
    <mesh position={[0, 0.07, 0]}>
      <icosahedronGeometry args={[0.13, 0]} />
      <meshStandardMaterial color="#9aa7a8" flatShading roughness={0.95} />
    </mesh>
  );
}

function House() {
  return (
    <group>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.24, 0.2, 0.24]} />
        <meshStandardMaterial color="#e8d9c0" roughness={0.8} />
      </mesh>
      {/* 사각뿔 지붕 (cone 4분할 + 45° 회전) */}
      <mesh position={[0, 0.28, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.2, 0.16, 4]} />
        <meshStandardMaterial color="#cf8a6b" flatShading roughness={0.8} />
      </mesh>
    </group>
  );
}

function renderKind(kind: DecorationKind) {
  switch (kind) {
    case "tree":
      return <Tree />;
    case "rock":
      return <Rock />;
    case "house":
      return <House />;
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
      {renderKind(decoration.kind)}
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
