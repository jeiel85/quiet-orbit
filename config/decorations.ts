export type DecorationKind =
  | "tree"
  | "rock"
  | "house"
  | "flower"
  | "baobab" // 큰 나무 — 어린왕자의 바오바브
  | "rose" // 유리돔 속 장미 (인터랙티브)
  | "volcano" // 작은 화산 (인터랙티브)
  | "lamp" // 가로등 (인터랙티브)
  | "star" // 표면 위 떠 있는 별 (인터랙티브)
  | "mushroom"
  | "fox"; // 어린왕자의 컴패니언 (인터랙티브)

export interface Decoration {
  kind: DecorationKind;
  /** 표면 위치 — 구면 좌표(경도/위도). */
  theta: number;
  phi: number;
  /** 크기 배수 (기본 1). */
  scale?: number;
  /** 색/형태 변주 인덱스 (꽃 색 등). */
  variant?: number;
  /** 표면 위로 띄우는 추가 높이 — 떠 있는 별 등. */
  radiusOffset?: number;
}

/**
 * 행성 위 장식 오브젝트 배치 (primitive geometry).
 * 컨셉: 어린왕자가 거니는 작은 행성 — 장미·화산·바오바브·가로등·별·여우로 꽉 채운다.
 * 메시지 Orb 위치(config/messages.ts)와 큰 오브젝트가 겹치지 않게 흩어 둔다(Orb 는 표면
 * 위로 떠 있어 작은 풀꽃·버섯은 가까이 와도 무방). 북극(phi≈0, 플레이어 시작점)은 비워 둔다.
 *
 * 인터랙티브 종류(rose/volcano/lamp/star/fox)는 플레이어가 가까이 오거나 클릭하면 반응한다
 * — components/world/Decorations.tsx 참고.
 */
