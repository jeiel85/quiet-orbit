import { create } from "zustand";
import { useMessageStore } from "@/store/useMessageStore";
import { soundManager } from "@/lib/audio/soundManager";
import { HOME_PLANET_ID } from "@/config/planets";
import { worldConfig } from "@/config/worldConfig";
import type { PlanetId, TravelSpot, TravelState } from "@/types/world";

interface GameStore {
  /** 인트로를 지나 산책을 시작했는지. false 면 이동 비활성화. */
  started: boolean;
  /** 현재 산책 중인 행성. */
  activePlanetId: PlanetId;
  /** 플레이어가 상호작용 범위 안에 있는 가장 가까운 메시지 (없으면 null). */
  activeMessageId: string | null;
  /** 플레이어가 이동 가능 범위 안에 있는 가장 가까운 여행 스팟 (없으면 null). */
  activeTravelSpotId: string | null;
  /** 현재 열려 있는 메시지 패널의 메시지 (없으면 null). */
  openedMessageId: string | null;
  /** 행성 간 이동 모션 중이면 세부 상태, 아니면 null. */
  travel: TravelState | null;

  start: () => void;
  setActiveMessageId: (id: string | null) => void;
  setActiveTravelSpotId: (id: string | null) => void;
  /** 메시지 패널을 연다 — 여는 즉시 읽음으로 표시한다. */
  openMessage: (id: string) => void;
  closeMessage: () => void;
  beginTravel: (spot: TravelSpot) => void;
  finishTravel: (planetId: PlanetId) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  started: false,
  activePlanetId: HOME_PLANET_ID,
  activeMessageId: null,
  activeTravelSpotId: null,
  openedMessageId: null,
  travel: null,

  start: () => set({ started: true }),

  setActiveMessageId: (id) => set({ activeMessageId: id }),
  setActiveTravelSpotId: (id) => set({ activeTravelSpotId: id }),

  openMessage: (id) => {
    useMessageStore.getState().markAsRead(id);
    soundManager.play("chime"); // 사운드 활성화 시에만 동작(현재 스텁).
    set({ openedMessageId: id, activeTravelSpotId: null });
  },

  closeMessage: () => set({ openedMessageId: null }),

  beginTravel: (spot) => {
    soundManager.play("chime");
    set({
      activeMessageId: null,
      activeTravelSpotId: null,
      openedMessageId: null,
      travel: {
        spotId: spot.id,
        fromPlanetId: spot.planetId,
        toPlanetId: spot.targetPlanetId,
        targetPoint: spot.targetPoint,
        label: spot.label,
        startedAt: performance.now(),
        durationMs: worldConfig.travel.durationMs,
      },
    });
  },

  finishTravel: (planetId) =>
    set({
      activePlanetId: planetId,
      activeMessageId: null,
      activeTravelSpotId: null,
      openedMessageId: null,
      travel: null,
    }),
}));
