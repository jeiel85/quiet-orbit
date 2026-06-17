import { create } from "zustand";
import { useMessageStore } from "@/store/useMessageStore";

interface GameStore {
  /** 플레이어가 상호작용 범위 안에 있는 가장 가까운 메시지 (없으면 null). */
  activeMessageId: string | null;
  /** 현재 열려 있는 메시지 패널의 메시지 (없으면 null). */
  openedMessageId: string | null;

  setActiveMessageId: (id: string | null) => void;
  /** 메시지 패널을 연다 — 여는 즉시 읽음으로 표시한다. */
  openMessage: (id: string) => void;
  closeMessage: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  activeMessageId: null,
  openedMessageId: null,

  setActiveMessageId: (id) => set({ activeMessageId: id }),

  openMessage: (id) => {
    useMessageStore.getState().markAsRead(id);
    set({ openedMessageId: id });
  },

  closeMessage: () => set({ openedMessageId: null }),
}));
