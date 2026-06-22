# public/models

3D 모델(GLB) 정적 에셋 폴더. Vercel 에서 `/models/...` 경로로 제공됩니다.

## 현재 사용 중

### 플레이어

- `player-kenney-mini-male-a-v001.glb`
  - 출처: [Kenney Mini Characters](https://kenney.nl/assets/mini-characters)
  - 라이선스: Creative Commons CC0
  - 로컬 라이선스 사본: `kenney-mini-characters-license.txt`
  - 참조 텍스처: `Textures/colormap.png`
  - 사용처: [`components/player/PrimitivePrince.tsx`](../../components/player/PrimitivePrince.tsx)

### 코드 지오메트리

- [`components/player/PrimitiveFox.tsx`](../../components/player/PrimitiveFox.tsx) — 여우 컴패니언(월드 데코)

## 규칙

GLB 모델을 다시 도입한다면:

- 포맷: `.glb` (용량이 클 때만 Draco 압축)
- 캐시 무효화를 위해 파일명에 버전을 포함: `player-v001.glb`
- 모바일 성능을 위해 폴리곤 수와 애니메이션 클립 수를 최소화
- CC BY 등 표기 의무가 있는 에셋은 이 README 에 출처·라이선스를 명시
