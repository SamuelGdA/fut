"use client";

import { useCallback, useEffect } from "react";
import { play, setMuted, setVolume, type SoundName } from "./sfx";
import { useCareerStore } from "@/store/careerStore";

/** Keeps the synth in sync with the persisted mute and level preferences. */
export function useSound() {
  const soundEnabled = useCareerStore((s) => s.soundEnabled);
  const volume = useCareerStore((s) => s.volume);

  useEffect(() => {
    setMuted(!soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    setVolume(volume);
  }, [volume]);

  return useCallback(
    (name: SoundName) => {
      if (soundEnabled && volume > 0) play(name);
    },
    [soundEnabled, volume],
  );
}
