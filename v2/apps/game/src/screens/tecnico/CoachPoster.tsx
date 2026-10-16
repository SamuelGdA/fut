import { usePosterHeight } from "../../lib/usePosterHeight";
import type { AvatarConfig } from "@craque/art";
import type { CoachCareer } from "@craque/engine/coach";
import { useRef, useState } from "react";
import { downloadBlob, renderPoster, POSTER_WIDTH, canShareImage, shareImage } from "../../features/summary/poster";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { revisionText } from "../../i18n/tecnico/revision";
import { useElementWidth } from "../../lib/useElementWidth";
import { Button } from "../../ui/Button";
import { Sheet } from "../../ui/Overlays";
import { notify } from "../../ui/toast/notify";
import { CoachPosterArt } from "./CoachPosterArt";

/** A mesma arte aparece na prévia e no PNG exportado. */
export function CoachPosterSheet({ career, avatar, open, onOpenChange }: { career: CoachCareer; avatar: AvatarConfig | null; open: boolean; onOpenChange(open: boolean): void }) {
  const t=useTecnicoT(),[busy,setBusy]=useState(false),[frame,width]=useElementWidth(320),node=useRef<HTMLDivElement>(null),scale=width/POSTER_WIDTH;
  const height=usePosterHeight(node,open);
  const produce=async(share:boolean)=>{
    if(!node.current||busy)return;
    setBusy(true);
    try{
      const blob=await renderPoster(node.current,"#0d1110");
      const slug=career.setup.identity.name.normalize("NFD").replace(/\p{M}/gu,"").replace(/[^a-z0-9]+/gi,"-").toLowerCase();
      const name=`tecnico-${slug}.png`;
      if(share)await shareImage(blob,name,"Futeiros",revisionText(t.locale,"poster"));else downloadBlob(blob,name);
    }catch{notify({tone:"bad",title:t.tt("errors.generic")});}finally{setBusy(false);}
  };
  return <Sheet open={open} onOpenChange={onOpenChange} title={revisionText(t.locale,"poster")} closeLabel={t.tt("common.close")} footer={<div className="flex gap-2"><Button loading={busy} onClick={()=>void produce(false)}>{revisionText(t.locale,"savePoster")}</Button>{canShareImage()?<Button variant="secondary" disabled={busy} onClick={()=>void produce(true)}>{revisionText(t.locale,"poster")}</Button>:null}</div>}><div ref={frame} style={{height:height*scale}} className="tec-poster-frame"><div style={{transform:`scale(${scale})`,transformOrigin:"top left"}}><CoachPosterArt ref={node} career={career} avatar={avatar} /></div></div></Sheet>;
}
