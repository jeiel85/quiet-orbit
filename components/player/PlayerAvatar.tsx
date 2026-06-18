import { Suspense, type RefObject } from "react";
import { type AvatarAnimState } from "@/lib/player/avatarAnim";
import ModelErrorBoundary from "./ModelErrorBoundary";
import PrimitiveFox from "./PrimitiveFox";
import FoxModel from "./FoxModel";

/**
 * 플레이어 아바타 — GLB 여우를 우선 시도하고, 로딩 중/실패 시 primitive 여우로 폴백.
 * 둘 다 공유 anim 상태를 읽어 같은 컨트롤러(Player)에 반응한다.
 */
export default function PlayerAvatar({ anim }: { anim: RefObject<AvatarAnimState> }) {
  const fallback = <PrimitiveFox anim={anim} />;
  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <FoxModel anim={anim} />
      </Suspense>
    </ModelErrorBoundary>
  );
}
