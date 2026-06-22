import { type RefObject } from "react";
import { type AvatarAnimState } from "@/lib/player/avatarAnim";
import PrimitivePrince from "./PrimitivePrince";

/**
 * 플레이어 아바타 — 행성을 거니는 소년 여행자(GLB).
 * 공유 anim 상태(Player 컨트롤러가 매 프레임 갱신)를 읽어 모델의 idle/walk 클립을 전환한다.
 */
export default function PlayerAvatar({ anim }: { anim: RefObject<AvatarAnimState> }) {
  return <PrimitivePrince anim={anim} />;
}
