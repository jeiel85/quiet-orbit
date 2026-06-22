import type { PlanetId } from "@/types/world";

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
  | "fox" // 어린왕자의 컴패니언 (인터랙티브)
  | "crystal"
  | "telescope"
  | "postbox"
  | "bench"
  | "windmill"
  | "cactus"
  | "arch"
  | "pond"
  | "satellite"
  | "shell"
  | "lantern"
  | "cloud"
  | "paperBoat"
  | "ringStone"
  | "tinyFlag"
  | "comet"
  | "musicBox"
  | "letterSpiral"
  | "bubbleSpring"
  | "moonGate"
  | "mountain" // 낮은 봉우리 (variant 1 = 눈 덮인 설산)
  | "water" // 잔잔한 바다/호수 (납작 반투명 면)
  | "river" // 굽이치는 시내 (반투명 리본)
  | "grass" // 들풀 무더기 (인스턴스드 — 한 항목이 여러 포기)
  | "reed"; // 물가 갈대

export interface Decoration {
  kind: DecorationKind;
  /** 생략하면 시작 행성(home)에 배치된다. */
  planetId?: PlanetId;
  /** 표면 위치 — 구면 좌표(경도/위도). */
  theta: number;
  phi: number;
  /** 크기 배수 (기본 1). */
  scale?: number;
  /** 색/형태 변주 인덱스 (꽃 색 등). */
  variant?: number;
  /** 표면 위로 띄우는 추가 높이 — 떠 있는 별 등. */
  radiusOffset?: number;
  /** 모바일(터치)에서는 렌더 생략 — 비필수 장식으로 드로우콜을 줄인다(데스크톱은 그대로 풍성). */
  mobileHidden?: boolean;
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

  // ── 반응형 소품: 가까이 가거나 클릭하면 더 크게 살아난다 ─────────
  { kind: "musicBox", theta: 2.05, phi: 1.05, scale: 0.9, variant: 0 },
  { kind: "letterSpiral", theta: 4.82, phi: 1.22, scale: 0.95, variant: 1 },
  { kind: "bubbleSpring", theta: 5.52, phi: 2.05, scale: 0.9, variant: 0 },
  { kind: "moonGate", theta: 0.18, phi: 2.28, scale: 0.85, variant: 0 },
  { kind: "musicBox", theta: 3.78, phi: 0.95, scale: 0.72, variant: 1 },
  { kind: "letterSpiral", theta: 1.95, phi: 2.35, scale: 0.78, variant: 0 },
  { kind: "bubbleSpring", theta: 2.78, phi: 2.45, scale: 0.72, variant: 1 },

