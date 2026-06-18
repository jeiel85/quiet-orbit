<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Quiet Orbit — Agent Working Rules

작은 행성 위를 산책하며 빛나는 메시지 Orb 를 발견하는 스탠드얼론 감성 3D WebGL 웹사이트.
전체 설계 묶음은 `docs/design/` 참고 — 시작점은 `docs/design/README.md`,
구현 순서는 `docs/design/11_development_goals.md` (Goal 1~5).

## Tech Stack
- Next.js App Router + TypeScript
- Three.js + @react-three/fiber (v9) + @react-three/drei (v10)
- zustand
- Tailwind CSS v4
- localStorage (MVP 진행도 저장)
- Vercel 배포

## Hard Constraints
- MVP 에 멀티플레이 / 로그인 / 유료 API / 분석 SDK 를 넣지 않는다.
- 원본(messenger.abeto.co)의 경험 구조·인터랙션·레이아웃·분위기는 **자유롭게 참조**한다(영감 환영).
  다만 브랜드명·로고·상표, 실제 에셋(3D 모델·텍스처·일러스트), UI 그래픽, 원문 텍스트의
  **그대로 복제(verbatim)** 만 피한다 — 취향이 아니라 저작권·상표 리스크 회피선.
- 3D 경험은 클라이언트 전용으로 유지한다(서버 런타임 의존 금지).
- Vercel 에 배포 가능한 상태를 유지한다.

## Code Quality
- 컴포넌트는 작게, 도메인 단위로 분리.
- `useFrame` 안에서는 ref 기반 업데이트 우선 — 매 프레임 React state 갱신 금지.
- 수학 로직이 커지면 `lib/math` 로 분리.
- message / player / input / game 상태에 TypeScript 타입 사용.
- localStorage 파싱 오류는 graceful 하게 처리.
- 모바일 성능을 처음부터 고려.

## Implementation Order
1. Scaffold + 전체화면 Canvas — ✅ 완료
2. Planet + Player + CameraRig — ✅ 완료
3. Message Orb + 상호작용 UI + localStorage — ✅ 완료
4. 모바일 조작 + 비주얼 폴리싱 + 성능 — ✅ 완료
5. Vercel 배포 정리 + 온라인 확장 훅 — ✅ 완료

## Definition of Done (MVP)
- `npm run build` 통과
- 행성 위에서 플레이어 이동 가능
- 메시지 열람 가능
- 새로고침 후 읽음 상태 유지
- 모바일 조작 동작
- Vercel 배포 문서화
