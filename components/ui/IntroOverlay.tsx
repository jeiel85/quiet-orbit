import { useGameStore } from "@/store/useGameStore";
import { useSettingsStore } from "@/store/useSettingsStore";

/**
 * 시작 화면 — 간단한 안내 + Start 버튼.
 * Start 를 누르면 useGameStore.start() 로 산책을 시작하고 오버레이가 fade out 된다.
 * (접근성: 텍스트 설명 제공, 키보드 포커스 가능한 버튼)
 */
export default function IntroOverlay() {
  const started = useGameStore((s) => s.started);
  const start = useGameStore((s) => s.start);
  const isTouch = useSettingsStore((s) => s.isTouch);

  return (
    <div
      className={`absolute inset-0 z-20 flex items-center justify-center bg-[color:var(--color-sky)]/70 backdrop-blur-md transition-opacity duration-700 ${
        started ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"
      }`}
      aria-hidden={started}
    >
      <div className="mx-6 max-w-sm text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--color-shadow)]">
          Quiet Orbit
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-[color:var(--color-text)]">
          작은 행성 산책
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--color-text)]/80">
          작은 행성 위를 천천히 거닐며 빛나는 메시지를 발견해 보세요. 서두를 필요는
          없어요.
        </p>
        <p className="mt-3 text-sm text-[color:var(--color-text)]/60">
          {isTouch ? "왼쪽 아래 조이스틱으로 이동 · 메시지를 탭해서 열기" : "WASD · 방향키로 이동 · Space 로 메시지 열기"}
        </p>

        <button
          type="button"
          onClick={start}
          className="mt-8 rounded-full bg-[color:var(--color-accent)] px-8 py-3 text-sm font-medium text-[color:var(--color-text)] shadow-lg transition active:scale-[0.98]"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
