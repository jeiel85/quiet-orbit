# AGENTS.md

이 파일은 AI 코딩 에이전트가 이 프로젝트를 구현할 때 따라야 할 작업 규칙입니다.

## Project Summary

Build a standalone emotional 3D WebGL website inspired by high-quality browser 3D experiences, but do not copy any brand, assets, characters, UI, text, map, or proprietary creative expression from messenger.abeto.co.

## Tech Stack

- Next.js App Router
- TypeScript
- Three.js
- @react-three/fiber
- @react-three/drei
- zustand
- localStorage for MVP progress
- Vercel deployment

## Hard Constraints

- Do not implement multiplayer in MVP.
- Do not add login/auth.
- Do not add paid APIs.
- Do not add analytics SDKs.
- Do not copy original assets or visuals.
- Do not depend on server-only runtime for the 3D experience.
- Keep the 3D experience client-side.
- Keep the project deployable to Vercel.

## Code Quality

- Keep components small and domain-based.
- Prefer refs inside `useFrame` for per-frame updates.
- Avoid unnecessary React state updates every frame.
- Extract math utilities from components when they grow.
- Use TypeScript types for message, player, input, and game state.
- Handle localStorage parsing errors gracefully.
- Keep mobile performance in mind from the start.

## Implementation Order

1. Scaffold project and Canvas.
2. Add planet, player, and camera.
3. Add message orbs and interaction UI.
4. Add mobile controls and polish.
5. Prepare Vercel deployment.
6. Only then consider online extensions.

## Definition of Done

- `npm run build` passes.
- User can move on the planet.
- User can open messages.
- Read state persists after refresh.
- Mobile interaction works.
- Vercel deployment is documented.
