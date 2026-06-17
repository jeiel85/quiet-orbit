# 07. Data Model and State

## Message 데이터

```ts
export type Message = {
  id: string
  title: string
  body: string
  position: {
    theta: number
    phi: number
    radiusOffset?: number
  }
  tone?: 'warm' | 'quiet' | 'hope' | 'memory'
}
```

## 읽음 상태

```ts
export type MessageProgress = {
  readMessageIds: string[]
  lastReadAtById: Record<string, string>
}
```

## Player 상태

```ts
export type PlayerState = {
  position: [number, number, number]
  forward: [number, number, number]
  up: [number, number, number]
  speed: number
  isMoving: boolean
}
```

## Input 상태

```ts
export type InputState = {
  moveForward: boolean
  moveBackward: boolean
  turnLeft: boolean
  turnRight: boolean
  interactPressed: boolean
  joystick: {
    active: boolean
    x: number
    y: number
  }
}
```

## Game 상태

```ts
export type GameState = {
  started: boolean
  paused: boolean
  activeMessageId: string | null
  openedMessageId: string | null
  device: 'desktop' | 'mobile'
}
```

## zustand store 분리

권장 분리:

```txt
useGameStore
 ├─ started
 ├─ paused
 ├─ activeMessageId
 └─ openedMessageId

useInputStore
 ├─ keyboard
 ├─ joystick
 └─ actions

useMessageStore
 ├─ messages
 ├─ readMessageIds
 ├─ markAsRead
 └─ resetProgress

useSettingsStore
 ├─ soundEnabled
 ├─ cameraSensitivity
 └─ reduceMotion
```

## localStorage 키

```ts
const STORAGE_KEYS = {
  messageProgress: 'messenger-planet:message-progress',
  settings: 'messenger-planet:settings',
}
```

## 저장 정책

- 메시지를 열면 즉시 읽음 처리
- localStorage 저장 실패 시 앱은 계속 동작
- JSON parse 오류가 나면 기본 상태로 복구
- 나중에 DB 연동 시 migration 가능하게 타입 유지

## 온라인 확장을 위한 데이터 구조

후속 버전에서 Supabase를 붙일 경우 아래 테이블을 고려합니다.

### guest_messages

| column | type | note |
|---|---|---|
| id | uuid | primary key |
| body | text | 방문자 메시지 |
| display_name | text | 선택 |
| theta | float | 행성 위치 |
| phi | float | 행성 위치 |
| created_at | timestamp | 생성 시각 |
| status | text | pending/approved/hidden |

### visitor_traces

| column | type | note |
|---|---|---|
| id | uuid | primary key |
| visitor_id | text | 익명 ID |
| path | jsonb | 짧은 이동 경로 |
| created_at | timestamp | 생성 시각 |
| expires_at | timestamp | 만료 시각 |

MVP에서는 이 테이블을 만들지 않습니다. 타입과 컴포넌트 구조만 나중에 붙이기 좋게 유지합니다.
