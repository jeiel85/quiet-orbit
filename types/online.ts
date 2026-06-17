// 온라인 확장(v0.2+)을 위한 타입 정의.
// MVP 에서는 어떤 서버 연동도 하지 않는다 — 이 타입들은 나중에 Supabase/PartyKit 을
// 붙일 때의 "계약(seam)" 역할만 한다. 설계: docs/design/10_multiplayer_future.md
//                                       docs/design/07_data_model_and_state.md

import type { Message } from "./message";

/** 확장 로드맵 단계 (standalone → ... → realtime). */
export type OnlineStage = "standalone" | "guestbook" | "traces" | "presence" | "realtime";

/**
 * 방명록 메시지 (v0.2) — Supabase `guest_messages` 테이블 대응.
 * 승인된 항목을 화면의 Message 로 변환해 Orb 로 표시할 수 있다.
 */
export interface GuestMessage {
  id: string;
  body: string;
  displayName?: string;
  /** 행성 표면 위치(구면 좌표). */
  theta: number;
  phi: number;
  createdAt: string; // ISO 8601
  status: "pending" | "approved" | "hidden";
}

/**
 * 방문자 흔적 (v0.3) — `visitor_traces` 테이블 대응.
 * 다른 방문자가 지나간 짧은 경로를 빛 조각으로 비실시간 표시.
 */
export interface VisitorTrace {
  id: string;
  visitorId: string;
  path: Array<{ theta: number; phi: number }>;
  createdAt: string;
  expiresAt: string;
}

/** Presence (v0.4) — 현재 접속자의 대략 위치. */
export interface PlayerPresence {
  visitorId: string;
  theta: number;
  phi: number;
  updatedAt: string;
}

/** Presence 스냅샷 — "지금 N명이 머무르고 있어요" 표시에 사용. */
export interface PresenceSnapshot {
  count: number;
  players: PlayerPresence[];
}

/**
 * 승인된 GuestMessage 를 화면 표시용 Message 로 변환하는 어댑터 시그니처.
 * 실제 구현은 후속 — 내장 메시지(config/messages.ts)와 합쳐 하나의 목록으로 렌더한다.
 */
export type GuestMessageToMessage = (guest: GuestMessage) => Message;
