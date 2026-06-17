import { create } from "zustand";
import { loadProgress, saveProgress } from "@/lib/storage/localProgress";

// 모듈 로드 시 localStorage 에서 초기화한다.
// 이 store 는 ssr:false 인 Experience 서브트리에서만 import 되므로 클라이언트에서만 평가된다.
// (loadProgress 내부에 window 가드가 있어 비브라우저에서도 안전)
const initial = loadProgress();

interface MessageStore {
  readMessageIds: string[];
  lastReadAtById: Record<string, string>;
  /** 메시지를 읽음으로 표시하고 localStorage 에 영속화한다. 이미 읽은 경우 무시. */
  markAsRead: (id: string) => void;
  isRead: (id: string) => boolean;
  /** 모든 읽음 기록 초기화. */
  resetProgress: () => void;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  readMessageIds: initial.readMessageIds,
  lastReadAtById: initial.lastReadAtById,

  markAsRead: (id) => {
    const { readMessageIds, lastReadAtById } = get();
    if (readMessageIds.includes(id)) return;
    const next = {
      readMessageIds: [...readMessageIds, id],
      lastReadAtById: { ...lastReadAtById, [id]: new Date().toISOString() },
    };
    set(next);
    saveProgress(next);
  },

  isRead: (id) => get().readMessageIds.includes(id),

  resetProgress: () => {
    const empty = { readMessageIds: [], lastReadAtById: {} };
    set(empty);
    saveProgress(empty);
  },
}));
