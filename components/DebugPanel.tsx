"use client";

import { useState } from "react";
import { useCareerStore } from "@/store/careerStore";
import { CAREER_EVENT_KEYS, type CareerEventKey } from "@/lib/sim/careerEvents";
import { PERSONALITY_TRAITS, TALENT_TIERS, type PersonalityTrait, type TalentTier } from "@/lib/sim/constants";

/**
 * Whether the debug tools are allowed to exist at all.
 *
 * These mutators hand out overall, trophies and talent tier for free, so a
 * production build must not ship them — anyone could open the panel and give
 * themselves a perfect career, which makes every number in the game
 * meaningless. Both checks are compile-time constants, so the whole component
 * is dropped from the bundle rather than merely hidden. Set
 * NEXT_PUBLIC_CRAQUE_DEBUG=1 to opt a production build back in on purpose.
 */
const DEBUG_ENABLED =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_CRAQUE_DEBUG === "1";

/**
 * Dev-only testing tool — never part of the intended play loop. Lets you jump
 * straight to situations that are otherwise rare or slow to reach (a specific
 * career event, a transfer window, an OVR swing) without playing dozens of
 * seasons to get there. Collapsed by default so it doesn't get in the way.
 */
export function DebugPanel() {
  const career = useCareerStore((s) => s.career);
  const adjustOverall = useCareerStore((s) => s.debugAdjustOverall);
  const forceTransfer = useCareerStore((s) => s.debugForceTransfer);
  const forceEvent = useCareerStore((s) => s.debugForceEvent);
  const skipDecision = useCareerStore((s) => s.debugSkipDecision);
  const setTrait = useCareerStore((s) => s.debugSetTrait);
  const setTalentTier = useCareerStore((s) => s.debugSetTalentTier);
  const adjustFanSupport = useCareerStore((s) => s.debugAdjustFanSupport);
  const forceRival = useCareerStore((s) => s.debugForceRival);
  const [open, setOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<CareerEventKey>(CAREER_EVENT_KEYS[0]);
  const [selectedTrait, setSelectedTrait] = useState<PersonalityTrait>(PERSONALITY_TRAITS[0].trait);
  const [selectedTier, setSelectedTier] = useState<TalentTier>(TALENT_TIERS[0].tier);

  if (!DEBUG_ENABLED) return null;
  if (!career) return null;

  return (
    <div className="fixed bottom-3 left-3 z-[60]">
      {open ? (
        <div className="max-h-[85vh] w-80 overflow-y-auto rounded-xl border border-danger/40 bg-surface p-3 text-xs shadow-2xl">
          <div className="flex items-center justify-between">
            <p className="font-display text-xs font-black uppercase tracking-wide text-danger">Debug</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-2 py-0.5 text-muted-2 hover:text-foreground"
            >
              ✕
            </button>
          </div>

          <p className="mt-1.5 text-[11px] text-muted-2">
            OVR {career.player.overall} · idade {career.player.age} · torcida {Math.round(career.fanSupport)} · rival{" "}
            {career.rival?.name ?? "—"}
          </p>

          <div className="mt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-2">OVR</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {[-15, -5, 5, 15].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => adjustOverall(delta)}
                  className="rounded-md border border-line bg-surface-2/60 px-2 py-1 text-[11px] font-bold hover:border-danger/60"
                >
                  {delta > 0 ? `+${delta}` : delta}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-2">Torcida</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {[-20, -5, 5, 20].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => adjustFanSupport(delta)}
                  className="rounded-md border border-line bg-surface-2/60 px-2 py-1 text-[11px] font-bold hover:border-danger/60"
                >
                  {delta > 0 ? `+${delta}` : delta}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-2">Perfil (traço)</p>
            <div className="mt-1 flex gap-1.5">
              <select
                value={selectedTrait}
                onChange={(e) => setSelectedTrait(e.target.value as PersonalityTrait)}
                className="min-w-0 flex-1 rounded-md border border-line bg-surface-2/60 px-1.5 py-1 text-[11px]"
              >
                {PERSONALITY_TRAITS.map(({ trait }) => (
                  <option key={trait} value={trait}>
                    {trait}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setTrait(selectedTrait)}
                className="shrink-0 rounded-md border border-danger/50 bg-danger/10 px-2 py-1 text-[11px] font-bold text-danger hover:bg-danger/20"
              >
                Aplicar
              </button>
            </div>
          </div>

          <div className="mt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-2">Talento</p>
            <div className="mt-1 flex gap-1.5">
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value as TalentTier)}
                className="min-w-0 flex-1 rounded-md border border-line bg-surface-2/60 px-1.5 py-1 text-[11px]"
              >
                {TALENT_TIERS.map(({ tier }) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setTalentTier(selectedTier)}
                className="shrink-0 rounded-md border border-danger/50 bg-danger/10 px-2 py-1 text-[11px] font-bold text-danger hover:bg-danger/20"
              >
                Aplicar
              </button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={skipDecision}
              className="rounded-md border border-line bg-surface-2/60 px-2 py-1 text-[11px] font-bold hover:border-danger/60"
            >
              Pular decisão atual
            </button>
            <button
              type="button"
              onClick={forceTransfer}
              className="rounded-md border border-line bg-surface-2/60 px-2 py-1 text-[11px] font-bold hover:border-danger/60"
            >
              Forçar transferência
            </button>
            <button
              type="button"
              onClick={forceRival}
              disabled={Boolean(career.rival)}
              className="rounded-md border border-line bg-surface-2/60 px-2 py-1 text-[11px] font-bold hover:border-danger/60 disabled:opacity-40"
            >
              Forçar rival agora
            </button>
          </div>

          <div className="mt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-2">Forçar evento</p>
            <div className="mt-1 flex gap-1.5">
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value as CareerEventKey)}
                className="min-w-0 flex-1 rounded-md border border-line bg-surface-2/60 px-1.5 py-1 text-[11px]"
              >
                {CAREER_EVENT_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => forceEvent(selectedKey)}
                className="shrink-0 rounded-md border border-danger/50 bg-danger/10 px-2 py-1 text-[11px] font-bold text-danger hover:bg-danger/20"
              >
                Forçar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir painel de debug"
          title="Debug"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-danger/40 bg-surface text-base shadow-lg hover:border-danger"
        >
          🐞
        </button>
      )}
    </div>
  );
}
