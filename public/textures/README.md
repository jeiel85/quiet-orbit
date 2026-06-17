# public/textures

텍스처 이미지 정적 에셋 폴더. Vercel 에서 `/textures/...` 경로로 제공됩니다.

- **현재(MVP)**: 비어 있음. 머티리얼은 단색 `meshStandardMaterial` 로만 구성합니다.
- **후속**: 행성/장식 텍스처를 여기에 두고 `useTexture("/textures/...")` 로 로드합니다.

## 규칙

| 용도 | 권장 크기 |
|---|---:|
| 작은 props | 256px |
| 행성 텍스처 | 512px ~ 1024px |
| 배경 이미지 | 1024px 이하부터 시작 |

- 포맷: 가능하면 **WebP** (용량 대비 품질)
- 파일명에 버전 포함: `planet-v001.webp`
