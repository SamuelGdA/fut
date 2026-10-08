import { type AvatarConfig, type KitDef, renderAvatarSvg } from "@craque/art";
import { useId } from "react";

interface AvatarProps {
  /** `null` desenha a silhueta cinza de quem não personalizou. */
  config: AvatarConfig | null;
  kit?: KitDef | null;
  showBackground?: boolean;
  className?: string;
}

/**
 * O retrato na página (portado do v1). O desenho vem de `@craque/art` como
 * texto SVG, e este componente só o coloca no documento. O invólucro usa
 * `display: contents`, então o `<svg>` se comporta como raiz do componente.
 *
 * Cada retrato ganha um prefixo de id próprio: com vários na mesma página, o
 * recorte da camisa de um nunca aponta para o `<clipPath>` de outro.
 */
export function Avatar({ config, kit, showBackground = true, className = "" }: AvatarProps) {
  const idPrefix = `av${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const markup = renderAvatarSvg(config, { kit, showBackground, className, idPrefix });
  return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: markup }} />;
}
