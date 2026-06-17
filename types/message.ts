/** 메시지의 정서적 톤 — Orb 색상 등 시각 표현에 사용. */
export type MessageTone = "warm" | "quiet" | "hope" | "memory";

/** 행성 위에 놓이는 빛나는 메시지 하나. 위치는 구면 좌표(theta/phi)로 관리한다. */
export interface Message {
  id: string;
  title: string;
  body: string;
  position: {
    theta: number;
    phi: number;
    /** 행성 표면 기준 추가 높이. 생략 시 worldConfig.orb.heightOffset 사용. */
    radiusOffset?: number;
  };
  tone?: MessageTone;
}

/**
 * 읽음 진행 상태 — localStorage 에 저장되는 형태.
 * 나중에 서버(DB) 연동 시 migration 이 쉽도록 타입을 유지한다.
 */
export interface MessageProgress {
  readMessageIds: string[];
  lastReadAtById: Record<string, string>;
}
