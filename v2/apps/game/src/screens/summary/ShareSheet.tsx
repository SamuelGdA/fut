import type { AvatarConfig } from "@craque/art";
import { type Career, saveOf } from "@craque/engine";
import { Copy, Download, ImageIcon, Link2, Share2 } from "lucide-react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { canShareImage, copyImageAndInvite, downloadBlob, isDesktopPointer, posterFileName, renderPoster, shareImage } from "../../features/summary/poster";
import { SHARE_HEIGHT, SHARE_WIDTH } from "../../features/summary/shareCard";
import { encodeShare } from "../../features/summary/shareLink";
import { createShortLink, displayName, messageWithLink, networkUrl, SHARE_NETWORKS, type ShareNetwork, toJpeg } from "../../features/summary/shareTargets";
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

type LinkState = { status: "preparing" } | { status: "ready"; url: string } | { status: "fallback"; url: string };

const NETWORK_LABELS: Readonly<Record<ShareNetwork, string>> = {
  whatsapp: "WhatsApp",
  x: "X",
  facebook: "Facebook",
  telegram: "Telegram",
  reddit: "Reddit",
  discord: "Discord",
  instagram: "Instagram",
};

/**
 * O painel de compartilhar a carreira (D132): a imagem, a mensagem pronta
 * (que dá para mudar) e um botão por rede. Ao abrir, o jogo desenha a imagem,
 * pede o link curto da carreira e o usa em todas as redes: é a prévia desse
 * link que leva a imagem para a conversa. Sem o link curto (sem internet, ou
 * no computador de desenvolvimento), a mensagem vai com o endereço do jogo.
 */