export const decorations: Decoration[] = [
  // ── 랜드마크 (어린왕자 세계관) ─────────────────────────────
  { kind: "rose", theta: 1.15, phi: 1.0, scale: 1.0 },
  { kind: "fox", theta: 1.5, phi: 0.95, scale: 1.0 },

  { kind: "volcano", theta: 4.15, phi: 2.35, scale: 1.1, variant: 1 }, // 활화산
  { kind: "volcano", theta: 4.5, phi: 2.55, scale: 0.95, variant: 1 }, // 활화산
  { kind: "volcano", theta: 3.95, phi: 2.62, scale: 0.85, variant: 0 }, // 사화산

  { kind: "baobab", theta: 3.05, phi: 2.0, scale: 1.0 },
  { kind: "baobab", theta: 5.25, phi: 1.35, scale: 0.9 },
  { kind: "baobab", theta: 0.95, phi: 2.15, scale: 1.05 },

  { kind: "lamp", theta: 2.45, phi: 0.72, scale: 1.0 },
  { kind: "lamp", theta: 5.15, phi: 1.9, scale: 0.95 },

  // ── 떠 있는 별 (radiusOffset 으로 표면 위에 부유) ────────────
  { kind: "star", theta: 0.5, phi: 1.6, scale: 1.0, radiusOffset: 0.85, variant: 0 },
  { kind: "star", theta: 2.2, phi: 0.6, scale: 0.8, radiusOffset: 0.7, variant: 1 },
  { kind: "star", theta: 3.3, phi: 1.3, scale: 1.1, radiusOffset: 0.95, variant: 2 },
  { kind: "star", theta: 4.9, phi: 1.0, scale: 0.9, radiusOffset: 0.75, variant: 0 },
  { kind: "star", theta: 5.8, phi: 1.5, scale: 1.0, radiusOffset: 0.9, variant: 1 },
  { kind: "star", theta: 1.85, phi: 1.95, scale: 0.85, radiusOffset: 0.7, variant: 2 },

  // ── 집 ─────────────────────────────────────────────────────
  { kind: "house", theta: 2.4, phi: 1.6, scale: 1.0 },
  { kind: "house", theta: 4.4, phi: 0.9, scale: 0.95 },

  // ── 나무 (뾰족한 소나무류) ─────────────────────────────────
  { kind: "tree", theta: 0.9, phi: 1.1, scale: 1.0 },
  { kind: "tree", theta: 1.2, phi: 1.9, scale: 0.85 },
  { kind: "tree", theta: 3.1, phi: 1.5, scale: 1.1 },
  { kind: "tree", theta: 5.1, phi: 1.6, scale: 0.9 },
  { kind: "tree", theta: 3.9, phi: 2.4, scale: 1.0 },
  { kind: "tree", theta: 0.35, phi: 1.35, scale: 0.8 },
  { kind: "tree", theta: 2.85, phi: 2.25, scale: 0.9 },
  { kind: "tree", theta: 4.75, phi: 2.2, scale: 0.85 },
  { kind: "tree", theta: 5.7, phi: 1.25, scale: 0.95 },

  // ── 돌 ─────────────────────────────────────────────────────
  { kind: "rock", theta: 2.1, phi: 0.8, scale: 1.0 },
  { kind: "rock", theta: 4.2, phi: 2.1, scale: 0.85 },
  { kind: "rock", theta: 5.9, phi: 1.1, scale: 1.2 },
  { kind: "rock", theta: 1.75, phi: 1.55, scale: 0.7 },
  { kind: "rock", theta: 3.45, phi: 1.05, scale: 0.9 },
  { kind: "rock", theta: 4.95, phi: 1.75, scale: 0.75 },
  { kind: "rock", theta: 0.7, phi: 1.95, scale: 0.8 },

  // ── 버섯 (작은 디테일) ─────────────────────────────────────
  { kind: "mushroom", theta: 0.55, phi: 1.15, scale: 1.0, variant: 0 },
  { kind: "mushroom", theta: 1.35, phi: 1.55, scale: 0.9, variant: 1 },
  { kind: "mushroom", theta: 3.25, phi: 1.85, scale: 1.0, variant: 0 },
  { kind: "mushroom", theta: 4.6, phi: 1.45, scale: 0.85, variant: 1 },
  { kind: "mushroom", theta: 5.45, phi: 1.65, scale: 1.0, variant: 0 },
  { kind: "mushroom", theta: 2.65, phi: 1.4, scale: 0.9, variant: 1 },

  // ── 꽃 (작은 포인트, 빽빽하게) ─────────────────────────────
  { kind: "flower", theta: 0.6, phi: 1.4, scale: 1.0, variant: 0 },
  { kind: "flower", theta: 1.0, phi: 0.7, scale: 0.9, variant: 1 },
  { kind: "flower", theta: 2.9, phi: 1.0, scale: 1.0, variant: 2 },
  { kind: "flower", theta: 3.4, phi: 1.9, scale: 0.9, variant: 0 },
  { kind: "flower", theta: 4.9, phi: 2.0, scale: 1.0, variant: 1 },
  { kind: "flower", theta: 5.5, phi: 1.5, scale: 0.95, variant: 2 },
  { kind: "flower", theta: 0.8, phi: 1.7, scale: 0.85, variant: 2 },
  { kind: "flower", theta: 1.45, phi: 1.2, scale: 0.9, variant: 0 },
  { kind: "flower", theta: 2.25, phi: 1.25, scale: 1.0, variant: 1 },
  { kind: "flower", theta: 3.7, phi: 1.35, scale: 0.9, variant: 2 },
  { kind: "flower", theta: 4.35, phi: 1.65, scale: 0.95, variant: 0 },
  { kind: "flower", theta: 5.05, phi: 1.3, scale: 0.9, variant: 1 },
  { kind: "flower", theta: 6.05, phi: 1.35, scale: 1.0, variant: 2 },
  { kind: "flower", theta: 3.55, phi: 2.15, scale: 0.85, variant: 1 },
];
