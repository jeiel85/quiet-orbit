"use client";

import { useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  AVATAR_PARTS,
  AVATAR_PART_LABELS,
  AVATAR_PRESETS,
  matchPresetId,
} from "@/lib/player/avatarAppearance";

/**
 * 인게임 설정 패널 — 우상단 톱니 버튼으로 연다.
 * - 외형: 큐레이션 프리셋 + 부위별 색(피부/머리/상의/하의/신발) 미세조정. 모션과 무관.
 * - 환경: 사운드 · 동작 줄이기 토글.
 * 오버레이는 pointer-events-none 이므로 이 컴포넌트만 자체적으로 pointer-events 를 켠다.
 */
export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const started = useGameStore((s) => s.started);
  const openedMessageId = useGameStore((s) => s.openedMessageId);
  const travel = useGameStore((s) => s.travel);

  const appearance = useSettingsStore((s) => s.appearance);
  const setAppearancePart = useSettingsStore((s) => s.setAppearancePart);
  const setAppearance = useSettingsStore((s) => s.setAppearance);
  const resetAppearance = useSettingsStore((s) => s.resetAppearance);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const setReduceMotion = useSettingsStore((s) => s.setReduceMotion);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);

  // 산책 시작 전이나 모달(메시지/이동) 중에는 톱니를 숨겨 화면을 비운다.
  if (!started || openedMessageId !== null || travel !== null) return null;

  const activePreset = matchPresetId(appearance);

  return (
    <div className="pointer-events-none absolute right-4 top-4 z-30 flex flex-col items-end gap-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="설정"
        aria-expanded={open}
        className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-[color:var(--color-sky)]/70 text-[color:var(--color-text)] shadow-lg backdrop-blur-md transition active:scale-95"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div className="pointer-events-auto w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-[color:var(--color-sky)]/80 p-4 text-[color:var(--color-text)] shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] opacity-60">외형</p>
            <button
              type="button"
              onClick={resetAppearance}
              className="rounded-full px-2 py-1 text-xs opacity-70 transition hover:opacity-100"
            >
              기본값으로
            </button>
          </div>

          {/* 프리셋 — 조화로운 외형 한 벌을 한 번에 적용 */}
          <div className="mt-3 flex flex-wrap gap-2">
            {AVATAR_PRESETS.map((preset) => {
              const active = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setAppearance(preset.colors)}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs transition ${
                    active
                      ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/30"
                      : "border-white/30 hover:border-white/60"
                  }`}
                >
                  <span className="flex">
                    {AVATAR_PARTS.map((part) => (
                      <span
                        key={part}
                        className="h-3 w-1.5 first:rounded-l-full last:rounded-r-full"
                        style={{ backgroundColor: preset.colors[part] }}
                      />
                    ))}
                  </span>
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* 부위별 미세조정 */}
          <div className="mt-4 grid grid-cols-1 gap-2">
            {AVATAR_PARTS.map((part) => (
              <label
                key={part}
                className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-1.5 text-sm"
              >
                <span>{AVATAR_PART_LABELS[part]}</span>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[11px] opacity-60">{appearance[part]}</span>
                  <input
                    type="color"
                    value={appearance[part]}
                    onChange={(e) => setAppearancePart(part, e.target.value)}
                    aria-label={`${AVATAR_PART_LABELS[part]} 색`}
                    className="h-7 w-7 cursor-pointer rounded-md border border-white/40 bg-transparent p-0"
                  />
                </span>
              </label>
            ))}
          </div>

          {/* 환경 토글 */}
          <p className="mt-4 text-xs uppercase tracking-[0.3em] opacity-60">환경</p>
          <div className="mt-2 flex flex-col gap-1.5">
            <ToggleRow label="사운드" checked={soundEnabled} onChange={setSoundEnabled} />
            <ToggleRow label="동작 줄이기" checked={reduceMotion} onChange={setReduceMotion} />
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-1.5 text-sm"
    >
      <span>{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition ${
          checked ? "bg-[color:var(--color-accent)]" : "bg-white/25"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
            checked ? "left-[1.125rem]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
