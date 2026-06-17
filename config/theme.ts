// Yoonseul Blue 팔레트 — docs/design/06_visual_art_direction.md 의 1차 추천 팔레트.
// 색상을 한 곳에서 관리해 3D Scene과 HTML UI가 같은 톤을 공유하게 한다.
export const theme = {
  background: "#eaf7fa",
  sky: "#bdeaf2",
  ground: "#b9ddbe",
  accent: "#f7c76b",
  text: "#25323a",
  shadow: "#7293a0",
} as const;

export type Theme = typeof theme;
