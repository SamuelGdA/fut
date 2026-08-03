"use client";

import { useCallback, useEffect } from "react";
import { play, setMuted, type SoundName } from "./sfx";
import { useCareerStore } from "@/store/careerStore";

/** Keeps the synth in sync with the persisted mute preference. */
export function useSound() {
  const soundEnabled = useCareerStore((s) => s.soundEnabled);

  useEffect(() => {
    setMuted(!soundEnabled);
  }, [soundEnabled]);

  return useCallback(
    (name: SoundName) => {
      if (soundEnabled) play(name);
    },
    [soundEnabled],
  );
}
