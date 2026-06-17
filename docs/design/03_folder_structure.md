# 03. Folder Structure

## 추천 폴더 구조

```txt
messenger-planet-web/
  app/
    globals.css
    layout.tsx
    page.tsx

  components/
    experience/
      Experience.tsx
      Scene.tsx
      Lighting.tsx
      Effects.tsx

    world/
      Planet.tsx
      PlanetProps.tsx
      MessageOrb.tsx
      MessageOrbGroup.tsx
      DecorativeObject.tsx

    player/
      Player.tsx
      PlayerAvatar.tsx
      PlayerController.tsx
      CameraRig.tsx

    controls/
      KeyboardControls.tsx
      MobileJoystick.tsx
      useKeyboardInput.ts
      usePointerInput.ts

    ui/
      IntroOverlay.tsx
      InteractionHint.tsx
      MessagePanel.tsx
      SettingsPanel.tsx
      LoadingScreen.tsx

  config/
    worldConfig.ts
    messages.ts
    theme.ts

  lib/
    math/
      sphericalMovement.ts
      vector.ts
      easing.ts

    storage/
      localProgress.ts

    constants.ts

  store/
    useGameStore.ts
    useInputStore.ts
    useMessageStore.ts
    useSettingsStore.ts

  types/
    world.ts
    message.ts
    input.ts

  public/
    models/
      README.md
    textures/
      README.md
    audio/
      README.md

  docs/
    design/
      README.md

  package.json
  tsconfig.json
  next.config.ts
  .eslintrc.json
  .gitignore
```

## 폴더별 역할

### app

Next.js App Router 엔트리입니다. `page.tsx`는 화면 진입점만 담당하고, 실제 3D 로직은 `components/experience`로 분리합니다.

### components/experience

3D Canvas와 전체 Scene을 구성합니다.

- `Experience.tsx`: Canvas 생성
- `Scene.tsx`: 월드 구성
- `Lighting.tsx`: 조명
- `Effects.tsx`: 후처리 또는 분위기 효과

### components/world

행성, 메시지 오브젝트, 장식물을 담당합니다.

### components/player

플레이어 이동, 아바타 렌더링, 카메라 추적을 담당합니다.

### components/controls

데스크톱/모바일 입력을 담당합니다.

### components/ui

HTML 기반 UI 오버레이입니다. 3D Canvas 위에 표시되는 인트로, 메시지 패널, 상호작용 안내 등을 담당합니다.

### config

월드 설정과 메시지 데이터를 관리합니다.

### lib/math

구형 행성 이동, 벡터 보간, 카메라 보간 같은 수학 유틸을 관리합니다.

### store

zustand 전역 상태를 관리합니다.

### public

정적 에셋을 보관합니다. GLB 모델, 텍스처, 오디오 파일을 이곳에 둡니다.

## 네이밍 규칙

- 파일명은 영어 사용
- 컴포넌트는 PascalCase
- 훅은 `use` 접두사
- 설정 파일은 camelCase
- 타입 파일은 도메인명 기준

## import alias

`tsconfig.json`에 다음 alias를 권장합니다.

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```
