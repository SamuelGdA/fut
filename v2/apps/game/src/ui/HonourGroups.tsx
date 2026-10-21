import { useEffect, useRef, useState, type ComponentProps, type CSSProperties } from "react";
import { AnimatePresence, m } from "motion/react";
import { useReducedMotion } from "../lib/useReducedMotion";
import { HonourToken } from "./HonourToken";

export type HonourItem = Omit<ComponentProps<typeof HonourToken>, "size" | "language" | "stacked">;

/** Cada conquista continua no fluxo. Abrir a pilha redistribui as demais, sem sobreposição. */
export function HonourGroups({ items, language, size = 30 }: { items: readonly HonourItem[]; language: ComponentProps<typeof HonourToken>["language"]; size?: number }) {
  const reduced = useReducedMotion();
  const [expanded, setExpanded] = useState<string | null>(null);
  const closing = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if(closing.current) clearTimeout(closing.current); },[]);
  const open = (key:string) => { if(closing.current) clearTimeout(closing.current); setExpanded(key); };
  const close = (count: number) => { if(closing.current) clearTimeout(closing.current); closing.current=setTimeout(()=>setExpanded(null),reduced?0:Math.min(400, 140 + Math.max(0, count - 3) * 30)); };
  const groups = new Map<string, HonourItem[]>();
  for (const item of items) {
    const key = `${item.award ?? "title"}:${item.id}`;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return <m.span layout={!reduced} transition={{layout:{duration:reduced?0:.38,ease:[.22,1,.36,1]}}} className="honour-groups">{[...groups].map(([key, group]) => <span className="honour-stack" key={key} style={{ "--honour-size": `${size + 4}px` } as CSSProperties} data-count={group.length} data-expanded={expanded===key || undefined} data-multiple={group.length > 1 || undefined}
    onPointerEnter={event=>{if(event.pointerType!=="touch")open(key);}} onPointerLeave={event=>{if(event.pointerType!=="touch")close(group.length);}}
    onPointerDown={event=>{if(event.pointerType==="touch")open(key);}}
    onFocus={event=>{if(event.target.matches(":focus-visible"))open(key);}}
    onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))close(group.length);}}>
    <span className="honour-copies"><AnimatePresence initial={false} mode="sync">{group.map((item, index) => expanded===key || index===group.length-1 ? <m.span layout={reduced?false:"position"} initial={reduced?false:{opacity:0,scale:.85,x:-5}} animate={{opacity:1,scale:1,x:0}} exit={{opacity:0,scale:.85,x:-5}} transition={{duration:reduced?0:.32,delay:reduced?0:Math.min(index*.045,.4),layout:{duration:reduced?0:Math.min(1.1,.38+Math.max(0,group.length-3)*.07),ease:[.22,1,.36,1]}}} className="honour-copy" data-last={index===group.length-1 || undefined} key={`${item.year}:${index}`}><HonourToken {...item} language={language} size={size} stacked={group.length > 1 && index === group.length - 1} />{group.length > 1 && index === group.length - 1 ? <span className="honour-count numeric">×{group.length}</span> : null}</m.span> : null)}</AnimatePresence></span>
  </span>)}</m.span>;
}
