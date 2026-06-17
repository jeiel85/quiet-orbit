# Messenger-inspired Planet Web Design Bundle

이 문서는 `messenger.abeto.co` 같은 고품질 브라우저 3D 경험을 **직접 복제하지 않고**, 감성적인 작은 행성 산책 웹사이트로 벤치마킹하기 위한 설계 묶음입니다.

## 핵심 방향

- **1차 목표:** 스탠드얼론 3D WebGL 웹사이트
- **배포:** Vercel
- **프론트엔드:** Next.js App Router + TypeScript
- **3D:** Three.js + React Three Fiber + drei
- **상태관리:** zustand
- **저장:** 1차는 localStorage
- **온라인 확장:** Supabase / PartyKit은 후속 단계
- **금지:** 원본 사이트의 브랜드, 텍스트, 에셋, 캐릭터, 레벨 구조 복제

## 이 묶음의 사용법

1. `12_master_prompt.md`를 먼저 개발 도구에 넣어 전체 방향을 잡습니다.
2. 실제 구현은 `11_development_goals.md`의 Goal 1~5 순서로 진행합니다.
3. 구현 중 헷갈리는 구조는 `03_folder_structure.md`, `04_component_design.md`, `07_data_model_and_state.md`를 기준으로 맞춥니다.
4. 배포 전에는 `15_testing_checklist.md`와 `09_deployment_vercel.md`를 확인합니다.

## 추천 구현 순서

```txt
Goal 1: 프로젝트 스캐폴딩 + 전체 화면 Canvas
Goal 2: 작은 행성 + 플레이어 + 카메라
Goal 3: Message Orb + 상호작용 UI + localStorage
Goal 4: 모바일 조작 + 비주얼 폴리싱 + 성능 최적화
Goal 5: Vercel 배포 + 후속 온라인 확장 준비
```

## 산출 기준

최초 완성 버전은 다음 수준이면 충분합니다.

- 브라우저에서 전체 화면 3D 공간이 열린다.
- 작은 행성 위를 캐릭터가 움직인다.
- 카메라가 캐릭터를 부드럽게 따라간다.
- 메시지 오브젝트 근처에 가면 상호작용이 가능하다.
- 읽은 메시지는 새로고침 후에도 유지된다.
- 모바일에서도 최소한의 조작이 가능하다.
- Vercel에 배포 가능하다.

## 작성일

- 2026-06-17
