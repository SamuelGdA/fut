import { Bug } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useT } from "../../i18n/useT";
import { IS_DEV } from "../../lib/env";
import { IconButton } from "../../ui/Button";
import { Loading } from "../../ui/Loading";
import { Sheet } from "../../ui/Overlays";
import { COPY } from "./copy";

const PlayerControls = lazy(() => import("./PlayerControls").then((module) => ({ default: module.PlayerControls })));
const CoachControls = lazy(() => import("./CoachControls").then((module) => ({ default: module.CoachControls })));

export function DebugTools({ game }: { game: "craque" | "tecnico" }) {
  const { locale, t } = useT();
  const [open, setOpen] = useState(false);
  const text = COPY[locale];
  if (!IS_DEV) return null;
  return <><IconButton size="iconSm" label={text.title} onClick={() => setOpen(true)}><Bug size={16} aria-hidden="true" /></IconButton><Sheet open={open} onOpenChange={setOpen} title={text.title} description={text.note} closeLabel={t("common.close")}>{open ? <Suspense fallback={<Loading label={t("common.loading")} />}>{game === "craque" ? <PlayerControls done={() => setOpen(false)} /> : <CoachControls done={() => setOpen(false)} />}</Suspense> : null}</Sheet></>;
}
