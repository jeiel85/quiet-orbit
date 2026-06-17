# 12. Master Prompt

아래 프롬프트는 프로젝트를 처음 시작할 때 사용하는 통합 프롬프트입니다.

```md
Next.js 기반의 감성적인 3D WebGL 웹사이트를 만들어줘.

목표는 messenger.abeto.co 같은 고품질 브라우저 3D 경험을 벤치마킹하되, 특정 디자인/브랜드/에셋/캐릭터/텍스트를 복제하지 않고 독립적인 분위기의 작은 3D 행성 산책 웹사이트를 만드는 것이다.

제품 콘셉트:
- 사용자가 작은 행성 위를 천천히 걸어다닌다.
- 행성 위에는 빛나는 Message Orb들이 있다.
- 사용자가 Orb 근처에 가면 짧은 메시지를 읽을 수 있다.
- 전체 분위기는 조용하고 몽글몽글하고 따뜻하다.
- 1차 버전은 스탠드얼론으로 동작한다.
- 멀티플레이는 이번 단계에서 구현하지 않는다.
- Vercel에 배포 가능해야 한다.

기술 스택:
- Next.js App Router
- TypeScript
- Three.js
- @react-three/fiber
- @react-three/drei
- zustand
- CSS Modules 또는 Tailwind 중 더 적합한 방식
- localStorage 기반 진행도 저장

핵심 기능:
1. 전체 화면 WebGL Canvas를 표시한다.
2. 작은 구형 행성 또는 둥근 섬을 표시한다.
3. 단순한 플레이어 아바타가 행성 위를 움직인다.
4. 데스크톱에서는 WASD/방향키로 이동한다.
5. 모바일에서는 터치 조이스틱 또는 드래그 기반 이동 UI를 제공한다.
6. 3인칭 카메라가 플레이어를 부드럽게 따라간다.
7. 행성 위에는 여러 Message Orb가 배치된다.
8. 사용자가 Orb 근처에 가면 상호작용 안내가 표시된다.
9. 클릭/탭/Space/Enter로 메시지 패널을 연다.
10. 읽은 메시지는 localStorage에 저장한다.
11. 새로고침 후에도 읽음 상태가 유지된다.
12. 모바일/데스크톱 반응형으로 동작한다.
13. 외부 유료 API, 로그인, 광고, 분석 SDK는 사용하지 않는다.
14. 모델은 처음에는 primitive geometry로 만들고, 추후 GLB로 교체 가능한 구조를 유지한다.
15. 원본 사이트와 혼동될 만한 이름, UI, 캐릭터, 맵, 텍스트를 사용하지 않는다.

구현 구조:
- app/
- components/experience/
- components/world/
- components/player/
- components/controls/
- components/ui/
- config/
- lib/math/
- lib/storage/
- store/
- types/
- public/models/
- public/textures/
- public/audio/

개발 원칙:
- 처음부터 완벽한 3D 게임 엔진을 만들지 않는다.
- MVP가 실행되는 것을 최우선으로 한다.
- 복잡한 물리 엔진은 도입하지 않는다.
- useFrame 안에서 React state 업데이트를 남발하지 않는다.
- 성능을 위해 Canvas dpr을 제한한다.
- 모바일에서 과한 후처리를 사용하지 않는다.
- 코드에는 유지보수 가능한 주석을 넣는다.
- 각 컴포넌트의 책임을 명확히 분리한다.

산출물:
1. 전체 폴더 구조
2. 주요 파일 전체 코드
3. 설치 방법
4. 실행 방법
5. Vercel 배포 방법
6. 구현된 기능 목록
7. 아직 구현하지 않은 기능 목록
8. 다음 단계 개발 TODO
```
