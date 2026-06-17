# 10. Future Multiplayer Plan

## 방향

초기에는 실시간 멀티플레이를 넣지 않습니다. 대신 구조를 다음 순서로 확장합니다.

```txt
v0.1 Standalone
v0.2 Guestbook
v0.3 Async traces
v0.4 Presence
v0.5 Real-time multiplayer
```

## v0.2 Guestbook

방문자가 짧은 메시지를 남기고, 관리자가 승인하거나 자동으로 표시하는 방식입니다.

필요 요소:

- Supabase table
- insert API
- MessageOrb로 표시
- 스팸 방지
- 금칙어/길이 제한

## v0.3 Async Traces

실시간은 아니지만, 다른 방문자의 흔적을 행성 위에 보여줍니다.

예시:

- 누군가 지나간 길이 빛 조각으로 남음
- 최근 방문자 위치가 작은 별로 표시됨
- 하루 지나면 사라지는 흔적

장점:

- 실시간 서버 불필요
- 멀티 느낌은 어느 정도 제공
- 구현 난이도 낮음

## v0.4 Presence

현재 접속자 수 또는 대략적인 위치만 표시합니다.

예시:

```txt
지금 이 작은 세계에 3명이 머무르고 있어요.
```

Supabase Realtime Presence 또는 PartyKit으로 구현 가능합니다.

## v0.5 Real-time Multiplayer

실제로 여러 사용자의 위치가 동기화됩니다.

필요 요소:

- WebSocket 서버
- room 관리
- 위치 broadcast
- 보간/interpolation
- 연결 종료 처리
- avatar id
- rate limit

## 실시간 멀티플레이 아키텍처

```txt
Vercel
 └─ Next.js frontend

Realtime Layer
 └─ PartyKit or Supabase Realtime
     ├─ room
     ├─ presence
     ├─ player position
     └─ emoji/message event

Database
 └─ Supabase
     ├─ guest_messages
     └─ visitor_traces
```

## 멀티플레이에서 피해야 할 것

- 물리 충돌 동기화
- 전투/경쟁
- 서버 권위 시뮬레이션
- 정확한 좌표 동기화 강박
- 대규모 동접 목표

이 프로젝트에서는 “정확한 게임 서버”보다 “같은 공간에 있다는 감성”이 중요합니다.

## 추천 멀티 표현

- ghost avatar
- floating emoji
- short presence pulse
- asynchronous light trail
- recent message constellation

## 우선순위

가장 추천하는 확장 순서:

1. Supabase guestbook
2. visitor traces
3. presence count
4. ghost avatar
5. real-time movement
