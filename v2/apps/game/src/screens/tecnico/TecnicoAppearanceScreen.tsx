import { getCountryKit } from "@craque/world";
import type { CSSProperties } from "react";
import { useNavigation } from "../../app/navigation";
import { AvatarEditor } from "../../features/appearance/AvatarEditor";
import { useCoachDraft } from "../../features/tecnico/draft";

/**
 * Aparência do treinador (GDD 56.2): o mesmo editor do Craque, com o retrato
 * de terno e a gravata na cor da seleção do país escolhido.
 */
export function TecnicoAppearanceScreen() {
  const go = useNavigation((state) => state.go);
  const avatar = useCoachDraft((state) => state.avatar);
  const nationality = useCoachDraft((state) => state.nationality);
  const leave = () => go("tecnicoIdentity");
  return (
    <div className="appearance-page mx-auto max-w-6xl px-4 pt-6 pb-16" style={{ "--subbar": "0px" } as CSSProperties}>
      <AvatarEditor
        value={avatar}
        onChange={(next) => useCoachDraft.getState().update({ avatar: next })}
        kit={nationality ? getCountryKit(nationality) : null}
        outfit="coach"
        onBack={leave}
        onDone={leave}
      />
    </div>
  );
}
