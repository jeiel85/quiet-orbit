# Quiet Orbit

![Quiet Orbit](docs/preview.png)

작은 행성 위를 천천히 산책하며, 빛나는 메시지 조각(Orb)을 발견하는 **조용한 3D 웹 경험**입니다.
경쟁도 점수도 없이, 1분 남짓 머물며 따뜻한 흔적을 읽고 가는 스탠드얼론 인터랙티브 사이트를 목표로 합니다.

> 고품질 브라우저 3D 경험에서 *감성적 구조*만 벤치마킹한 **독립 프로젝트**입니다.
> 특정 사이트의 브랜드·캐릭터·에셋·맵·텍스트를 복제하지 않습니다.

🪐 **소개 페이지** · https://jeiel85.github.io/quiet-orbit/
📐 **설계 문서** · [`docs/design/`](docs/design/)

## 기술 스택

- **Next.js (App Router) + TypeScript**
- **Three.js + @react-three/fiber + @react-three/drei**
- **zustand** (전역 상태)
- **Tailwind CSS v4**
- **localStorage** (MVP 진행도 저장)
- **Vercel** 배포 (예정)

## 현재 상태

개발은 [`docs/design/11_development_goals.md`](docs/design/11_development_goals.md) 의 Goal 1~5 순서로 진행합니다.

- [x] **Goal 1** — 프로젝트 스캐폴딩 + 전체 화면 3D Canvas
- [ ] **Goal 2** — 행성 + 플레이어 + 3인칭 카메라
- [ ] **Goal 3** — 메시지 Orb + 상호작용 UI + localStorage
- [ ] **Goal 4** — 모바일 조작 + 비주얼 폴리싱 + 성능
- [ ] **Goal 5** — Vercel 배포 정리 + 온라인 확장 준비

## 로컬 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드 검증
npm run lint
```

## 폴더 구조 (요약)

```txt
app/                      Next.js 엔트리 (layout/page/globals.css/아이콘·OG 메타)
components/experience/    Canvas · Scene 등 3D 경험 구성
components/ui/            HTML 오버레이 UI
config/                   theme 등 설정값
docs/                     GitHub Pages 소개 페이지(index.html) + preview/favicon
docs/design/              제품·기술 설계 묶음 (00~17, AGENTS 등)
```

## 라이선스 · 출처

이 저장소의 코드와 비주얼 자산은 직접 제작한 것이며, 벤치마킹 대상 사이트의 어떤 저작물도
포함하지 않습니다. 자세한 작업 규칙은 [`AGENTS.md`](AGENTS.md) 를 참고하세요.
