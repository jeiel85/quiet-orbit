import { messages } from "@/config/messages";
import { useGameStore } from "@/store/useGameStore";

/**
 * 근처에 메시지가 있을 때 뜨는 안내 칩.
 * 패널이 열려 있으면 숨긴다. 클릭을 가로채지 않도록 pointer-events 는 끈 상태.
 */
export default function InteractionHint() {
  const started = useGameStore((s) => s.started);
  const activeId = useGameStore((s) => s.activeMessageId);
  const openedId = useGameStore((s) => s.openedMessageId);

  if (!started || !activeId || openedId) return null;
  const message = messages.find((m) => m.id === activeId);

  return (
    <div className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2">
      <div className="rounded-full bg-[color:var(--color-text)]/85 px-4 py-2 text-center text-sm text-[color:var(--color-background)] shadow-lg backdrop-blur-sm">
        {message ? <span className="opacity-70">‘{message.title}’ · </span> : null}
        <span className="font-medium">Space</span>
        <span className="opacity-70"> 또는 탭으로 열기</span>
      </div>
    </div>
  );
}