export function ShareSheet({ open, onOpenChange, career, avatar }: ShareSheetProps) {
  const { t, locale } = useT();
  const surname = career.setup.identity.surname;
  const name = displayName(surname, locale);
  const [showSurname, setShowSurname] = useState(true);
  const [message, setMessage] = useState("");
  const [edited, setEdited] = useState(false);
  const [link, setLink] = useState<LinkState>({ status: "preparing" });
  const [frameRef, width] = useElementWidth(320);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<Blob | null>(null);
  const scale = width / SHARE_WIDTH;
  const desktop = isDesktopPointer();
  const nativeFiles = canShareImage() && !desktop;
  const fallbackUrl = `https://${siteLabel() || "futeiro.com"}`;
  const defaultMessage = showSurname ? t("summary.shareSheet.message", { surname: name }) : t("summary.shareSheet.messageAnonymous");
  const text = edited ? message : defaultMessage;

  // Desenha a imagem e pede o link curto sempre que o painel abre ou o nome
  // entra ou sai da imagem.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const prepare = async () => {
      setLink({ status: "preparing" });
      imageRef.current = null;
      try {
        for (let frame = 0; frame < 60 && !cardRef.current; frame++) await new Promise((resolve) => requestAnimationFrame(resolve));
        if (!cardRef.current) throw new Error("sem imagem");
        const jpeg = await toJpeg(await renderPoster(cardRef.current, undefined, { width: SHARE_WIDTH, height: SHARE_HEIGHT }));
        if (cancelled) return;
        imageRef.current = jpeg;
        const token = await encodeShare(saveOf(career), avatar);
        const url = await createShortLink(jpeg, token, showSurname ? name : "", locale);
        if (!cancelled) setLink({ status: "ready", url });
      } catch {
        if (!cancelled) setLink({ status: "fallback", url: fallbackUrl });
      }
    };
    void prepare();
    return () => {
      cancelled = true;
    };
  }, [open, showSurname, career, avatar, name, locale, fallbackUrl]);

  const url = link.status === "preparing" ? null : link.url;

  const image = async (): Promise<Blob> => imageRef.current ?? toJpeg(await renderPoster(cardRef.current!, undefined, { width: SHARE_WIDTH, height: SHARE_HEIGHT }));

  const copyText = async (value: string, title: string, description?: string) => {
    try {
      await navigator.clipboard.writeText(value);
      feedback("confirm");
      notify({ tone: "good", title, description });
    } catch {
      notify({ tone: "bad", title: t("summary.link.failed") });
    }
  };

  const download = async () => {
    try {
      downloadBlob(await image(), posterFileName(surname, showSurname).replace(/\.png$/, ".jpg"));
      return true;
    } catch {
      notify({ tone: "bad", title: t("summary.poster.failed") });
      return false;
    }
  };

  const shareNative = async () => {
    if (!url) return;
    const outcome = await shareImage(await image(), posterFileName(surname, showSurname).replace(/\.png$/, ".jpg"), t("app.name"), messageWithLink(text, url));
    if (outcome === "shared") feedback("confirm");
    if (outcome === "failed") notify({ tone: "bad", title: t("summary.poster.shareFailed") });
  };

  const onNetwork = async (network: ShareNetwork) => {
    if (!url) return;
    const target = networkUrl(network, text, url);
    if (target) {
      feedback("confirm");
      window.open(target, "_blank", "noopener,noreferrer");
      return;
    }
    if (network === "discord") {
      await copyText(messageWithLink(text, url), t("summary.shareSheet.discordTitle"), t("summary.shareSheet.discordBody"));
      return;
    }
    // Instagram: no celular, o compartilhamento do aparelho (com o arquivo); no computador, a imagem baixada.
    if (nativeFiles) {
      await shareNative();
      return;
    }
    if (await download()) notify({ tone: "good", title: t("summary.shareSheet.instagramTitle"), description: t("summary.shareSheet.instagramBody") });
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("summary.shareSheet.title")}
      description={t("summary.shareSheet.lead")}
      closeLabel={t("common.close")}
    >
      <div className="share-sheet">
        <div ref={frameRef} className="share-frame" style={{ height: SHARE_HEIGHT * scale }}>
          <div className="share-scale" style={{ transform: `scale(${scale})` }}>
            <ShareCard ref={cardRef} career={career} avatar={avatar} showSurname={showSurname} />
          </div>
        </div>
        <Switch checked={showSurname} onCheckedChange={setShowSurname} label={t("summary.poster.showSurname")} />

        <label className="share-message">
          <span className="eyebrow text-2xs">{t("summary.shareSheet.messageLabel")}</span>
          <textarea
            rows={3}
            maxLength={280}
            value={text}
            onChange={(event) => {
              setEdited(true);
              setMessage(event.target.value);
            }}
          />
        </label>

        <p className="share-status" role="status" aria-live="polite">
          {link.status === "preparing" ? t("summary.shareSheet.preparing") : link.status === "fallback" ? t("summary.shareSheet.fallback") : t("summary.shareSheet.ready")}
        </p>

        <ul className="share-networks" aria-label={t("summary.shareSheet.networks")}>
          {SHARE_NETWORKS.map((network) => (
            <li key={network}>
              <button
                type="button"
                className="share-network"
                data-network={network}
                style={{ "--brand": brandColor(network) } as CSSProperties}
                disabled={!url}
                onClick={() => void onNetwork(network)}
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
          <Button variant="secondary" disabled={!url} onClick={() => url && void copyText(url, t("summary.shareSheet.linkCopied"))}>
            <Link2 size={17} aria-hidden="true" />
            {t("summary.shareSheet.copyLink")}
          </Button>
          <Button variant="secondary" disabled={!url} onClick={() => url && void copyText(messageWithLink(text, url), t("summary.shareSheet.messageCopied"))}>
            <Copy size={17} aria-hidden="true" />
            {t("summary.shareSheet.copyMessage")}
          </Button>
          {desktop ? (
            <Button
              variant="secondary"
              onClick={async () => {
                const copied = await copyImageAndInvite(image(), url ? messageWithLink(text, url) : text);
                if (copied) {
                  feedback("confirm");
                  notify({ tone: "good", title: t("summary.link.imageCopied"), description: t("summary.link.imageCopiedBody") });
                } else notify({ tone: "bad", title: t("summary.poster.shareFailed") });
              }}
            >
              <ImageIcon size={17} aria-hidden="true" />
              {t("summary.shareSheet.copyImage")}
            </Button>
          ) : null}
          <Button variant="secondary" onClick={() => void download().then((ok) => ok && feedback("confirm"))}>
            <Download size={17} aria-hidden="true" />
            {t("summary.shareSheet.download")}
          </Button>
          {nativeFiles ? (
            <Button variant="secondary" disabled={!url} onClick={() => void shareNative()}>
              <Share2 size={17} aria-hidden="true" />
              {t("summary.shareSheet.more")}
            </Button>
          ) : null}
        </div>
      </div>
    </Sheet>
  );
}
