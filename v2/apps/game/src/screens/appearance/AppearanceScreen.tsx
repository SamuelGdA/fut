import { getCountryKit } from "@craque/world";
import type { CSSProperties } from "react";
import { useNavigation } from "../../app/navigation";
import { AvatarEditor } from "../../features/appearance/AvatarEditor";
import { useAppearanceContext } from "../../features/appearance/context";
import { useDraft } from "../../features/career/draft";

/**
 * Aparência (GDD 6.3): o editor do v1, portado sem mudar o comportamento,
 * editando o avatar do rascunho, numa moldura nova (D43): no PC, a tela
 * inteira cabe na janela e só o painel de opções rola. A camisa do retrato é a da seleção escolhida
 * (no desafio, a do dia); a do clube só existe depois do primeiro contrato.
 */
export function AppearanceScreen() {
  const go = useNavigation((state) => state.go);
  const avatar = useDraft((state) => state.avatar);
  const draftNationality = useDraft((state) => state.nationality);
  const returnTo = useAppearanceContext((state) => state.returnTo);
  const contextNationality = useAppearanceContext((state) => state.nationality);
  const nationality = returnTo === "challenge" ? contextNationality : draftNationality;
  const leave = () => {
    go(returnTo);
    // A próxima abertura, pela Identidade, volta ao padrão.
    useAppearanceContext.getState().open("identity", null);
  };

  return (
    <div className="appearance-page mx-auto max-w-6xl px-4 pt-6 pb-16" style={{ "--subbar": "0px" } as CSSProperties}>
      <AvatarEditor
        value={avatar}
        onChange={(next) => useDraft.getState().update({ avatar: next })}
        kit={nationality ? getCountryKit(nationality) : null}
        onBack={leave}
        onDone={leave}
      />
    </div>
  );
}
