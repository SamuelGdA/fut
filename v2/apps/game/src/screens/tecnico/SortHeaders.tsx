import { Popover } from "@base-ui/react/popover";
import type { Position } from "@craque/engine/positions";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown } from "lucide-react";
import type { PlayerSort } from "../../features/tecnico/sorting";
import { d66 } from "../../i18n/tecnico/d66";
import { d64 } from "../../i18n/tecnico/d64";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";

const POSITIONS: readonly Position[] = ["gk","rb","cb","lb","cdm","cm","lm","rm","cam","lw","rw","st"];
/** Um único padrão de colunas, com ordenação e filtros junto da informação. */
export function SortHeaders({ sort, onChange, position, onPosition, minOvr, onMinOvr, maxOvr, onMaxOvr, chance = false, selection = false }: { sort: PlayerSort; onChange(sort: PlayerSort): void; position?: Position | "any"; onPosition?(position: Position | "any"): void; minOvr?: string; onMinOvr?(ovr: string): void; maxOvr?: string; onMaxOvr?(ovr: string): void; chance?: boolean; selection?: boolean }) {
  const t=useTecnicoT();
  return <div className="tec-sort-head" data-selection={selection || undefined} role="group" aria-label={d64(t.locale,"sorting")}>
    {(["position","ovr","name","age","value", ...(chance ? ["chance" as const] : [])] as const).map((key)=>{
      const active=sort.key===key,Icon=active?(sort.descending?ArrowDown:ArrowUp):ArrowUpDown,label=key==="ovr"?"OVR":key==="chance"?t.tt("buy.chance"):d64(t.locale,key);
      return <span key={key}><button type="button" aria-label={label} aria-pressed={active} title={`${label}: ${d64(t.locale,sort.descending?"descending":"ascending")}`} onClick={()=>onChange({key,descending:active?!sort.descending:key==="ovr"||key==="value"||key==="chance"})}><Icon size={12} aria-hidden="true" /><span>{key==="position"?"POS":label}</span></button>
        {(key==="position"&&onPosition)||(key==="ovr"&&onMaxOvr)?<Popover.Root><Popover.Trigger className="tec-column-filter" aria-label={key==="position"?t.tt("buy.filters.position"):d64(t.locale,"maxOvr")}><ChevronDown size={12} aria-hidden="true" /></Popover.Trigger><Popover.Portal><Popover.Positioner side="bottom" sideOffset={4} collisionPadding={8} className="layer-popover"><Popover.Popup className="popover-popup tec-column-options">{key==="position"?<div className="grid grid-cols-3 gap-1">{(["any",...POSITIONS] as const).map((value)=><Popover.Close key={value} aria-pressed={position===value} onClick={()=>onPosition?.(value)}>{value==="any"?t.tt("buy.filters.any"):t.c(`positionAbbr.${value}`)}</Popover.Close>)}</div>:<div className="tec-ovr-range">{(["minOvr","maxOvr"] as const).map((bound)=><label key={bound}>{d66(t.locale,bound)}<input type="number" min={1} max={99} placeholder="1…99" value={(bound==="minOvr"?minOvr:maxOvr) ?? ""} onChange={(event)=>(bound==="minOvr"?onMinOvr:onMaxOvr)?.(event.target.value)} /></label>)}</div>}</Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>:null}
      </span>;
    })}
  </div>;
}
