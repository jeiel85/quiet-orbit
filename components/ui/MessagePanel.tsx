import { messages } from "@/config/messages";
import { useGameStore } from "@/store/useGameStore";

/**
 * 열린 메시지의 제목/본문을 보여주는 패널.
 * - 모바일: 화면 하단 sheet 형태 (items-end)
 * - 데스크톱: 가운데 floating 카드 (sm:items-center)
 * 배경(backdrop) 또는 닫기 버튼으로 닫는다. (Esc 는 useInteractionKeys 에서 처리)
 */
export default function MessagePanel() {
  const openedId = useGameStore((s) => s.openedMessageId);
  const closeMessage = useGameStore((s) => s.closeMessage);

  const message = openedId ? messages.find((m) => m.id === openedId) : null;
  if (!message) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-10 flex items-end justify-center sm:items-center">
      {/* backdrop */}
      <button
        type="button"
        aria-label="메시지 닫기"
        onClick={closeMessage}
        className="absolute inset-0 cursor-default bg-[color:var(--color-text)]/25 backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={message.title}
        className="relative w-full max-w-md rounded-t-3xl bg-[color:var(--color-background)] p-6 pb-8 shadow-2xl sm:rounded-3xl sm:p-8"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--color-shadow)]">
          Quiet Orbit
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[color:var(--color-text)]">
          {message.title}
        </h2>
        <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-[color:var(--color-text)]/85">
          {message.body}
        </p>

        <button
          type="button"
          onClick={closeMessage}
          className="mt-7 w-full rounded-full bg-[color:var(--color-accent)] px-5 py-3 text-sm font-medium text-[color:var(--color-text)] transition active:scale-[0.98]"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
