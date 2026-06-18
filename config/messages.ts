import type { Message } from "@/types/message";

/**
 * MVP 메시지 데이터 (정적 상수).
 * 위치는 행성 표면의 구면 좌표 — theta(경도), phi(위도, 0=북극 / PI=남극).
 * 플레이어가 북극(phi≈0)에서 시작하므로 메시지는 phi 0.85~2.5 밴드에 흩어 둔다.
 * 북극(시작점)과 남극은 비워 둔다. Orb 간 각거리는 최소 ~0.45 rad 이상으로 잡아
 * 두 Orb 가 동시에 근접 활성되지 않게 하고(interactionRadius 0.55), 장식
 * (config/decorations.ts)과도 겹치지 않게 흩어 둔다.
 *
 * 원본 사이트(messenger.abeto.co)의 텍스트를 복제하지 않은 독립 문구.
 * 각 메시지는 서로 독립적 — 어떤 순서로 발견해도 읽히도록 서사 의존성을 두지 않는다.
 *
 * 확장 seam: 후속(v0.2 guestbook)에서는 이 내장 배열을 그대로 두고,
 * 원격 소스(Supabase `guest_messages`)에서 받은 항목을 types/online.ts 의
 * GuestMessageToMessage 어댑터로 변환해 하나의 목록으로 합쳐 렌더한다.
 * 즉 "내장 + 원격" 을 합치는 지점만 추가하면 되도록 구조를 단순하게 유지한다.
 */
