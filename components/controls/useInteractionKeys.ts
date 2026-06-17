import { useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";

/**
 * 메시지 상호작용 키 입력.
 * - Space / Enter: 근처(active) 메시지가 있고 패널이 닫혀 있으면 연다.
 * - Escape: 열려 있는 패널을 닫는다.
 * store 는 getState() 로 비반응형으로 읽어 re-render 를 만들지 않는다.
 */
export function useInteractionKeys(): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        const { activeMessageId, openedMessageId, openMessage } = useGameStore.getState();
        if (openedMessageId === null && activeMessageId) {
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
