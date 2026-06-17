# 06. Visual Art Direction

## 전체 무드

- 몽글몽글함
- 따뜻함
- 조용한 산책
- 작은 행성
- 밤하늘 또는 새벽빛
- 로우폴리와 부드러운 그라디언트의 중간 지점

## 피해야 할 방향

- 원본 사이트와 너무 비슷한 캐릭터/색감
- 과도한 네온
- 사이버펑크
- 현실적인 고사양 3D
- 복잡한 UI
- 전투 게임 같은 느낌

## 컬러 팔레트 후보

### Warm Dawn

```txt
Background: #F8EFE3
Sky:        #CFE8F7
Ground:     #BFD8B8
Accent:     #F2C879
Text:       #2E2A27
Shadow:     #7C8A78
```

### Quiet Night

```txt
Background: #101827
Sky:        #1D2B45
Ground:     #5E8C77
Accent:     #F5D487
Text:       #F6F0DF
Shadow:     #0A0F1A
```

### Yoonseul Blue

```txt
Background: #EAF7FA
Sky:        #BDEAF2
Ground:     #B9DDBE
Accent:     #F7C76B
Text:       #25323A
Shadow:     #7293A0
```

## 1차 추천 팔레트

`Yoonseul Blue`를 추천합니다. 사용자의 기존 프로젝트명인 윤슬 낚시 게임과도 연결하기 쉽고, 웹 포트폴리오로 확장하기 좋습니다.

## 모델 스타일

초기에는 primitive geometry로 시작합니다.

- 행성: sphereGeometry
- 플레이어: capsule 또는 rounded box 느낌
- 나무: cone + cylinder
- 집: box + cone roof
- 메시지: emissive sphere
- 길: curve 또는 작은 점 오브젝트

후속 버전에서 GLB 모델로 교체합니다.

## UI 스타일

- 큰 카드보다 얇고 부드러운 패널
- border radius 크게
- glassmorphism은 과하지 않게
- 텍스트는 짧고 여백을 넓게
- 모바일은 bottom sheet
- 데스크톱은 우측 또는 중앙 floating panel

## 애니메이션

권장:

- 메시지 orb floating
- active orb scale pulse
- camera smooth follow
- intro fade out
- message panel slide up
- player idle bobbing

피함:

- 화면을 많이 흔드는 효과
- 과한 bloom
- 빠른 zoom
- 반복적으로 눈부신 애니메이션

## 사운드 방향

선택 사항입니다. 넣는다면:

- 낮은 볼륨의 ambient pad
- 메시지 열 때 작은 bell/chime
- 발자국 소리는 생략 가능
- 자동 재생 정책 때문에 첫 클릭 이후 시작
