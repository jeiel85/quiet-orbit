/**
 * 3D 경험이 로드되기 전 표시되는 간단한 로딩 화면.
 * Experience 가 dynamic import 로 들어오는 동안 fallback 으로 쓰인다.
 */
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-sky)] text-[var(--color-text)]">
      <p className="animate-pulse text-sm tracking-[0.3em]">로딩 중…</p>
    </div>
  );
}
