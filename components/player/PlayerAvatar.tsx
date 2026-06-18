import { type RefObject } from "react";
import { type AvatarAnimState } from "@/lib/player/avatarAnim";
import PrimitivePrince from "./PrimitivePrince";

/**
 * 플레이어 아바타 — 행성을 거니는 어린왕자(primitive).
 * 공유 anim 상태(Player 컨트롤러가 매 프레임 갱신)를 읽어 걷기/기울임/스카프를 구동한다.
 *
 * 참고: 여우는 어린왕자의 컴패니언으로 행성 위(config/decorations.ts 의 "fox")에 머문다.
 */
export default function PlayerAvatar({ anim }: { anim: RefObject<AvatarAnimState> }) {
  return <PrimitivePrince anim={anim} />;
}
