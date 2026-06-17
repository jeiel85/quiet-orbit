# 02. Technical Architecture

## 기본 아키텍처

```txt
Browser
 └─ Next.js App Router
     ├─ React UI Layer
     ├─ React Three Fiber Canvas
     │   ├─ Scene
     │   ├─ Planet
     │   ├─ Player
     │   ├─ CameraRig
     │   ├─ MessageOrb
     │   └─ Effects
     ├─ Zustand Store
     └─ localStorage Persistence
```

## 기술 선택

### Next.js App Router

선택 이유:

- Vercel 배포와 궁합이 좋음
- 페이지, 레이아웃, 메타데이터 관리가 쉬움
- 추후 API Route, Server Action, DB 연동으로 확장 가능
- 일반 React UI와 3D Canvas를 함께 구성하기 좋음

### TypeScript

선택 이유:

- 3D 좌표, 메시지 데이터, 상태 모델을 명확히 관리
- 바이브 코딩으로 생성된 코드의 오류를 줄이는 데 유리
- 컴포넌트 경계가 명확해짐

### Three.js + React Three Fiber

선택 이유:

- WebGL 기반 3D 경험 구현 가능
- React 컴포넌트처럼 Scene을 구성 가능
- 상태 변경과 3D 오브젝트 반응을 연결하기 쉬움

### drei

선택 이유:

- Environment, OrbitControls, Html, Text, useGLTF 등 자주 쓰는 유틸 제공
- 직접 구현량 감소
- 프로토타이핑 속도 향상

### zustand

선택 이유:

- 전역 상태를 가볍게 관리 가능
- Player, UI, Message 상태를 분리하기 쉬움
- localStorage persistence와 궁합이 좋음

## 런타임 구성

```txt
Client Only
 ├─ 3D Rendering
 ├─ Input Handling
 ├─ Player Movement
 ├─ Camera Follow
 ├─ Message Interaction
 └─ localStorage
```

3D Canvas 관련 컴포넌트는 브라우저 API에 의존하므로 `use client` 컴포넌트로 분리합니다.

## SSR 주의사항

Three.js와 React Three Fiber는 `window`, `canvas`, WebGL context에 의존합니다. 따라서 3D Experience 진입점은 다음 중 하나로 구성합니다.

```tsx
'use client'

import dynamic from 'next/dynamic'

const Experience = dynamic(() => import('@/components/experience/Experience'), {
  ssr: false,
})
```

또는 `page.tsx`는 서버 컴포넌트로 두고, 내부에서 클라이언트 전용 컴포넌트를 호출합니다.

## 데이터 흐름

```txt
Input
 └─ useInputStore
     └─ Player
         ├─ position update
         ├─ nearest message check
         └─ CameraRig target update

MessageOrb
 └─ distance check
     └─ useWorldStore.activeMessageId

InteractionUI
 └─ open message
     └─ useMessageStore.markAsRead()
         └─ localStorage
```

## 서버 필요 여부

MVP에서는 서버가 필요 없습니다.

- 메시지 목록은 정적 파일 또는 TypeScript 상수
- 읽음 상태는 localStorage
- 배포는 Vercel 정적/프론트 중심

후속 버전에서 방명록이나 방문자 흔적을 넣을 때 DB를 붙입니다.
