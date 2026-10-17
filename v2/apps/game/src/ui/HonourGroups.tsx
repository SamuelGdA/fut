import type { ComponentProps, CSSProperties } from "react";
import { HonourToken } from "./HonourToken";

export type HonourItem = Omit<ComponentProps<typeof HonourToken>, "size" | "language" | "stacked">;

/** Cada conquista continua no fluxo. Abrir a pilha redistribui as demais, sem sobreposição. */
export function HonourGroups({ items, language, size = 30 }: { items: readonly HonourItem[]; language: ComponentProps<typeof HonourToken>["language"]; size?: number }) {
  const groups = new Map<string, HonourItem[]>();
  for (const item of items) {
    const key = `${item.award ?? "title"}:${item.id}`;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return <span className="honour-groups">{[...groups].map(([key, group]) => <span className="honour-stack" key={key} style={{ "--honour-size": `${size + 4}px` } as CSSProperties} data-multiple={group.length > 1 || undefined}>
    <span className="honour-copies">{group.map((item, index) => <span className="honour-copy" key={`${item.year}:${index}`}><HonourToken {...item} language={language} size={size} stacked={group.length > 1 && index === group.length - 1} />{group.length > 1 && index === group.length - 1 ? <span className="honour-count numeric">×{group.length}</span> : null}</span>)}</span>
  </span>)}</span>;
}