  // ── 새벽 편지별: 종이배·연못·바람개비·편지함 ─────────────
  { planetId: "dawn", kind: "pond", theta: 0.55, phi: 1.92, scale: 1.25 },
  { planetId: "dawn", kind: "paperBoat", theta: 0.72, phi: 1.82, scale: 1.0, variant: 0 },
  { planetId: "dawn", kind: "paperBoat", theta: 0.38, phi: 2.05, scale: 0.85, variant: 1 },
  { planetId: "dawn", kind: "windmill", theta: 2.95, phi: 1.25, scale: 1.05 },
  { planetId: "dawn", kind: "windmill", theta: 3.35, phi: 1.45, scale: 0.78, variant: 1 },
  { planetId: "dawn", kind: "postbox", theta: 1.1, phi: 1.1, scale: 1.0 },
  { planetId: "dawn", kind: "postbox", theta: 4.65, phi: 1.75, scale: 0.9, variant: 1 },
  { planetId: "dawn", kind: "bench", theta: 1.8, phi: 1.75, scale: 0.95 },
  { planetId: "dawn", kind: "lantern", theta: 4.05, phi: 1.28, scale: 1.0, variant: 0 },
  { planetId: "dawn", kind: "lantern", theta: 5.4, phi: 2.1, scale: 0.85, variant: 1 },
  { planetId: "dawn", kind: "shell", theta: 5.05, phi: 1.55, scale: 0.8, variant: 0 },
  { planetId: "dawn", kind: "shell", theta: 5.65, phi: 1.85, scale: 0.7, variant: 1 },
  { planetId: "dawn", kind: "cloud", theta: 2.15, phi: 0.85, scale: 1.0, radiusOffset: 0.85 },
  { planetId: "dawn", kind: "cloud", theta: 4.95, phi: 1.0, scale: 0.8, radiusOffset: 0.75 },
  { planetId: "dawn", kind: "letterSpiral", theta: 2.55, phi: 1.56, scale: 1.0, variant: 1 },
  { planetId: "dawn", kind: "musicBox", theta: 5.85, phi: 1.46, scale: 0.88, variant: 0 },
  { planetId: "dawn", kind: "bubbleSpring", theta: 3.12, phi: 2.22, scale: 0.86, variant: 0 },
  { planetId: "dawn", kind: "moonGate", theta: 4.35, phi: 0.95, scale: 0.78, variant: 1 },
  { planetId: "dawn", kind: "letterSpiral", theta: 0.16, phi: 1.35, scale: 0.75, variant: 0 },
  { planetId: "dawn", kind: "tree", theta: 0.95, phi: 1.55, scale: 0.8 },
  { planetId: "dawn", kind: "tree", theta: 2.25, phi: 2.05, scale: 0.9 },
  { planetId: "dawn", kind: "mushroom", theta: 3.7, phi: 1.85, scale: 0.9, variant: 1 },
  { planetId: "dawn", kind: "flower", theta: 0.95, phi: 1.25, scale: 0.9, variant: 1 },
  { planetId: "dawn", kind: "flower", theta: 1.45, phi: 1.55, scale: 0.85, variant: 2 },
  { planetId: "dawn", kind: "flower", theta: 2.7, phi: 1.72, scale: 1.0, variant: 0 },
  { planetId: "dawn", kind: "flower", theta: 3.95, phi: 2.2, scale: 0.85, variant: 1 },
  { planetId: "dawn", kind: "rock", theta: 5.95, phi: 1.28, scale: 0.8 },

  // ── 붉은 먼지별: 수정·선인장·아치·혜성 조각 ───────────────
  { planetId: "ember", kind: "crystal", theta: 2.35, phi: 1.1, scale: 1.1, variant: 0 },
  { planetId: "ember", kind: "crystal", theta: 2.7, phi: 1.35, scale: 0.85, variant: 1 },
  { planetId: "ember", kind: "crystal", theta: 1.45, phi: 1.8, scale: 0.95, variant: 2 },
  { planetId: "ember", kind: "cactus", theta: 0.9, phi: 1.45, scale: 0.95 },
  { planetId: "ember", kind: "cactus", theta: 4.55, phi: 1.25, scale: 0.85, variant: 1 },
  { planetId: "ember", kind: "arch", theta: 3.92, phi: 2.02, scale: 1.1 },
  { planetId: "ember", kind: "ringStone", theta: 5.15, phi: 1.8, scale: 1.0 },
  { planetId: "ember", kind: "ringStone", theta: 0.35, phi: 2.1, scale: 0.8, variant: 1 },
  { planetId: "ember", kind: "comet", theta: 1.9, phi: 0.82, scale: 0.9, radiusOffset: 0.95 },
  { planetId: "ember", kind: "comet", theta: 5.7, phi: 1.05, scale: 0.75, radiusOffset: 0.8, variant: 1 },
  { planetId: "ember", kind: "tinyFlag", theta: 1.58, phi: 1.38, scale: 1.0, variant: 0 },
  { planetId: "ember", kind: "lantern", theta: 0.6, phi: 1.95, scale: 0.9, variant: 1 },
  { planetId: "ember", kind: "moonGate", theta: 2.62, phi: 2.28, scale: 0.95, variant: 0 },
  { planetId: "ember", kind: "bubbleSpring", theta: 4.05, phi: 0.98, scale: 0.82, variant: 1 },
  { planetId: "ember", kind: "musicBox", theta: 5.92, phi: 1.88, scale: 0.82, variant: 1 },
  { planetId: "ember", kind: "letterSpiral", theta: 3.18, phi: 2.38, scale: 0.78, variant: 0 },
  { planetId: "ember", kind: "moonGate", theta: 0.2, phi: 1.34, scale: 0.72, variant: 1 },
  { planetId: "ember", kind: "volcano", theta: 5.3, phi: 1.55, scale: 1.0, variant: 1 },
  { planetId: "ember", kind: "volcano", theta: 3.35, phi: 1.45, scale: 0.85, variant: 0 },
  { planetId: "ember", kind: "rock", theta: 0.95, phi: 1.7, scale: 1.0 },
  { planetId: "ember", kind: "rock", theta: 4.8, phi: 2.12, scale: 0.85 },
  { planetId: "ember", kind: "mushroom", theta: 2.9, phi: 2.0, scale: 0.85, variant: 0 },
  { planetId: "ember", kind: "flower", theta: 1.1, phi: 2.25, scale: 0.8, variant: 0 },
  { planetId: "ember", kind: "flower", theta: 3.75, phi: 1.2, scale: 0.9, variant: 1 },
  { planetId: "ember", kind: "flower", theta: 5.9, phi: 1.62, scale: 0.85, variant: 2 },
  { planetId: "ember", kind: "tree", theta: 4.1, phi: 1.85, scale: 0.75 },
  { planetId: "ember", kind: "house", theta: 2.05, phi: 2.12, scale: 0.82 },

