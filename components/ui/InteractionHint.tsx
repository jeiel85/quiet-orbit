import { messages } from "@/config/messages";
import { getPlanet, getTravelSpot } from "@/config/planets";
import { useGameStore } from "@/store/useGameStore";

/**
 * 근처에 메시지가 있을 때 뜨는 안내 칩.
 * 패널이 열려 있으면 숨긴다. 클릭을 가로채지 않도록 pointer-events 는 끈 상태.
 */
export default function InteractionHint() {
  const started = useGameStore((s) => s.started);
  const activeMessageId = useGameStore((s) => s.activeMessageId);
  const activeTravelSpotId = useGameStore((s) => s.activeTravelSpotId);
  const openedId = useGameStore((s) => s.openedMessageId);
  const travel = useGameStore((s) => s.travel);

  if (!started || openedId || travel) return null;

  const spot = getTravelSpot(activeTravelSpotId);
  if (spot) {
    const target = getPlanet(spot.targetPlanetId);
    return (
      <div className="pointer-events-auto absolute bottom-24 left-1/2 w-[min(calc(100vw-2rem),26rem)] -translate-x-1/2">
        <div className="interaction-card flex items-center justify-between gap-3 rounded-2xl bg-[color:var(--color-text)]/88 px-4 py-3 text-sm text-[color:var(--color-background)] shadow-lg backdrop-blur-sm">
          <div className="min-w-0">
            <p className="truncate font-medium">{spot.label}</p>
            <p className="mt-0.5 truncate text-xs opacity-70">{target.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => useGameStore.getState().beginTravel(spot)}
            className="shrink-0 rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-[color:var(--color-text)] transition hover:brightness-105 active:scale-[0.96]"
          >
            이동하기
          </button>
        </div>
      </div>
    );
  }

  if (!activeMessageId) return null;
  const message = messages.find((m) => m.id === activeMessageId);

  return (
    <div className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2">
      <div className="interaction-card rounded-full bg-[color:var(--color-text)]/85 px-4 py-2 text-center text-sm text-[color:var(--color-background)] shadow-lg backdrop-blur-sm">
        {message ? <span className="opacity-70">‘{message.title}’ · </span> : null}
        <span className="font-medium">Space</span>
        <span className="opacity-70"> 또는 탭으로 열기</span>
      </div>
    </div>
  );
}
