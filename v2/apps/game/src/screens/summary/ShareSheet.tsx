import type { AvatarConfig } from "@craque/art";
import type { Career } from "@craque/engine";
import { Download, Share2 } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { canShareImage, downloadBlob, isDesktopPointer, posterFileName, renderPoster, shareImage, shareText } from "../../features/summary/poster";
import { SHARE_HEIGHT, SHARE_WIDTH } from "../../features/summary/shareCard";
import { displayName, messageWithLink, networkUrl, SHARE_NETWORKS, type ShareNetwork } from "../../features/summary/shareTargets";
import { useT } from "../../i18n/useT";
import { siteLabel } from "../../lib/env";
import { useElementWidth } from "../../lib/useElementWidth";
import { feedback } from "../../services/feedback";
import { BrandIcon } from "../../ui/BrandIcon";
import { brandColor } from "../../ui/brandIcons";
import { Button } from "../../ui/Button";
import { Switch } from "../../ui/Fields";
import { Sheet } from "../../ui/Overlays";
import { notify } from "../../ui/toast/notify";
import { ShareCard } from "./ShareCard";

interface ShareSheetProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  career: Career;
  avatar: AvatarConfig | null;
}

const NETWORK_LABELS: Readonly<Record<ShareNetwork, string>> = {
  whatsapp: "WhatsApp",
  x: "X",
  facebook: "Facebook",
  telegram: "Telegram",
  reddit: "Reddit",
};

/** Quadros de espera pela imagem na tela antes de desistir de desenhá-la. */
const MAX_FRAMES = 60;

/**
 * O painel de compartilhar a carreira (D133). A mensagem é pronta e não muda.
 *
 * - Celular (o aparelho aceita compartilhar arquivo): um botão abre o
 *   compartilhamento do aparelho com a imagem e a mensagem juntas. Sem a
 *   imagem do jogador, vai só o convite para jogar.
 * - Computador: um botão por rede abre a tela de postar ou mandar, com a
 *   mensagem e o endereço do jogo; a imagem se baixa à parte, para mandar
 *   junto quando quiser.
 */
export function ShareSheet({ open, onOpenChange, career, avatar }: ShareSheetProps) {
  const { t, locale } = useT();
  const surname = career.setup.identity.surname;
  const [showSurname, setShowSurname] = useState(true);
  const [withImage, setWithImage] = useState(true);
  const [busy, setBusy] = useState(false);
  const [frameRef, width] = useElementWidth(320);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<Blob | null>(null);
  const scale = width / SHARE_WIDTH;
  const nativeFiles = canShareImage() && !isDesktopPointer();
  const link = `https://${siteLabel() || "futeiro.com"}`;
  const fileName = posterFileName(surname, showSurname);
  const message = showSurname ? t("summary.shareSheet.message", { surname: displayName(surname, locale) }) : t("summary.shareSheet.messageAnonymous");

  // A imagem fica pronta ao abrir: no celular, o compartilhamento do aparelho
  // só aceita ser aberto logo depois do toque, sem esperar o desenho.
  useEffect(() => {
    if (!open || !withImage) return;
    let cancelled = false;
    imageRef.current = null;
    const draw = async () => {
      for (let frame = 0; frame < MAX_FRAMES && !cardRef.current; frame++) await new Promise((resolve) => requestAnimationFrame(resolve));
      if (!cardRef.current || cancelled) return;
      const blob = await renderPoster(cardRef.current, undefined, { width: SHARE_WIDTH, height: SHARE_HEIGHT });
      if (!cancelled) imageRef.current = blob;
    };
    void draw().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [open, withImage, showSurname, career, avatar]);

  const image = async (): Promise<Blob> => {
    if (imageRef.current) return imageRef.current;
    if (!cardRef.current) throw new Error("sem imagem");
    return renderPoster(cardRef.current, undefined, { width: SHARE_WIDTH, height: SHARE_HEIGHT });
  };

  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      downloadBlob(await image(), fileName);
      feedback("confirm");
      notify({ tone: "good", title: t("summary.shareSheet.saved"), description: fileName });
    } catch {
      notify({ tone: "bad", title: t("summary.shareSheet.failed") });
    } finally {
      setBusy(false);
    }
  };

  const shareFromDevice = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const outcome = withImage
        ? await shareImage(await image(), fileName, t("app.name"), messageWithLink(message, link))
        : await shareText(t("app.name"), messageWithLink(t("summary.shareSheet.invite"), link));
      if (outcome === "shared") feedback("confirm");
      if (outcome === "failed") notify({ tone: "bad", title: t("summary.shareSheet.shareFailed") });
    } catch {
      notify({ tone: "bad", title: t("summary.shareSheet.failed") });
    } finally {
      setBusy(false);
    }
  };

  const openNetwork = (network: ShareNetwork) => {
    feedback("confirm");
    window.open(networkUrl(network, message, link), "_blank", "noopener,noreferrer");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={t("summary.shareSheet.title")} closeLabel={t("common.close")}>
      <div className="share-sheet">
        {withImage ? (
          <div ref={frameRef} className="share-frame" style={{ height: SHARE_HEIGHT * scale }}>
            <div className="share-scale" style={{ transform: `scale(${scale})` }}>
              <ShareCard ref={cardRef} career={career} avatar={avatar} showSurname={showSurname} />
            </div>
          </div>
        ) : null}

        {nativeFiles ? (
          <>
            <Switch checked={withImage} onCheckedChange={setWithImage} label={t("summary.shareSheet.withImage")} />
            {withImage ? <Switch checked={showSurname} onCheckedChange={setShowSurname} label={t("summary.shareSheet.showSurname")} /> : null}
            <div className="share-actions">
              <Button size="lg" disabled={busy} onClick={() => void shareFromDevice()}>
                <Share2 size={18} aria-hidden="true" />
                {t("summary.shareSheet.share")}
              </Button>
              {withImage ? (
                <Button size="lg" variant="secondary" disabled={busy} onClick={() => void download()}>
                  <Download size={18} aria-hidden="true" />
                  {t("summary.shareSheet.download")}
                </Button>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <Switch checked={showSurname} onCheckedChange={setShowSurname} label={t("summary.shareSheet.showSurname")} />
            <ul className="share-networks" aria-label={t("summary.shareSheet.networks")}>
              {SHARE_NETWORKS.map((network) => (
                <li key={network}>
                  <button
                    type="button"
                    className="share-network"
                    data-network={network}
                    style={{ "--brand": brandColor(network) } as CSSProperties}
                    onClick={() => openNetwork(network)}
                  >
                    <span className="share-network-icon">
                      <BrandIcon network={network} />
                    </span>
                    <span className="share-network-label">{NETWORK_LABELS[network]}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="share-actions">
              <Button size="lg" disabled={busy} onClick={() => void download()}>
                <Download size={18} aria-hidden="true" />
                {t("summary.shareSheet.download")}
              </Button>
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
}