  // ── 보랏빛 궤도별: 망원경·위성·돌고리·떠 있는 구름 ───────
  { planetId: "violet", kind: "satellite", theta: 4.6, phi: 1.2, scale: 1.0, radiusOffset: 0.95 },
  { planetId: "violet", kind: "satellite", theta: 0.3, phi: 1.95, scale: 0.7, radiusOffset: 0.85, variant: 1 },
  { planetId: "violet", kind: "telescope", theta: 2.65, phi: 1.85, scale: 1.05 },
  { planetId: "violet", kind: "telescope", theta: 5.05, phi: 1.22, scale: 0.9, variant: 1 },
  { planetId: "violet", kind: "ringStone", theta: 5.45, phi: 1.65, scale: 1.1 },
  { planetId: "violet", kind: "ringStone", theta: 1.1, phi: 2.1, scale: 0.85, variant: 1 },
  { planetId: "violet", kind: "cloud", theta: 1.85, phi: 0.88, scale: 1.1, radiusOffset: 0.9 },
  { planetId: "violet", kind: "cloud", theta: 3.85, phi: 1.95, scale: 0.85, radiusOffset: 0.78 },
  { planetId: "violet", kind: "comet", theta: 0.65, phi: 1.3, scale: 0.85, radiusOffset: 0.8 },
  { planetId: "violet", kind: "crystal", theta: 1.85, phi: 2.02, scale: 0.85, variant: 2 },
  { planetId: "violet", kind: "bench", theta: 3.45, phi: 1.25, scale: 0.95, variant: 1 },
  { planetId: "violet", kind: "tinyFlag", theta: 2.2, phi: 1.4, scale: 0.9, variant: 1 },
  { planetId: "violet", kind: "star", theta: 4.15, phi: 1.7, scale: 0.9, radiusOffset: 0.85, variant: 2 },
  { planetId: "violet", kind: "star", theta: 5.8, phi: 2.0, scale: 0.8, radiusOffset: 0.75, variant: 1 },
  { planetId: "violet", kind: "lantern", theta: 0.95, phi: 1.75, scale: 0.85, variant: 1 },
  { planetId: "violet", kind: "moonGate", theta: 2.72, phi: 0.92, scale: 0.96, variant: 1 },
  { planetId: "violet", kind: "letterSpiral", theta: 3.92, phi: 2.28, scale: 0.82, variant: 1 },
  { planetId: "violet", kind: "musicBox", theta: 0.52, phi: 2.18, scale: 0.8, variant: 0 },
  { planetId: "violet", kind: "bubbleSpring", theta: 4.56, phi: 1.48, scale: 0.78, variant: 0 },
  { planetId: "violet", kind: "letterSpiral", theta: 5.22, phi: 2.34, scale: 0.72, variant: 0 },
  { planetId: "violet", kind: "flower", theta: 1.35, phi: 1.25, scale: 0.9, variant: 2 },
  { planetId: "violet", kind: "flower", theta: 2.9, phi: 2.18, scale: 0.8, variant: 1 },
  { planetId: "violet", kind: "mushroom", theta: 4.85, phi: 1.9, scale: 0.8, variant: 1 },
  { planetId: "violet", kind: "rock", theta: 3.0, phi: 1.08, scale: 0.95 },
  { planetId: "violet", kind: "tree", theta: 5.95, phi: 1.45, scale: 0.82 },

