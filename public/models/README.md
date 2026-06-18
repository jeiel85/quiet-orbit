# public/models

3D 모델(GLB) 정적 에셋 폴더. Vercel 에서 `/models/...` 경로로 제공됩니다.

## 현재 사용 중

- **`Fox.glb`** — 플레이어 캐릭터(걷기/대기 애니메이션 내장). 로드 실패 시
  primitive 여우로 자동 폴백([`components/player/PlayerAvatar.tsx`](../../components/player/PlayerAvatar.tsx)).
  로드 후 바운딩박스로 자동 스케일·발 안착([`FoxModel.tsx`](../../components/player/FoxModel.tsx)).

### 출처 / 라이선스 (Fox.glb)

> **Fox** by **PixelMannen** — 메시 **CC0**.
> 리깅 & 애니메이션 by **@tomkranis** — **CC BY 4.0**.
> glTF 변환 by **@AsoboStudio** & **@scurest**.
> 출처: Khronos **glTF-Sample-Assets** (`Models/Fox`).

CC BY 4.0 조건에 따라 위 출처를 표기합니다. 순수 CC0 자산으로 교체하려면 같은 경로에
다른 `.glb` 를 두고 `FoxModel.tsx` 의 `MODEL_URL` 만 바꾸면 됩니다(로더는 모델 비종속).

## 규칙

- 포맷: `.glb` (용량이 클 때만 Draco 압축)
- 캐시 무효화를 위해 파일명에 버전을 포함: `player-v001.glb`
- 모바일 성능을 위해 폴리곤 수와 애니메이션 클립 수를 최소화
