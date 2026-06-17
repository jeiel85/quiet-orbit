// 사운드는 MVP 선택 사항 — 여기서는 "구조만" 제공한다(요구사항 12).
// 실제 재생은 후속에서 public/audio 에 파일을 추가하고 WebAudio/HTMLAudioElement 로 구현.
// 자동재생 정책 때문에 첫 사용자 제스처(Start 클릭) 이후에만 활성화한다.

export type SoundName = "chime" | "ambient";

let enabled = false;

export const soundManager = {
  /** 사운드 on/off. Start(첫 제스처) 이후 설정값에 맞춰 호출. */
  setEnabled(value: boolean): void {
    enabled = value;
  },
  isEnabled(): boolean {
    return enabled;
  },
  /** 효과음 재생 (현재는 no-op 스텁). */
  play(name: SoundName): void {
    if (!enabled) return;
    // TODO(후속): public/audio/${name}.* 로드 후 재생. 낮은 볼륨 ambient + 열람 시 chime.
    void name;
  },
};
