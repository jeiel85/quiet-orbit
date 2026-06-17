import { create } from "zustand";
import { useMessageStore } from "@/store/useMessageStore";
import { soundManager } from "@/lib/audio/soundManager";

interface GameStore {
  /** 인트로를 지나 산책을 시작했는지. false 면 이동 비활성화. */
  started: boolean;
  /** 플레이어가 상호작용 범위 안에 있는 가장 가까운 메시지 (없으면 null). */
  activeMessageId: string | null;
  /** 현재 열려 있는 메시지 패널의 메시지 (없으면 null). */
  openedMessageId: string | null;

  start: () => void;
  setActiveMessageId: (id: string | null) => void;
  /** 메시지 패널을 연다 — 여는 즉시 읽음으로 표시한다. */
  openMessage: (id: string) => void;
  closeMessage: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  started: false,
  activeMessageId: null,
  openedMessageId: null,

  start: () => set({ started: true }),

  setActiveMessageId: (id) => set({ activeMessageId: id }),

  openMessage: (id) => {
    useMessageStore.getState().markAsRead(id);
    soundManager.play("chime"); // 사운드 활성화 시에만 동작(현재 스텁).
    set({ openedMessageId: id });
  },

  closeMessage: () => set({ openedMessageId: null }),
}));
