import { Popover } from "@base-ui/react/popover";
import type { ComponentProps, CSSProperties } from "react";
import { HonourArt, HonourToken } from "./HonourToken";
import { honourName } from "./honourName";

export type HonourItem = Omit<ComponentProps<typeof HonourToken>, "size" | "language" | "stacked">;

/**
 * Conquistas iguais viram uma pilha com o contador. Abrir a pilha (hover, foco
 * ou toque) mostra todas as cópias num painel flutuante ancorado nela, com o
 * ano de cada uma (D90). O painel não mexe no resto da linha do tempo e o Base
 * UI o mantém dentro da tela: em cima quando cabe, embaixo quando não.
 */
export function HonourGroups({ items, language, size = 30 }: { items: readonly HonourItem[]; language: ComponentProps<typeof HonourToken>["language"]; size?: number }) {
  const groups = new Map<string, HonourItem[]>();
  for (const item of items) {
    const key = `${item.award ?? "title"}:${item.id}`;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return <span className="honour-groups">{[...groups].map(([key, group]) => {
    const last = group[group.length - 1]!;
    const style = { "--honour-size": `${size + 4}px` } as CSSProperties;
    if (group.length === 1) return <span className="honour-stack" key={key} style={style} data-count={1}><span className="honour-copy" data-last><HonourToken {...last} language={language} size={size} /></span></span>;
    const name = honourName(last.id, last.award, last.label, language);
    return <Popover.Root key={key}>
      <Popover.Trigger openOnHover delay={120} closeDelay={180} className="honour-stack" data-multiple data-count={group.length} style={style} aria-label={`${name} ×${group.length}`} render={<button type="button" />}>
        <span className="honour-copy" data-last><span className="honour-token" data-stacked><span className="honour-shadow" aria-hidden="true"><HonourArt id={last.id} award={last.award} size={size} language={language} /></span><HonourArt id={last.id} award={last.award} size={size} language={language} /></span><span className="honour-count numeric">×{group.length}</span></span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="top" sideOffset={8} collisionPadding={12} className="layer-popover">
          <Popover.Popup className="popover-popup honour-pile">
            <p className="honour-pile-title">{name} <span className="numeric">×{group.length}</span></p>
            <ul className="honour-pile-grid" style={{ "--pile-columns": Math.min(group.length, 6) } as CSSProperties}>
              {group.map((item, index) => <li key={`${item.year ?? index}:${index}`} className="honour-pile-item"><HonourArt id={item.id} award={item.award} size={size} language={language} /><span className="numeric">{item.year}</span></li>)}
            </ul>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>;
  })}</span>;
}
