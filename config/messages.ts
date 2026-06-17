import type { Message } from "@/types/message";

/**
 * MVP 메시지 데이터 (정적 상수).
 * 위치는 행성 표면의 구면 좌표 — theta(경도), phi(위도, 0=북극 / PI=남극).
 * 플레이어가 북극(phi≈0)에서 시작하므로 메시지는 phi 0.8~2.2 사이에 흩어 둔다.
 *
 * 원본 사이트(messenger.abeto.co)의 텍스트를 복제하지 않은 독립 문구.
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
];