  // ── 작은 초록별 보강: 들풀·시내·낮은 산 ──────────────────────
  // 데스크톱은 전부 렌더, 모바일(mobileHidden)은 비필수 장식을 생략해 드로우콜을 줄인다.
  { kind: "grass", theta: 0.85, phi: 1.45, scale: 1.0, variant: 0 },
  { kind: "grass", theta: 1.7, phi: 1.25, scale: 1.0, variant: 1 },
  { kind: "grass", theta: 2.6, phi: 1.7, scale: 1.1, variant: 0, mobileHidden: true },
  { kind: "grass", theta: 3.5, phi: 1.25, scale: 1.0, variant: 1, mobileHidden: true },
  { kind: "grass", theta: 4.6, phi: 1.6, scale: 1.0, variant: 0, mobileHidden: true },
  { kind: "grass", theta: 5.4, phi: 1.35, scale: 1.1, variant: 1, mobileHidden: true },
  { kind: "river", theta: 2.0, phi: 1.78, scale: 1.0 },
  { kind: "mountain", theta: 5.5, phi: 1.02, scale: 1.5, variant: 0 }, // 빈 능선으로 이동(꽃·소품과 안 겹치게)
  { kind: "mountain", theta: 0.35, phi: 2.05, scale: 1.4, variant: 1, mobileHidden: true },
  { kind: "reed", theta: 2.25, phi: 1.7, scale: 1.0, variant: 0 },
  { kind: "flower", theta: 2.35, phi: 1.55, scale: 0.9, variant: 1, mobileHidden: true },
  { kind: "flower", theta: 4.7, phi: 1.4, scale: 0.85, variant: 2, mobileHidden: true },
  { kind: "star", theta: 1.05, phi: 1.85, scale: 0.85, radiusOffset: 0.8, variant: 1, mobileHidden: true },
  { kind: "star", theta: 4.45, phi: 0.85, scale: 0.95, radiusOffset: 0.9, variant: 2, mobileHidden: true },
  { kind: "tree", theta: 2.55, phi: 1.95, scale: 0.9, mobileHidden: true },

  // ── 높은 바람산별: 봉우리·솔숲·눈·들풀 ─────────────────────
  { planetId: "summit", kind: "mountain", theta: 2.0, phi: 1.5, scale: 2.4, variant: 1 },
  { planetId: "summit", kind: "mountain", theta: 2.6, phi: 1.85, scale: 1.9, variant: 1 },
  { planetId: "summit", kind: "mountain", theta: 1.4, phi: 1.8, scale: 1.7, variant: 0 },
  { planetId: "summit", kind: "mountain", theta: 3.5, phi: 1.35, scale: 2.1, variant: 1 },
  { planetId: "summit", kind: "mountain", theta: 4.9, phi: 1.7, scale: 1.6, variant: 0 },
  { planetId: "summit", kind: "mountain", theta: 5.6, phi: 1.25, scale: 1.9, variant: 1 },
  { planetId: "summit", kind: "tree", theta: 0.9, phi: 1.5, scale: 1.0 },
  { planetId: "summit", kind: "tree", theta: 1.1, phi: 1.85, scale: 0.85 },
  { planetId: "summit", kind: "tree", theta: 3.0, phi: 1.7, scale: 1.05 },
  { planetId: "summit", kind: "tree", theta: 4.2, phi: 1.5, scale: 0.9 },
  { planetId: "summit", kind: "tree", theta: 5.2, phi: 1.95, scale: 0.95 },
  { planetId: "summit", kind: "grass", theta: 0.7, phi: 1.7, scale: 1.0, variant: 2 },
  { planetId: "summit", kind: "grass", theta: 2.3, phi: 1.25, scale: 1.0, variant: 0 },
  { planetId: "summit", kind: "grass", theta: 3.8, phi: 1.95, scale: 1.0, variant: 2 },
  { planetId: "summit", kind: "grass", theta: 5.05, phi: 1.45, scale: 1.1, variant: 0 },
  { planetId: "summit", kind: "rock", theta: 1.7, phi: 1.35, scale: 1.0 },
  { planetId: "summit", kind: "rock", theta: 4.55, phi: 1.9, scale: 0.85 },
  { planetId: "summit", kind: "rock", theta: 5.9, phi: 1.6, scale: 1.1 },
  { planetId: "summit", kind: "lamp", theta: 0.5, phi: 1.95, scale: 0.95 },
  { planetId: "summit", kind: "house", theta: 4.6, phi: 1.3, scale: 0.85 },
  { planetId: "summit", kind: "star", theta: 2.1, phi: 0.7, scale: 1.0, radiusOffset: 0.95, variant: 1 },
  { planetId: "summit", kind: "star", theta: 3.9, phi: 0.8, scale: 0.85, radiusOffset: 0.8, variant: 2 },
  { planetId: "summit", kind: "star", theta: 5.5, phi: 2.1, scale: 0.9, radiusOffset: 0.85, variant: 0 },
  { planetId: "summit", kind: "mushroom", theta: 0.95, phi: 1.65, scale: 0.9, variant: 0 },
  { planetId: "summit", kind: "flower", theta: 2.7, phi: 1.55, scale: 0.85, variant: 2 },

