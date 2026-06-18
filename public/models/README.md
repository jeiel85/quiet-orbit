# public/models

3D 모델(GLB) 정적 에셋 폴더. Vercel 에서 `/models/...` 경로로 제공됩니다.

## 현재 사용 중

현재 사용 중인 GLB 모델은 없습니다.

플레이어 아바타(어린왕자)와 여우 컴패니언은 모두 코드로 만든 **primitive 지오메트리**입니다 —
GLB 로더를 거치지 않습니다. 관련 컴포넌트:

- [`components/player/PrimitivePrince.tsx`](../../components/player/PrimitivePrince.tsx) — 플레이어 아바타
- [`components/player/PrimitiveFox.tsx`](../../components/player/PrimitiveFox.tsx) — 여우 컴패니언(월드 데코)

> 초기 버전은 `Fox.glb`(Khronos glTF-Sample-Assets)를 플레이어로 썼지만,
> 어린왕자 테마 전환 이후 primitive 로 교체하면서 제거했습니다.

## 규칙

GLB 모델을 다시 도입한다면:

- 포맷: `.glb` (용량이 클 때만 Draco 압축)
- 캐시 무효화를 위해 파일명에 버전을 포함: `player-v001.glb`
- 모바일 성능을 위해 폴리곤 수와 애니메이션 클립 수를 최소화
- CC BY 등 표기 의무가 있는 에셋은 이 README 에 출처·라이선스를 명시
