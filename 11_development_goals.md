# 11. Development Goals for Vibe Coding

아래 Goal을 순서대로 개발 도구에 넣어 진행합니다. 한 번에 너무 많은 것을 요청하지 않고, 각 단계가 실행 가능한 상태를 유지하는 것이 중요합니다.

---

# Goal 1. Project Scaffold and Fullscreen 3D Canvas

```md
Next.js App Router + TypeScript 기반 프로젝트를 생성하고, 전체 화면 3D WebGL Canvas가 표시되는 초기 구조를 만들어줘.

기술 스택:
- Next.js App Router
- TypeScript
- three
- @react-three/fiber
- @react-three/drei
- zustand

요구사항:
1. app/layout.tsx, app/page.tsx, app/globals.css를 구성한다.
2. components/experience/Experience.tsx를 만들고 Canvas를 전체 화면으로 표시한다.
3. components/experience/Scene.tsx를 만들고 기본 조명, 테스트 sphere, 카메라를 구성한다.
4. UI 오버레이를 올릴 수 있는 구조를 만든다.
5. 모바일/데스크톱에서 viewport가 깨지지 않게 한다.
6. npm run dev, npm run build가 통과해야 한다.
7. 3D 관련 컴포넌트는 client component로 분리한다.
8. Vercel 배포 가능한 구조로 만든다.

이번 단계에서는 플레이어 이동, 메시지, 멀티플레이는 구현하지 않는다.

산출물:
- 폴더 구조
- 전체 코드
- 실행 방법
- 다음 단계에서 이어갈 TODO
```

---

# Goal 2. Planet, Player Movement, and Camera Rig

```md
현재 Next.js + React Three Fiber 프로젝트에 작은 행성, 플레이어, 3인칭 카메라 추적 시스템을 구현해줘.

요구사항:
1. components/world/Planet.tsx를 만든다.
2. 행성은 sphereGeometry 기반으로 시작한다.
3. components/player/Player.tsx를 만든다.
4. 플레이어는 primitive geometry로 단순하게 표현한다.
5. WASD/방향키 입력으로 플레이어가 움직인다.
6. 플레이어는 행성 표면 위를 이동하는 것처럼 보이게 한다.
7. 완전한 물리 엔진은 쓰지 않는다.
8. components/player/CameraRig.tsx를 만들고 카메라가 플레이어를 부드럽게 따라가게 한다.
9. 이동/카메라 계산 로직은 나중에 교체하기 쉽도록 분리한다.
10. 모바일 조작은 아직 구현하지 않아도 되지만 구조는 고려한다.

중요:
- 코드가 복잡해지면 lib/math/sphericalMovement.ts로 수학 로직을 분리한다.
- 프레임마다 불필요한 React state 업데이트를 하지 않는다.
- useFrame 안에서는 ref 기반 업데이트를 우선한다.

산출물:
- 수정/추가 파일 전체 코드
- 이동 로직 설명
- 알려진 한계
- 다음 단계 TODO
```

---

# Goal 3. Message Orbs, Interaction UI, and localStorage Progress

```md
작은 행성 위에 Message Orb를 배치하고, 사용자가 가까이 가면 메시지를 열 수 있는 상호작용 시스템을 구현해줘.

요구사항:
1. config/messages.ts에 메시지 데이터를 정의한다.
2. types/message.ts에 Message 타입을 정의한다.
3. components/world/MessageOrb.tsx를 만든다.
4. components/world/MessageOrbGroup.tsx를 만든다.
5. 메시지 위치는 theta/phi 기반 구면 좌표로 관리한다.
6. 플레이어가 Orb 근처에 가면 InteractionHint를 표시한다.
7. Space/Enter 또는 클릭/탭으로 메시지 패널을 연다.
8. components/ui/MessagePanel.tsx를 만든다.
9. 메시지를 열면 read 상태로 저장한다.
10. read 상태는 localStorage에 저장하고 새로고침 후에도 유지한다.
11. zustand store를 사용해 activeMessageId, openedMessageId, readMessageIds를 관리한다.
12. read/unread 상태에 따라 Orb 시각 표현을 다르게 한다.

이번 단계에서는 서버 저장, 로그인, 멀티플레이는 구현하지 않는다.

산출물:
- 추가/수정 파일 전체 코드
- 상태 흐름 설명
- 테스트 방법
```

---

# Goal 4. Mobile Controls, Visual Polish, and Performance Pass

```md
현재 3D 행성 산책 웹사이트에 모바일 조작, 인트로 오버레이, 시각적 폴리싱, 기본 성능 최적화를 추가해줘.

요구사항:
1. components/controls/MobileJoystick.tsx를 만든다.
2. 터치 디바이스에서 모바일 조이스틱을 표시한다.
3. 조이스틱 입력을 Player 이동에 연결한다.
4. components/ui/IntroOverlay.tsx를 만든다.
5. 시작 전 간단한 안내와 Start 버튼을 표시한다.
6. MessagePanel은 모바일에서 bottom sheet처럼 보이게 한다.
7. 데스크톱에서는 적당한 floating panel로 보이게 한다.
8. 행성 위에 단순한 나무/돌/작은 집 같은 장식 오브젝트를 추가한다.
9. 메시지 Orb에 부드러운 floating/pulse 애니메이션을 추가한다.
10. Canvas dpr을 제한하고 모바일에서 과도한 효과를 끈다.
11. reduce motion 설정을 고려한다.
12. 사운드는 선택 사항으로 구조만 만들어도 된다.

주의:
- 원본 사이트와 같은 디자인을 복제하지 말고 독립적인 분위기로 만든다.
- 성능을 해치는 heavy post-processing은 넣지 않는다.
- primitive geometry 중심으로 유지한다.

산출물:
- 추가/수정 파일 전체 코드
- 모바일 테스트 방법
- 성능 체크 포인트
```

---

# Goal 5. Vercel Deployment Readiness and Future Online Extension Hooks

```md
현재 프로젝트를 Vercel 배포에 적합하게 정리하고, 후속 온라인 확장을 위한 구조를 준비해줘.

요구사항:
1. npm run build가 통과하도록 오류를 정리한다.
2. lint/type 오류를 최대한 제거한다.
3. README.md에 설치/실행/배포 방법을 작성한다.
4. public/models, public/textures, public/audio 폴더의 README를 정리한다.
5. config/messages.ts와 store 구조가 나중에 Supabase/PartyKit으로 확장 가능하도록 정리한다.
6. lib/storage/localProgress.ts에 localStorage 접근 로직을 모은다.
7. 온라인 확장을 위한 types/online.ts를 추가하되 실제 서버 연동은 하지 않는다.
8. Vercel 배포 시 주의사항을 문서화한다.
9. 원본 사이트 복제가 아니라 독립 프로젝트라는 점을 README에 명시한다.

산출물:
- 배포 전 최종 코드
- README
- Vercel 배포 절차
- 후속 확장 TODO
```
