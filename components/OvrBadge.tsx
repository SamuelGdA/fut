/**
 * OVR badge tiers copied from the original: bronze < 70, silver 70-79,
 * gold 80-89, cyan 90-94, elite 95-98, and a special treatment at 99.
 */
export function ovrTierClasses(ovr: number): string {
  if (ovr >= 99) {
    return "bg-gradient-to-br from-fuchsia-200 via-violet-300 to-indigo-500 text-indigo-950 border-fuchsia-300/40 shadow-[0_0_14px_rgba(217,70,239,0.5)]";
  }
  if (ovr >= 95) {
    return "bg-gradient-to-br from-zinc-100 via-slate-200 to-slate-500 text-slate-950 border-slate-300/40 shadow-[0_0_10px_rgba(148,163,184,0.5)]";
  }
  if (ovr >= 90) {
    return "bg-gradient-to-br from-cyan-100 via-sky-200 to-blue-400 text-sky-950 border-cyan-300/40 shadow-[0_0_8px_rgba(56,189,248,0.4)]";
  }
  if (ovr >= 80) {
    return "bg-gradient-to-br from-amber-100 via-yellow-300 to-amber-500 text-amber-950 border-amber-300/40 shadow-[0_0_8px_rgba(245,158,11,0.35)]";
  }
  if (ovr >= 70) {
    return "bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-400 text-zinc-900 border-zinc-300/40";
  }
  return "bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800 text-amber-50 border-amber-500/40";
}

export function OvrBadge({
  ovr,
  label,
  size = "md",
}: {
  ovr: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "sm"
      ? "h-9 w-9 text-sm rounded-lg"
      : size === "lg"
        ? "h-20 w-20 text-4xl rounded-2xl"
        : "h-[68px] w-[68px] text-3xl rounded-2xl";

  return (
    <div
      className={`flex select-none flex-col items-center justify-center border font-black leading-none transition-all duration-300 ${dims} ${ovrTierClasses(ovr)}`}
    >
      <span>{ovr}</span>
      {size !== "sm" && label && (
        <span className="mt-0.5 text-[9px] font-bold tracking-widest opacity-70">{label}</span>
      )}
    </div>
  );
}
