# 09. Deployment on Vercel

## 배포 전제

MVP는 Next.js 기반 정적/클라이언트 중심 웹사이트입니다. 따라서 Vercel에 배포하기 적합합니다.

## 배포 방식

### GitHub 연결 배포

1. GitHub 저장소 생성
2. 프로젝트 push
3. Vercel에서 New Project
4. GitHub repo import
5. Framework Preset: Next.js
6. Build Command: `next build`
7. Output 설정은 기본값 사용
8. Deploy

### Vercel CLI 배포

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

## 환경변수

MVP에서는 환경변수가 필요 없습니다.

후속 버전에서 Supabase를 붙이면 다음 변수를 사용합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

실시간 서버를 붙이면 다음 변수를 고려합니다.

```env
NEXT_PUBLIC_PARTYKIT_HOST=
```

## 주의사항

### WebSocket

Vercel Functions는 장시간 지속되는 WebSocket 서버로 쓰기 어렵습니다. 실시간 멀티플레이가 필요해지면 Vercel은 프론트 배포에 두고, WebSocket 계층은 별도 서비스로 분리합니다.

후보:

- PartyKit
- Supabase Realtime
- Ably
- Pusher
- Colyseus on Fly.io/Render/Railway

### Static Asset

GLB, 텍스처, 오디오 파일은 `public/` 아래에 두면 Vercel에서 정적 파일로 제공됩니다.

```txt
public/models/player.glb
public/textures/planet.webp
public/audio/ambient.mp3
```

### Cache

파일명이 바뀌지 않는 에셋은 브라우저 캐시가 오래 남을 수 있습니다. 버전명을 파일명에 포함하는 방식을 권장합니다.

```txt
planet-v001.glb
ambient-v001.mp3
```

## 배포 전 체크리스트

- `npm run build` 통과
- `npm run lint` 통과
- 모바일 viewport 확인
- localStorage 오류 처리 확인
- 사운드 자동재생 정책 확인
- 404 없는지 확인
- Vercel preview URL에서 WebGL 정상 실행 확인
