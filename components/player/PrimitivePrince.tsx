import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import {
  LoopRepeat,
  type AnimationAction,
  type AnimationClip,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
  type Object3D,
} from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { worldConfig } from "@/config/worldConfig";
import { type AvatarAnimState, damp } from "@/lib/player/avatarAnim";
import { buildAppearanceTexture } from "@/lib/player/recolorColormap";
import { useSettingsStore } from "@/store/useSettingsStore";

const MODEL_URL = "/models/player-kenney-mini-male-a-v001.glb";
const MODEL_SCALE = 0.95;
const IDLE_ACTION = "idle";
const WALK_ACTION = "walk";
const STATIC_ACTION = "static";

type MiniCharacterGltf = {
  scene: Group;
  animations: AnimationClip[];
};

/** 원본 colormap 이미지(외형 리컬러의 소스). 머티리얼 교체 전에 한 번 캡처해 둔다. */
interface ColormapSource {
  image: CanvasImageSource;
  width: number;
  height: number;
}

function setupModel(root: Object3D) {
  root.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
  });
}

function playAction(
  actions: Record<string, AnimationAction | null>,
  current: RefObject<string | null>,
  name: string,
  fade = 0.18,
) {
  if (current.current === name) return;
  const next = actions[name];
  if (!next) return;

  const previous = current.current ? actions[current.current] : null;
  next.reset().setLoop(LoopRepeat, Infinity).fadeIn(fade).play();
  previous?.fadeOut(fade);
  current.current = name;
}

/**
 * Kenney Mini Characters(GLB, CC0)를 사용하는 실제 사람형 플레이어.
 * 모델 자체의 rig/animation을 살리고, 행성 위 이동 입력에 맞춰 idle/walk를 부드럽게 전환한다.
 * 외형(부위별 색)은 baseColor 팔레트 텍스처만 다시 칠해 교체하므로 모션과 완전히 독립적이다.
 */
export default function PrimitivePrince({ anim }: { anim: RefObject<AvatarAnimState> }) {
  const rigRef = useRef<Group>(null);
  const modelRef = useRef<Group>(null);
  const currentAction = useRef<string | null>(null);
  const gltf = useGLTF(MODEL_URL) as MiniCharacterGltf;
  const model = useMemo(() => clone(gltf.scene) as Group, [gltf.scene]);
  const { actions } = useAnimations(gltf.animations, model);
  const appearance = useSettingsStore((s) => s.appearance);
  // 인스턴스 전용 복제 머티리얼 + 원본 colormap 소스를 ref 로 보관(가변 three 객체).
  const skinRef = useRef<{ model: Group; material: MeshStandardMaterial; colormap: ColormapSource | null } | null>(null);

  useEffect(() => {
    setupModel(model);
  }, [model]);

  // 외형이 바뀔 때마다 팔레트를 다시 칠해 baseColor 텍스처만 교체한다(스켈레톤·애니메이션 영향 없음).
  // clone(SkeletonUtils) 은 머티리얼을 공유하므로, model 단위로 전용 복제본을 한 번 만들어 GLTF 캐시 오염을 막는다.
  useEffect(() => {
    let entry = skinRef.current;
    if (!entry || entry.model !== model) {
      entry?.material.dispose();
      let shared: MeshStandardMaterial | null = null;
      model.traverse((obj) => {
        const mesh = obj as Mesh;
        if (mesh.isMesh && !shared) shared = mesh.material as MeshStandardMaterial;
      });
      const cloned = shared ? (shared as MeshStandardMaterial).clone() : null;
      let source: ColormapSource | null = null;
      const img = cloned?.map?.image as (CanvasImageSource & { width: number; height: number }) | undefined;
      if (img) source = { image: img, width: img.width, height: img.height };
      if (cloned) {
        model.traverse((obj) => {
          const mesh = obj as Mesh;
          if (mesh.isMesh) mesh.material = cloned;
        });
        entry = { model, material: cloned, colormap: source };
        skinRef.current = entry;
      } else {
        entry = null;
      }
    }
    if (!entry?.colormap) return;
    const tex = buildAppearanceTexture(entry.colormap.image, entry.colormap.width, entry.colormap.height, appearance);
    const previous = entry.material.map;
    entry.material.map = tex;
    entry.material.needsUpdate = true;
    return () => {
      tex.dispose();
      entry.material.map = previous;
    };
  }, [model, appearance]);

  // 언마운트 시 복제 머티리얼 정리.
  useEffect(
    () => () => {
      skinRef.current?.material.dispose();
      skinRef.current = null;
    },
    [],
  );

  useEffect(() => {
    playAction(actions, currentAction, IDLE_ACTION, 0.08);
    return () => {
      Object.values(actions).forEach((action) => action?.stop());
      currentAction.current = null;
    };
  }, [actions]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const a = anim.current;
    const moving = a.moving && !a.reduceMotion;
    const desiredAction = a.reduceMotion ? STATIC_ACTION : moving ? WALK_ACTION : IDLE_ACTION;
    playAction(actions, currentAction, desiredAction, moving ? 0.12 : 0.22);

    const rig = rigRef.current;
    if (rig) {
      rig.rotation.z = damp(rig.rotation.z, a.reduceMotion ? 0 : -a.turn * 0.08, 8, delta);
      rig.rotation.x = damp(rig.rotation.x, a.reduceMotion ? 0 : moving ? 0.025 : 0, 8, delta);
    }

    const modelGroup = modelRef.current;
    if (modelGroup) {
      const idleBreath = a.reduceMotion || moving ? 0 : Math.sin(a.elapsed * 1.5) * 0.006;
      modelGroup.position.y = damp(modelGroup.position.y, -worldConfig.playerHeight + idleBreath, 8, delta);
    }
  });

  return (
    <group ref={rigRef}>
      <group ref={modelRef} position={[0, -worldConfig.playerHeight, 0]} scale={MODEL_SCALE}>
        <primitive object={model} />

        <mesh position={[0.045, 0.38, 0.13]} rotation={[0, 0, 0.18]} castShadow>
          <icosahedronGeometry args={[0.024, 0]} />
          <meshStandardMaterial color="#f4ce63" emissive="#f4ce63" emissiveIntensity={0.12} roughness={0.45} />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
