# 15. Testing Checklist

## 로컬 실행

- [ ] `npm install` 성공
- [ ] `npm run dev` 성공
- [ ] 브라우저에서 첫 화면 표시
- [ ] 콘솔에 치명적 오류 없음
- [ ] 새로고침 후 정상 표시

## 빌드

- [ ] `npm run build` 성공
- [ ] TypeScript 오류 없음
- [ ] lint 오류 없음
- [ ] dynamic import/SSR 오류 없음
- [ ] Vercel preview build 성공

## 데스크톱 조작

- [ ] WASD 이동
- [ ] 방향키 이동
- [ ] Space/Enter 상호작용
- [ ] 메시지 패널 열림
- [ ] Esc 또는 닫기 버튼으로 닫힘
- [ ] 카메라가 부드럽게 따라감
- [ ] 행성 표면에서 플레이어가 튀지 않음

## 모바일 조작

- [ ] 모바일 viewport 정상
- [ ] 조이스틱 표시
- [ ] 터치 이동 가능
- [ ] 메시지 탭 가능
- [ ] MessagePanel이 화면 밖으로 나가지 않음
- [ ] iOS Safari에서 Canvas 표시
- [ ] Android Chrome에서 Canvas 표시

## 메시지 저장

- [ ] 메시지 열면 read 상태 변경
- [ ] read 스타일 적용
- [ ] 새로고침 후 read 상태 유지
- [ ] localStorage 데이터 삭제 시 초기화
- [ ] JSON 파싱 오류가 나도 앱이 죽지 않음

## 성능

- [ ] 데스크톱에서 부드럽게 동작
- [ ] 모바일에서 30fps 이상 체감
- [ ] 메모리 누수 의심 없음
- [ ] 탭 전환 후 복귀 정상
- [ ] 과도한 발열 없음
- [ ] 로딩이 너무 길지 않음

## 접근성

- [ ] 메시지 텍스트는 HTML로 읽을 수 있음
- [ ] 키보드만으로 기본 조작 가능
- [ ] 버튼에 aria-label 제공
- [ ] 색상 대비가 너무 낮지 않음
- [ ] reduce motion 사용자의 애니메이션 부담 완화

## 배포 후

- [ ] Vercel production URL 접속 가능
- [ ] 모바일 실제 기기 접속 가능
- [ ] static asset 404 없음
- [ ] Open Graph 이미지 필요 여부 확인
- [ ] favicon 확인
- [ ] title/description 확인
