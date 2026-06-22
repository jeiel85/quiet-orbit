import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { LoopRepeat, type AnimationAction, type AnimationClip, type Group, type Mesh, type Object3D } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { worldConfig } from "@/config/worldConfig";
import { type AvatarAnimState, damp } from "@/lib/player/avatarAnim";

const MODEL_URL = "/models/player-kenney-mini-male-a-v001.glb";
const MODEL_SCALE = 0.95;
const IDLE_ACTION = "idle";
const WALK_ACTION = "walk";
const STATIC_ACTION = "static";

type MiniCharacterGltf = {
  scene: Group;
  animations: AnimationClip[];
};

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
 */
export default function PrimitivePrince({ anim }: { anim: RefObject<AvatarAnimState> }) {
  const rigRef = useRef<Group>(null);
  const modelRef = useRef<Group>(null);
  const currentAction = useRef<string | null>(null);
  const gltf = useGLTF(MODEL_URL) as MiniCharacterGltf;
  const model = useMemo(() => clone(gltf.scene) as Group, [gltf.scene]);
  const { actions } = useAnimations(gltf.animations, model);

  useEffect(() => {
    setupModel(model);
  }, [model]);

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
