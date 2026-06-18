import { getPlanet } from "@/config/planets";
import { useGameStore } from "@/store/useGameStore";

export default function TravelOverlay() {
  const travel = useGameStore((s) => s.travel);
  if (!travel) return null;

  const target = getPlanet(travel.toPlanetId);

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      <div className="travel-warp absolute inset-0" />
      <div className="absolute inset-x-6 top-1/2 mx-auto max-w-sm -translate-y-1/2 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-white/70">orbit travel</p>
        <p className="mt-3 text-xl font-semibold text-white drop-shadow">{target.name}</p>
        <p className="mt-2 text-sm text-white/75">{target.subtitle}</p>
      </div>
    </div>
  );
}
