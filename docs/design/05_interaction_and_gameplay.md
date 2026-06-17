# 05. Interaction and Gameplay

## 핵심 루프

```txt
입장
 → 작은 행성 표시
 → 플레이어 이동
 → 빛나는 메시지 발견
 → 가까이 접근
 → 메시지 열기
 → 읽음 저장
 → 다음 메시지 탐색
```

## 플레이어 이동

### 데스크톱

- `W` / `ArrowUp`: 전진
- `S` / `ArrowDown`: 후진 또는 감속
- `A` / `ArrowLeft`: 좌회전
- `D` / `ArrowRight`: 우회전
- `Space`: 상호작용 또는 메시지 열기

### 모바일

- 좌측 하단 가상 조이스틱
- 화면 탭으로 상호작용
- UI 패널이 열려 있을 때는 이동 비활성화

## 행성 위 이동 방식

초기 버전에서는 완전한 물리 시뮬레이션보다 단순한 구면 이동을 권장합니다.

개념:

```txt
planetCenter = (0, 0, 0)
planetRadius = 3
playerPosition은 항상 planetRadius + playerHeight만큼 중심에서 떨어진다.
플레이어의 up 방향은 normalize(playerPosition - planetCenter)이다.
이동 방향은 현재 tangent plane 위에서 계산한다.
```

## 메시지 감지

매 프레임 또는 일정 간격으로 플레이어와 MessageOrb의 거리를 계산합니다.

```txt
distance < interactionRadius
 → activeMessageId 설정
 → InteractionHint 표시
```

권장값:

```ts
interactionRadius = 0.55
```

## Message Orb 배치

행성 표면 위치는 spherical coordinate로 관리합니다.

```ts
type SphericalPoint = {
  id: string
  theta: number
  phi: number
  radiusOffset?: number
}
```

계산:

```txt
x = r * sin(phi) * cos(theta)
y = r * cos(phi)
z = r * sin(phi) * sin(theta)
```

## 메시지 예시

초기 메시지는 5~7개로 충분합니다.

```ts
[
  {
    id: 'first-light',
    title: '첫 번째 빛',
    body: '작은 세계에 들어온 것을 환영해요. 천천히 걸어도 괜찮습니다.'
  },
  {
    id: 'quiet-path',
    title: '조용한 길',
    body: '빠르게 지나치면 보이지 않는 것들이 있습니다.'
  }
]
```

## 게임성 수준

이 프로젝트는 경쟁형 게임이 아닙니다.

- 점수 없음
- 실패 없음
- 시간 제한 없음
- 공격 없음
- 복잡한 퀘스트 없음

대신 다음 감각을 강화합니다.

- 산책
- 발견
- 따뜻함
- 조용한 몰입
- 짧은 여운
