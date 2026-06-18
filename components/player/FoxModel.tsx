import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { Box3, type Group, type Mesh, Vector3 } from "three";
import { worldConfig } from "@/config/worldConfig";
import { type AvatarAnimState } from "@/lib/player/avatarAnim";

const MODEL_URL = "/models/Fox.glb";

// 캐릭터 목표 높이(월드 단위) — 로드 후 바운딩박스로 자동 스케일.
const TARGET_HEIGHT = 0.5;
// 정면 보정: 모델이 +Z 를 안 보면 Math.PI 로 뒤집는다(라이브 확인 후 조정).
const FACE_Y = 0;

// 걷기/대기 클립 후보 (Khronos Fox: Survey / Walk / Run).
const WALK_CLIPS = ["Walk", "walk", "Run"];
const IDLE_CLIPS = ["Survey", "Idle", "idle"];

const pick = (names: Record<string, unknown>, candidates: string[]): string | null => {
  for (const c of candidates) if (names[c]) return c;
  return null;
};

/**
 * GLB 캐릭터(여우). 로드 후:
 * - 바운딩박스로 키를 TARGET_HEIGHT 에 맞추고 발을 표면(-playerHeight)에 안착(스케일 추측 제거).
 * - 모든 mesh 에 cast/receive shadow (씬 마운트 후 로드되므로 여기서 직접 설정).
 * - 공유 anim.moving 에 따라 Walk/Idle 클립을 크로스페이드.
 * useGLTF 는 로딩 중 suspend → PlayerAvatar 의 Suspense 가 primitive 폴백을 보여준다.
 */
export default function FoxModel({ anim }: { anim: RefObject<AvatarAnimState> }) {
  const groupRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions } = useAnimations(animations, groupRef);
  const currentClip = useRef<string | null>(null);

  // 자동 스케일 + 발 안착 + 그림자.
  const fit = useMemo(() => {
    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    const box = new Box3().setFromObject(scene);
    const size = new Vector3();
    box.getSize(size);
    const scale = size.y > 0 ? TARGET_HEIGHT / size.y : 0.004;
    const footY = box.min.y * scale; // 보통 음수(발이 원점 아래)
    return { scale, yOffset: -worldConfig.playerHeight - footY };
  }, [scene]);

  // 초기 클립 재생(대기).
  useEffect(() => {
    const idle = pick(actions, IDLE_CLIPS) ?? Object.keys(actions)[0] ?? null;
    if (idle && actions[idle]) {
      actions[idle].reset().fadeIn(0.3).play();
      currentClip.current = idle;
    }
    return () => {
      Object.values(actions).forEach((a) => a?.stop());
    };
  }, [actions]);

  // 이동 상태에 따라 Walk/Idle 전환.
  useFrame(() => {
    const want = anim.current.moving
      ? (pick(actions, WALK_CLIPS) ?? currentClip.current)
      : (pick(actions, IDLE_CLIPS) ?? currentClip.current);
    if (want && want !== currentClip.current) {
      const next = actions[want];
      const prev = currentClip.current ? actions[currentClip.current] : null;
      if (next) {
        next.reset().fadeIn(0.25).play();
        prev?.fadeOut(0.25);
        currentClip.current = want;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, fit.yOffset, 0]} rotation={[0, FACE_Y, 0]} scale={fit.scale}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
