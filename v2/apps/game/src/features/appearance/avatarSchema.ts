import {
  ACCESSORY_STYLES,
  type AvatarConfig,
  BEARD_STYLES,
  DEFAULT_AVATAR,
  EYE_COLORS,
  EYE_OFFSET_MAX,
  EYE_OFFSET_MIN,
  EYE_SHAPES,
  EYEBROW_OFFSET_MAX,
  EYEBROW_OFFSET_MIN,
  EYEBROW_STYLES,
  FEATURE_SIZE_MAX,
  FEATURE_SIZE_MIN,
  HAIR_COLORS,
  HAIR_STYLES,
  MOLE_SPOTS,
  MOUTH_OFFSET_MAX,
  MOUTH_OFFSET_MIN,
  MOUTH_STYLES,
  NOSE_OFFSET_MAX,
  NOSE_OFFSET_MIN,
  NOSE_SHAPES,
  SKIN_TONES,
} from "@craque/art";
import { bool, intInRange, isRecord, oneOf } from "../../lib/validate";

/**
 * Avatar lido do armazenamento (GDD 34.3): cada campo desconhecido volta ao
 * padrão daquele campo, sem derrubar os outros. `null` (ou qualquer coisa que
 * não seja objeto) é a silhueta de quem não personalizou.
 */
export function sanitizeAvatar(input: unknown): AvatarConfig | null {
  if (!isRecord(input)) return null;
  const d = DEFAULT_AVATAR;
  return {
    skin: intInRange(input["skin"], 0, SKIN_TONES.length - 1, d.skin),
    hair: oneOf(input["hair"], HAIR_STYLES, d.hair),
    hairColor: intInRange(input["hairColor"], 0, HAIR_COLORS.length - 1, d.hairColor),
    eyebrows: oneOf(input["eyebrows"], EYEBROW_STYLES, d.eyebrows),
    eyebrowOffset: intInRange(input["eyebrowOffset"], EYEBROW_OFFSET_MIN, EYEBROW_OFFSET_MAX, d.eyebrowOffset),
    eyes: intInRange(input["eyes"], 0, EYE_COLORS.length - 1, d.eyes),
    eyeShape: oneOf(input["eyeShape"], EYE_SHAPES, d.eyeShape),
    eyeSize: intInRange(input["eyeSize"], FEATURE_SIZE_MIN, FEATURE_SIZE_MAX, d.eyeSize),
    eyeOffset: intInRange(input["eyeOffset"], EYE_OFFSET_MIN, EYE_OFFSET_MAX, d.eyeOffset),
    nose: oneOf(input["nose"], NOSE_SHAPES, d.nose),
    noseSize: intInRange(input["noseSize"], FEATURE_SIZE_MIN, FEATURE_SIZE_MAX, d.noseSize),
    noseOffset: intInRange(input["noseOffset"], NOSE_OFFSET_MIN, NOSE_OFFSET_MAX, d.noseOffset),
    mouth: oneOf(input["mouth"], MOUTH_STYLES, d.mouth),
    mouthOffset: intInRange(input["mouthOffset"], MOUTH_OFFSET_MIN, MOUTH_OFFSET_MAX, d.mouthOffset),
    beard: oneOf(input["beard"], BEARD_STYLES, d.beard),
    beardColor: intInRange(input["beardColor"], 0, HAIR_COLORS.length - 1, d.beardColor),
    freckles: bool(input["freckles"], d.freckles),
    mole: oneOf(input["mole"], MOLE_SPOTS, d.mole),
    accessory: oneOf(input["accessory"], ACCESSORY_STYLES, d.accessory),
    accessoryColor: intInRange(input["accessoryColor"], 0, HAIR_COLORS.length - 1, d.accessoryColor),
  };
}
