import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";

/**
 * 후처리 — 데스크톱 전용으로만 렌더한다(Scene 에서 게이팅).
 * - Bloom: 밝은(emissive, toneMapped=false) 메시지 Orb·반짝임만 은은히 빛나게.
 *   luminanceThreshold 를 높게 둬서 밝은 하늘 배경이 통째로 번지지 않게 한다.
 * - Vignette: 가장자리를 살짝 눌러 시선을 가운데로.
 */
export default function PostFX() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.25}
        mipmapBlur
        radius={0.7}
      />
      <Vignette offset={0.25} darkness={0.45} eskil={false} />
    </EffectComposer>
  );
}