  // ── 물빛 바다별: 바다·모래톱·갈대·조개·종이배 ───────────────
  { planetId: "tide", kind: "water", theta: 3.3, phi: 1.7, scale: 2.6 }, // 큰 바다
  { planetId: "tide", kind: "water", theta: 5.5, phi: 1.45, scale: 1.3 }, // 떨어진 작은 호수
  { planetId: "tide", kind: "reed", theta: 2.0, phi: 1.45, scale: 1.0, variant: 0 }, // 큰 바다 물가
  { planetId: "tide", kind: "reed", theta: 4.5, phi: 1.4, scale: 0.9, variant: 1 }, // 큰 바다 물가
  { planetId: "tide", kind: "reed", theta: 4.6, phi: 1.7, scale: 1.0, variant: 0 },
  { planetId: "tide", kind: "paperBoat", theta: 3.3, phi: 1.5, scale: 1.0, variant: 0, radiusOffset: 0.05 },
  { planetId: "tide", kind: "paperBoat", theta: 3.65, phi: 1.85, scale: 0.85, variant: 1, radiusOffset: 0.05 },
  { planetId: "tide", kind: "shell", theta: 1.4, phi: 1.6, scale: 0.9, variant: 0 },
  { planetId: "tide", kind: "shell", theta: 1.7, phi: 1.65, scale: 0.85, variant: 1 }, // 호수 밖 모래톱으로
  { planetId: "tide", kind: "shell", theta: 0.6, phi: 1.85, scale: 0.8, variant: 0 },
  { planetId: "tide", kind: "grass", theta: 1.1, phi: 1.4, scale: 1.0, variant: 0 },
  { planetId: "tide", kind: "grass", theta: 0.4, phi: 1.55, scale: 1.0, variant: 1 }, // 호수 밖으로
  { planetId: "tide", kind: "lamp", theta: 0.9, phi: 1.7, scale: 1.0 },
  { planetId: "tide", kind: "cloud", theta: 2.0, phi: 0.8, scale: 1.0, radiusOffset: 0.9 },
  { planetId: "tide", kind: "cloud", theta: 4.8, phi: 0.95, scale: 0.85, radiusOffset: 0.8 },
  { planetId: "tide", kind: "star", theta: 1.7, phi: 0.7, scale: 0.9, radiusOffset: 0.85, variant: 1 },
  { planetId: "tide", kind: "star", theta: 5.3, phi: 2.05, scale: 0.85, radiusOffset: 0.8, variant: 2 },
  { planetId: "tide", kind: "flower", theta: 1.3, phi: 1.25, scale: 0.85, variant: 1 },
  { planetId: "tide", kind: "tree", theta: 0.7, phi: 1.45, scale: 0.85 },
  { planetId: "tide", kind: "mushroom", theta: 1.9, phi: 1.4, scale: 0.85, variant: 1 }, // 호수 밖으로