export const messages: Message[] = [
  {
    id: "first-light",
    title: "첫 번째 빛",
    body: "작은 세계에 들어온 걸 환영해요. 서두르지 않아도 괜찮습니다. 천천히 둘러보세요.",
    position: { theta: 0.4, phi: 0.9 },
    tone: "warm",
  },
  {
    id: "quiet-path",
    title: "조용한 길",
    body: "빠르게 지나치면 보이지 않는 것들이 있어요. 잠깐 멈춰 서도 좋아요.",
    position: { theta: 1.6, phi: 1.4 },
    tone: "quiet",
  },
  {
    id: "small-courage",
    title: "작은 용기",
    body: "오늘 하루를 버틴 것만으로도 충분히 잘했어요. 그걸 잊지 않았으면 해요.",
    position: { theta: 2.7, phi: 1.0 },
    tone: "hope",
  },
  {
    id: "far-friend",
    title: "멀리 있는 친구",
    body: "닿지 않을 것 같던 마음도, 천천히 도착하곤 해요. 기다려 줘서 고마워요.",
    position: { theta: 3.6, phi: 1.7 },
    tone: "memory",
  },
  {
    id: "night-window",
    title: "밤의 창가",
    body: "불빛 하나가 누군가에겐 길이 됩니다. 당신도 그래요.",
    position: { theta: 4.7, phi: 1.2 },
    tone: "hope",
  },
  {
    id: "keep-going",
    title: "그래도 걷기",
    body: "길을 잃어도 괜찮아요. 걷는 동안 길이 생기니까요.",
    position: { theta: 5.6, phi: 2.0 },
    tone: "warm",
  },

  // v0.2 콘텐츠 확장 — 같은 분위기의 독립 문구를 빈 구역에 더 흩어 둔다.
  {
    id: "deep-breath",
    title: "한 번의 숨",
    body: "들이쉬고, 천천히 내쉬어요.\n그 잠깐의 사이가 온전히 당신의 자리예요.",
    position: { theta: 0.25, phi: 1.85 },
    tone: "quiet",
  },
  {
    id: "old-photograph",
    title: "오래된 사진",
    body: "흐릿해진 기억도 한때는 또렷했어요. 잊은 게 아니라, 마음 깊이 잘 간직하고 있는 거예요.",
    position: { theta: 0.8, phi: 2.45 },
    tone: "memory",
  },
  {
    id: "between-words",
    title: "말과 말 사이",
    body: "다 말하지 않아도 괜찮아요. 가만히 곁에 있는 것도 하나의 다정한 대답이에요.",
    position: { theta: 2.0, phi: 2.3 },
    tone: "quiet",
  },
  {
    id: "warm-seat",
    title: "데워 둔 자리",
    body: "누군가 당신이 올 자리를 미리 데워 두었어요. 차갑게 식지 않도록요.",
    position: { theta: 3.3, phi: 0.85 },
    tone: "warm",
  },
  {
    id: "letter-never-sent",
    title: "부치지 못한 편지",
    body: "전하지 못한 마음도 사라지진 않아요. 어딘가에 조용히 남아, 당신을 닮아 가요.",
    position: { theta: 4.0, phi: 1.15 },
    tone: "memory",
  },
  {
    id: "small-light-ahead",
    title: "저 앞의 불빛",
    body: "아직 닿지 않았을 뿐이에요. 한 걸음이면, 그만큼 가까워져요.",
    position: { theta: 5.0, phi: 2.5 },
    tone: "hope",
  },
  {
    id: "morning-again",
    title: "다시, 아침",
    body: "긴 밤을 지나온 사람만이 아침의 빛을 알아봐요. 당신은 이미 그 빛을 알아요.",
    position: { theta: 5.5, phi: 0.9 },
    tone: "hope",
  },
  {
    id: "you-are-here",
    title: "당신은 여기에",
    body: "멀리 돌아왔어도, 결국 도착했어요. 지금 여기 있다는 것. 그걸로 충분해요.",
    position: { theta: 6.0, phi: 1.7 },
    tone: "warm",
  },

  // 새벽 편지별
  {
    id: "paper-boat",
    planetId: "dawn",
    title: "종이배",
    body: "가벼운 마음도 물살을 만나면 꽤 멀리 가요. 오늘의 작은 문장 하나를 띄워 보세요.",
    position: { theta: 0.95, phi: 1.55 },
    tone: "quiet",
  },
  {
    id: "wind-note",
    planetId: "dawn",
    title: "바람의 쪽지",
    body: "답장이 늦어도 마음이 늦은 건 아닐 거예요. 어떤 말들은 천천히 도착하니까요.",
    position: { theta: 3.1, phi: 1.08 },
    tone: "memory",
  },
  {
    id: "soft-harbor",
    planetId: "dawn",
    title: "부드러운 항구",
    body: "잠시 머무르는 곳도 목적지가 될 수 있어요. 쉬어 가도 길은 사라지지 않습니다.",
    position: { theta: 5.05, phi: 2.0 },
    tone: "warm",
  },

  // 붉은 먼지별
  {
    id: "warm-crater",
    planetId: "ember",
    title: "따뜻한 분화구",
    body: "식어 가는 것처럼 보여도 안쪽에는 오래 남은 온기가 있어요. 당신에게도 그런 빛이 있습니다.",
    position: { theta: 0.95, phi: 1.7 },
    tone: "warm",
  },
  {
    id: "crystal-map",
    planetId: "ember",
    title: "수정 지도",
    body: "길은 늘 직선일 필요가 없어요. 반짝이는 조각을 따라 돌아가도, 결국 만나게 됩니다.",
    position: { theta: 2.65, phi: 1.3 },
    tone: "hope",
  },
  {
    id: "red-dust",
    planetId: "ember",
    title: "붉은 먼지",
    body: "먼지가 가라앉고 나면 남는 모양이 있어요. 오늘 지나간 일들도 언젠가 선명해질 거예요.",
    position: { theta: 4.8, phi: 2.12 },
    tone: "memory",
  },

  // 보랏빛 궤도별
  {
    id: "little-satellite",
    planetId: "violet",
    title: "작은 위성",
    body: "혼자 도는 것처럼 보여도, 같은 중심을 바라보는 것들이 있어요. 외로움도 때로는 궤도입니다.",
    position: { theta: 0.8, phi: 1.62 },
    tone: "quiet",
  },
  {
    id: "telescope-night",
    planetId: "violet",
    title: "망원경의 밤",
    body: "멀리 있는 빛을 보려면 어둠도 필요해요. 지금의 밤이 전부 어둠만은 아닐 거예요.",
    position: { theta: 2.35, phi: 1.05 },
    tone: "hope",
  },
  {
    id: "orbit-letter",
    planetId: "violet",
    title: "궤도 위 편지",
    body: "돌고 돌아 다시 만나는 말들이 있어요. 오래된 다정함은 길을 잃지 않습니다.",
    position: { theta: 5.2, phi: 1.85 },
    tone: "memory",
  },
];
