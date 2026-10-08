import { readPrefs } from "../store/prefs";
import { type Cue, playCue, volumeGain } from "./audio";
import { type Haptic, vibrate } from "./haptics";

/** Vibração que acompanha cada sinal sonoro. Sinais leves não vibram. */
const HAPTIC_FOR: Readonly<Partial<Record<Cue, Haptic>>> = {
  select: "tap",
  confirm: "success",
  trophy: "trophy",
  whistle: "success",
  unlock: "success",
};

/**
 * Som e vibração de uma ação, lidos das preferências no momento do toque.
 * Pode ser chamado de qualquer lugar, dentro ou fora do React.
 */
export function feedback(cue: Cue): void {
  const prefs = readPrefs();
  playCue(cue, volumeGain(prefs.volume, prefs.muted));
  const haptic = HAPTIC_FOR[cue];
  if (haptic && prefs.haptics) vibrate(haptic);
}
