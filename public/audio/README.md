# public/audio

사운드 정적 에셋 폴더. Vercel 에서 `/audio/...` 경로로 제공됩니다.

- **현재(MVP)**: 비어 있음. 사운드는 구조만 존재합니다 — [`lib/audio/soundManager.ts`](../../lib/audio/soundManager.ts) 가 no-op 스텁이고 기본 off 입니다.
- **후속**: 오디오 파일을 여기에 두고 soundManager 에서 로드합니다.

## 방향 (설계 06)

- 낮은 볼륨의 ambient pad (`ambient-v001.mp3`)
- 메시지 열 때 작은 bell/chime (`chime-v001.mp3`)
- 발자국 소리는 생략 가능

## 주의

- **자동재생 정책**: 첫 사용자 제스처(Start 클릭) 이후에만 재생을 시작합니다.
- 접근성: 사운드는 기본 **off**, 명확한 토글을 제공합니다.
- 파일명에 버전 포함: `ambient-v001.mp3`
