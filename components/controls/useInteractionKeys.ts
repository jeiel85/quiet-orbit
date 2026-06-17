import { useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";

/**
 * 메시지 상호작용 키 입력.
 * - Space / Enter: 패널이 열려 있으면 닫고, 닫혀 있고 근처(active) 메시지가 있으면 연다(토글).
 * - Escape: 열려 있는 패널을 닫는다.
 * 실제로 열거나 닫을 때만 preventDefault — 인트로 "시작하기" 버튼의 키 활성화를 막지 않게 한다.
 * store 는 getState() 로 비반응형으로 읽어 re-render 를 만들지 않는다.
 */
export function useInteractionKeys(): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        const { activeMessageId, openedMessageId, openMessage, closeMessage } =
          useGameStore.getState();
        if (openedMessageId !== null) {
          // 패널이 열려 있으면 Space/Enter 로 닫는다.
          e.preventDefault();
          closeMessage();
        } else if (activeMessageId) {
          e.preventDefault();
          openMessage(activeMessageId);
        }
      } else if (e.key === "Escape") {
        const { openedMessageId, closeMessage } = useGameStore.getState();
        if (openedMessageId !== null) closeMessage();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
