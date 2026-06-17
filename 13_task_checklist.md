# 13. Task Checklist

## Project Setup

- [ ] Next.js App Router 프로젝트 생성
- [ ] TypeScript 설정
- [ ] three 설치
- [ ] @react-three/fiber 설치
- [ ] @react-three/drei 설치
- [ ] zustand 설치
- [ ] import alias 설정
- [ ] 기본 CSS reset
- [ ] 전체 화면 layout 설정

## 3D Base

- [ ] Experience 컴포넌트 생성
- [ ] Canvas 전체 화면 표시
- [ ] Scene 컴포넌트 생성
- [ ] 기본 조명 추가
- [ ] 카메라 기본값 설정
- [ ] Suspense/Loading 구조 추가

## World

- [ ] Planet 컴포넌트 생성
- [ ] 행성 반지름 config화
- [ ] 행성 material 설정
- [ ] 장식 오브젝트 배치
- [ ] MessageOrb 위치 기준 확정

## Player

- [ ] Player 컴포넌트 생성
- [ ] primitive avatar 구현
- [ ] 키보드 입력 연결
- [ ] 행성 표면 이동 구현
- [ ] 방향 회전 구현
- [ ] idle/move 상태 분리

## Camera

- [ ] CameraRig 생성
- [ ] player target 추적
- [ ] 부드러운 lerp 적용
- [ ] 모바일 카메라 거리 조정
- [ ] 패널 열림 시 카메라 충돌 없는지 확인

## Message System

- [ ] Message 타입 정의
- [ ] messages config 작성
- [ ] MessageOrb 렌더링
- [ ] 거리 감지
- [ ] activeMessageId store 연결
- [ ] InteractionHint 표시
- [ ] MessagePanel 표시
- [ ] 읽음 처리
- [ ] localStorage 저장
- [ ] 새로고침 후 복원

## Mobile

- [ ] 모바일 디바이스 감지
- [ ] MobileJoystick 생성
- [ ] 터치 입력 store 연결
- [ ] 모바일 패널 UI 조정
- [ ] viewport height 이슈 확인
- [ ] iOS Safari 테스트

## Polish

- [ ] IntroOverlay 추가
- [ ] 메시지 orb pulse
- [ ] camera smoothing
- [ ] player bobbing
- [ ] gentle background
- [ ] optional sound structure
- [ ] reduce motion 대응

## Performance

- [ ] Canvas dpr 제한
- [ ] 불필요한 post-processing 제거
- [ ] 모바일 shadow 제한
- [ ] texture 크기 확인
- [ ] GLB 사용 시 크기 확인
- [ ] build bundle 확인

## Deployment

- [ ] npm run build 통과
- [ ] npm run lint 통과
- [ ] README 작성
- [ ] Vercel preview 확인
- [ ] production deploy 확인
- [ ] 모바일 브라우저 실제 접속 확인