  // ── 시냇물 풀별: 시내·들풀·들꽃·연못 ───────────────────────
  { planetId: "brook", kind: "river", theta: 2.0, phi: 1.6, scale: 1.0 },
  { planetId: "brook", kind: "river", theta: 4.3, phi: 1.85, scale: 1.0 },
  { planetId: "brook", kind: "pond", theta: 3.0, phi: 1.4, scale: 1.3 },
  { planetId: "brook", kind: "grass", theta: 0.8, phi: 1.5, scale: 1.1, variant: 0 },
  { planetId: "brook", kind: "grass", theta: 1.5, phi: 1.75, scale: 1.1, variant: 1 },
  { planetId: "brook", kind: "grass", theta: 2.4, phi: 1.35, scale: 1.2, variant: 0, mobileHidden: true },
  { planetId: "brook", kind: "grass", theta: 3.3, phi: 1.8, scale: 1.1, variant: 1 },
  { planetId: "brook", kind: "grass", theta: 4.0, phi: 1.45, scale: 1.2, variant: 0, mobileHidden: true },
  { planetId: "brook", kind: "grass", theta: 4.9, phi: 1.7, scale: 1.1, variant: 1 },
  { planetId: "brook", kind: "grass", theta: 5.6, phi: 1.4, scale: 1.2, variant: 0, mobileHidden: true },
  { planetId: "brook", kind: "reed", theta: 2.2, phi: 1.55, scale: 1.0, variant: 0 },
  { planetId: "brook", kind: "reed", theta: 4.0, phi: 1.8, scale: 0.9, variant: 1 },
  { planetId: "brook", kind: "reed", theta: 3.15, phi: 1.32, scale: 0.95, variant: 0 },
  { planetId: "brook", kind: "flower", theta: 0.95, phi: 1.65, scale: 0.95, variant: 0 },
  { planetId: "brook", kind: "flower", theta: 1.7, phi: 1.5, scale: 0.9, variant: 1 },
  { planetId: "brook", kind: "flower", theta: 2.7, phi: 1.7, scale: 1.0, variant: 2, mobileHidden: true },
  { planetId: "brook", kind: "flower", theta: 3.6, phi: 1.55, scale: 0.9, variant: 0 },
  { planetId: "brook", kind: "flower", theta: 4.5, phi: 1.6, scale: 0.95, variant: 1 },
  { planetId: "brook", kind: "flower", theta: 5.3, phi: 1.75, scale: 0.9, variant: 2, mobileHidden: true },
  { planetId: "brook", kind: "tree", theta: 1.2, phi: 1.95, scale: 1.0 },
  { planetId: "brook", kind: "tree", theta: 3.9, phi: 1.25, scale: 0.9 },
  { planetId: "brook", kind: "tree", theta: 5.1, phi: 1.95, scale: 0.95 },
  { planetId: "brook", kind: "mushroom", theta: 2.05, phi: 1.85, scale: 0.9, variant: 0 },
  { planetId: "brook", kind: "mushroom", theta: 4.7, phi: 1.4, scale: 0.85, variant: 1 },
  { planetId: "brook", kind: "bench", theta: 1.9, phi: 1.3, scale: 0.95 },
  { planetId: "brook", kind: "star", theta: 0.6, phi: 0.8, scale: 0.95, radiusOffset: 0.9, variant: 0 },
  { planetId: "brook", kind: "star", theta: 3.2, phi: 0.75, scale: 0.85, radiusOffset: 0.8, variant: 1 },
  { planetId: "brook", kind: "star", theta: 5.0, phi: 2.05, scale: 0.9, radiusOffset: 0.85, variant: 2 },
  { planetId: "brook", kind: "rock", theta: 2.6, phi: 1.95, scale: 0.85 },
  { planetId: "brook", kind: "lamp", theta: 4.4, phi: 1.5, scale: 0.9 },
];
