# 08. Performance and Mobile Optimization

## 기본 원칙

3D 웹사이트는 모바일에서 성능 문제가 쉽게 발생합니다. MVP부터 다음 원칙을 적용합니다.

- draw call을 줄인다.
- 텍스처 크기를 작게 유지한다.
- 그림자 사용을 제한한다.
- geometry segment를 과하게 높이지 않는다.
- 불필요한 post-processing을 넣지 않는다.
- Canvas DPR을 제한한다.
- 모바일에서 bloom/SSAO 같은 효과는 꺼도 된다.

## Canvas 설정 권장

```tsx
<Canvas
  dpr={[1, 1.5]}
  gl={{
    antialias: true,
    powerPreference: 'high-performance',
  }}
  camera={{
    fov: 45,
    near: 0.1,
    far: 100,
    position: [0, 3, 7],
  }}
>
```

## geometry 기준

| 오브젝트 | 권장 |
|---|---|
| Planet | sphere segment 32 이하 |
| Player | capsule/primitive |
| Tree | cone/cylinder |
| Message Orb | sphere segment 16 이하 |
| Decorative props | instancing 고려 |

## 텍스처 기준

| 용도 | 권장 크기 |
|---|---:|
| 작은 props | 256px |
| 행성 텍스처 | 512px ~ 1024px |
| UI 이미지 | WebP |
| 배경 이미지 | 1024px 이하부터 시작 |

## 모델 기준

- GLB 사용
- Draco 압축은 필요할 때만
- 애니메이션 클립 수 최소화
- 첫 버전은 외부 모델 없이 primitive로 구현

## 모바일 최적화

모바일에서는 다음 옵션을 적용합니다.

- 카메라 거리 약간 증가
- 이동 속도 약간 감소
- post-processing off
- shadow off 또는 fake shadow 사용
- 메시지 패널은 bottom sheet
- pointer event와 UI 터치 충돌 방지

## 접근성

3D 사이트라도 기본 접근성은 고려합니다.

- 시작 화면에 텍스트 설명 제공
- 키보드 조작 가능
- 메시지 패널은 HTML로 렌더링
- `Esc`로 패널 닫기
- reduce motion 설정 감지
- 사운드 기본 off 또는 명확한 토글 제공

## 측정 기준

개발 중 확인할 항목:

```txt
Desktop Chrome
- 60fps 근접
- 메모리 증가 없음
- 새로고침 후 상태 정상

Android Chrome
- 터치 입력 정상
- 프레임 드랍 과도하지 않음
- UI 패널 스크롤 정상

iOS Safari
- Canvas 표시 정상
- 오디오 정책 문제 없음
- viewport height 문제 없음
```

## 성능 예산

초기 권장 예산:

| 항목 | 목표 |
|---|---:|
| JS bundle | 500KB~1.5MB 범위에서 관리 |
| 초기 에셋 | 3MB 이하 |
| 총 에셋 | 10MB 이하 |
| 첫 화면 표시 | 3초 이내 목표 |
| 모바일 FPS | 30fps 이상 |
