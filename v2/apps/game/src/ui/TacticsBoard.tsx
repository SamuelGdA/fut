import { useId } from "react";

/** Prancheta de giz, com a formação efetivamente registrada no auge. */
export function TacticsBoard({ formation }: { formation: string }) {
  const pattern=`chalk-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const rows=formation.split("-").map(Number).reverse();
  const points=rows.flatMap((count,row)=>Array.from({length:count},(_,column)=>({x:17+(column+1)*146/(count+1),y:26+row*74/Math.max(1,rows.length-1)})));
  points.push({x:90,y:124});
  return <svg viewBox="0 0 180 150" className="tactics-board" aria-hidden="true" focusable="false">
    <defs><pattern id={pattern} width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".6" fill="#cad8cd" opacity=".12" /></pattern></defs>
    <rect x="3" y="3" width="174" height="144" rx="8" fill="#182b25" stroke="#b5c8b6" strokeWidth="2" />
    <rect x="5" y="5" width="170" height="140" rx="6" fill={`url(#${pattern})`} />
    <g fill="none" stroke="#b9cfc0" strokeWidth="1" opacity=".55"><rect x="17" y="14" width="146" height="120" /><path d="M17 74h146M60 14v22h60V14M60 134v-22h60v22"/><circle cx="90" cy="74" r="18"/></g>
    <g stroke="#f0edcf" strokeWidth="1.8" fill="none" strokeLinecap="round"><path d="M43 97q-14-36 9-57M48 44l4-4 1 7M139 92q13-36-8-51M130 48l1-7 5 5" strokeDasharray="4 4"/><path d="M83 61l17-21m-8 3 8-3-1 8" /></g>
    {points.map((point,index)=><g key={index}><circle cx={point.x} cy={point.y} r="8" fill="#24553c" stroke="#d7e3c4" strokeWidth="1.5"/><circle cx={point.x} cy={point.y} r="2" fill="#f4e7a5"/></g>)}
    <rect x="66" y="0" width="48" height="8" rx="3" fill="#81958c"/><path d="M75 4h30" stroke="#dce2dc" opacity=".6"/>
  </svg>;
}
