# 04. Component Design

## Experience

역할:

- 전체 화면 Canvas 생성
- Suspense / 로딩 처리
- Scene 연결
- UI Overlay와 3D Layer 분리

책임 범위:

- Canvas camera 기본값
- dpr 제한
- performance 옵션
- WebGL context 설정

예상 구조:

```tsx
<Experience>
  <Canvas>
    <Scene />
  </Canvas>
  <IntroOverlay />
  <InteractionHint />
  <MessagePanel />
  <MobileJoystick />
</Experience>
```

## Scene

역할:

- 3D 월드의 최상위 구성
- 조명, 행성, 플레이어, 메시지 오브젝트 배치
- 개발 중 디버그 헬퍼 on/off

포함 요소:

- Lighting
- Planet
- Player
- CameraRig
- MessageOrbGroup
- DecorativeObject
- Effects

## Planet

역할:

- 행성 지형 렌더링
- 충돌/이동 기준 반지름 제공
- 메시지/오브젝트 배치 기준 좌표 제공

초기 구현:

- `sphereGeometry`
- `meshStandardMaterial`
- 색상은 따뜻한 녹색/베이지 계열
- low poly 느낌을 위해 `flatShading` 옵션 고려

후속 구현:

- GLB 행성 모델
- 텍스처 적용
- 섬, 길, 나무, 집, 우체통 추가

## Player

역할:

- 플레이어 위치/방향 계산
- 행성 표면 위 이동
- 입력에 따라 전진/회전
- 가까운 메시지 오브젝트 감지

초기 구현:

- capsule 또는 group primitive
- 애니메이션 없음
- 이동 시 살짝 bobbing

후속 구현:

- GLB 캐릭터
- 걷기/대기 애니메이션
- 시선 방향 보간

## CameraRig

역할:

- 플레이어를 부드럽게 따라가는 3인칭 카메라
- 행성 중심 기준 up vector 유지
- 카메라가 급격히 튀지 않도록 lerp/slerp 적용

기본 정책:

- 플레이어 뒤쪽 + 위쪽 위치 유지
- 카메라 타겟은 플레이어 머리 위
- 모바일에서는 카메라 거리를 약간 멀게

## MessageOrb

역할:

- 메시지 위치 표시
- 읽음/미읽음 상태에 따라 시각 차이 표시
- 플레이어가 가까이 오면 interaction target이 됨

상태:

- unread: 밝게 빛남
- active: 살짝 커짐
- read: 은은하게 작아짐

## MessagePanel

역할:

- 메시지 제목/본문 표시
- 닫기 버튼
- 읽음 처리
- 모바일에서 화면 하단 sheet 형태

## MobileJoystick

역할:

- 모바일 터치 입력 제공
- 터치 방향을 이동 벡터로 변환
- 화면 좌하단 고정

초기 정책:

- 데스크톱에서는 숨김
- 터치 디바이스에서 표시
- 조이스틱이 없어도 화면 드래그 이동을 fallback으로 제공
