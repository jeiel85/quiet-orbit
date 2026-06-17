export type DecorationKind = "tree" | "rock" | "house";

export interface Decoration {
  kind: DecorationKind;
  /** 표면 위치 — 구면 좌표(경도/위도). */
  theta: number;
  phi: number;
  /** 크기 배수 (기본 1). */
  scale?: number;
}

/**
 * 행성 위 장식 오브젝트 배치 (primitive geometry).
 * 메시지 Orb 위치(config/messages.ts)와 너무 겹치지 않게 흩어 둔다.
 * 북극(phi≈0, 플레이어 시작점)은 비워 둔다.
 */
export const decorations: Decoration[] = [
  { kind: "tree", theta: 0.9, phi: 1.1, scale: 1.0 },
  { kind: "tree", theta: 1.2, phi: 1.9, scale: 0.85 },
  { kind: "tree", theta: 3.1, phi: 1.5, scale: 1.1 },
  { kind: "tree", theta: 5.1, phi: 1.6, scale: 0.9 },
  { kind: "rock", theta: 2.1, phi: 0.8, scale: 1.0 },
  { kind: "rock", theta: 4.2, phi: 2.1, scale: 0.8 },
  { kind: "rock", theta: 5.9, phi: 1.1, scale: 1.2 },
  { kind: "house", theta: 2.4, phi: 1.6, scale: 1.0 },
  { kind: "house", theta: 4.4, phi: 0.9, scale: 0.95 },
];
