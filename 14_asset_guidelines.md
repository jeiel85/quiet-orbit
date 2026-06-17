# 14. Asset Guidelines

## 기본 원칙

초기 MVP는 에셋 의존도를 낮춥니다. 먼저 primitive geometry로 완성한 뒤, 나중에 GLB/텍스처를 교체합니다.

## 파일 형식

| 용도 | 권장 형식 |
|---|---|
| 3D 모델 | .glb |
| 텍스처 | .webp / .png |
| 배경 이미지 | .webp |
| 오디오 | .mp3 / .ogg |
| 아이콘 | .svg |

## 3D 모델 기준

- low poly
- 1개 모델 1MB 이하 목표
- 캐릭터 애니메이션은 후순위
- 텍스처 통합 권장
- 지나치게 많은 bone/mesh 피하기

## 모델 후보

### Player

초기:

- capsule
- sphere + cylinder
- rounded low-poly character

후속:

- tiny traveler
- small childlike avatar
- paper messenger
- glowing seed character

### Planet

초기:

- simple sphere
- flat shaded sphere

후속:

- small island planet
- grass patches
- tiny water ring
- paper road
- mailbox hill

### Props

- tiny tree
- stone
- mailbox
- bench
- lantern
- small house
- flower cluster
- signpost

## 텍스처 기준

- 처음에는 material color만 사용
- 필요 시 512px WebP
- normal/roughness map은 후순위
- 모바일 성능을 우선

## 사운드 기준

- 자동재생 정책 때문에 첫 사용자 입력 후 재생
- 기본 볼륨 낮게
- 설정에서 on/off 가능
- 사운드 없이도 경험이 완성되어야 함

## 라이선스 주의

- 원본 사이트의 에셋을 추출하거나 사용하지 않음
- 무료 에셋 사용 시 라이선스 확인
- 상업적 사용 가능 여부 확인
- 출처 표기 필요 여부 확인
- 직접 생성한 에셋도 원본과 혼동되지 않게 제작

## 에셋 네이밍

```txt
player-v001.glb
planet-v001.glb
tree-small-v001.glb
orb-unread-v001.webp
ambient-soft-v001.mp3
```

## public 폴더 구조

```txt
public/
  models/
    player-v001.glb
    planet-v001.glb
    props-v001.glb

  textures/
    planet-grass-v001.webp
    orb-glow-v001.webp

  audio/
    ambient-soft-v001.mp3
    open-message-v001.mp3
```
