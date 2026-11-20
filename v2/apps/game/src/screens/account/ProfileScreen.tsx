import { Tooltip } from "@base-ui/react/tooltip";
import { ArrowRight, LogOut, Pencil, Play, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { screenUrl, useNavigation } from "../../app/navigation";
import { openLogin } from "../../features/account/openLogin";
import { type Profile, type Trophy, USERNAME_COOLDOWN_DAYS } from "../../features/account/schemas";
import { useAccount } from "../../features/account/store";
import { AdSlot } from "../../features/consent/AdSlot";
import { isBlockedAchievement, TECNICO_BLOCKED } from "../../lib/modes";
import { formatShortDate } from "../../i18n/format";
import { type ContaKey, useContaT } from "../../i18n/conta/useContaT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { ConfirmDialog } from "../../ui/Overlays";
import { Panel } from "../../ui/Panel";
import { Skeleton } from "../../ui/Skeleton";
import { notify } from "../../ui/toast/notify";
import { catalogEntry, CATALOG, entryText, rarityRank } from "../achievements/catalog";
import { TrophyIcon } from "../achievements/TrophyIcon";
import { AuthField } from "./AuthField";

/** Quantos troféus a vitrine mostra antes do "ver todas". */
const SHOWCASE = 12;

/**
 * O perfil (D112), em `/perfil`: o @, os números somados de todas as carreiras
 * (Craque, Desafio do dia e Técnico), a vitrine dos troféus mais raros com a
 * quantidade de cada um, e a conta (trocar o @, sair, apagar). Enquanto o
 * banco responde, esqueletos no lugar exato de cada bloco.
 */
export function ProfileScreen() {
  const status = useAccount((state) => state.status);
  const dataStatus = useAccount((state) => state.dataStatus);
  const profile = useAccount((state) => state.profile);

  // Sem conta, o perfil é o login (que volta para cá depois).
  useEffect(() => {
    if (status === "guest" || status === "off") openLogin("profile");
  }, [status]);

  useEffect(() => {
    if (status === "member") void useAccount.getState().refresh();
  }, [status]);

  if (status === "member" && dataStatus === "error" && !profile) return <ProfileError />;
  if (status !== "member" || !profile) return <ProfileSkeleton />;
  return <ProfileView profile={profile} />;
}

function ProfileSkeleton() {
  const { ct } = useContaT();
  return (
    <div className="profile-page" role="status" aria-label={ct("profile.loading")}>
      <span className="sr-only">{ct("profile.loading")}</span>
      <div className="profile-head">
        <Skeleton round className="size-20 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-56 max-w-full" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="profile-stats">
        {(TECNICO_BLOCKED ? [0, 1] : [0, 1, 2]).map((panel) => (
          <div key={panel} className="rounded-md border border-line bg-panel p-4 sm:p-5">
            <Skeleton className="mb-4 h-3 w-24" />
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2, 3, 4, 5].slice(0, panel === 0 ? 6 : 3).map((tile) => (
                <div key={tile} className="flex flex-col gap-2">
                  <Skeleton className="h-8 w-14" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-line bg-panel p-4 sm:p-5">
        <Skeleton className="mb-4 h-3 w-28" />
        <div className="profile-showcase">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <Skeleton round className="size-16" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileError() {
  const { ct } = useContaT();
  return (
    <div className="profile-page">
      <Panel>
        <p className="text-muted">{ct("profile.loadError")}</p>
        <Button className="mt-4" onClick={() => void useAccount.getState().refresh()}>
          {ct("profile.retry")}
        </Button>
      </Panel>
    </div>
  );
}

function ProfileView({ profile }: { profile: Profile }) {
  const { t, ct, locale, number } = useContaT();
  const go = useNavigation((state) => state.go);
  const trophies = useAccount((state) => state.trophies);
  const streak = useAccount((state) => state.streak);
  const username = profile.username ?? "";

  const stats: { section: ContaKey; items: { key: ContaKey; value: number }[] }[] = [
    {
      section: "profile.sections.craque",
      items: [
        { key: "profile.stats.careers", value: profile.carreiras },
        { key: "profile.stats.games", value: profile.partidas },
        { key: "profile.stats.goals", value: profile.gols },
        { key: "profile.stats.assists", value: profile.assistencias },
        { key: "profile.stats.titles", value: profile.titulos },
        { key: "profile.stats.ballons", value: profile.bolas_de_ouro },
        { key: "profile.stats.peak", value: profile.melhor_ovr },
        { key: "profile.stats.awards", value: profile.premios },
        { key: "profile.stats.cleanSheets", value: profile.jogos_sem_sofrer },
      ],
    },
    {
      section: "profile.sections.challenge",
      items: [
        { key: "profile.stats.today", value: streak?.hoje ?? 0 },
        { key: "profile.stats.streakNow", value: streak?.sequencia_atual ?? 0 },
        { key: "profile.stats.streakBest", value: streak?.maior_sequencia ?? 0 },
        { key: "profile.stats.bestChallenge", value: profile.melhor_desafio },
        { key: "profile.stats.challenges", value: profile.desafios },
      ],
    },
    // D124: com o Técnico bloqueado no ar, os números dele não aparecem.
    ...(TECNICO_BLOCKED
      ? []
      : [
          {
            section: "profile.sections.tecnico" as const,
            items: [
              { key: "profile.stats.coachCareers" as const, value: profile.carreiras_tecnico },
              { key: "profile.stats.coachSeasons" as const, value: profile.temporadas_tecnico },
              { key: "profile.stats.coachTitles" as const, value: profile.titulos_tecnico },
            ],
          },
        ]),
  ];

  return (
    <div className="profile-page">
      <header className="profile-head">
        <span className="profile-monogram" aria-hidden="true">{(username[0] ?? "@").toUpperCase()}</span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-glory">{ct("profile.eyebrow")}</p>
          <h1 className="profile-name">@{username}</h1>
          <p className="mt-1 text-sm text-muted">
            {ct("profile.memberSince", { date: formatShortDate(Date.parse(profile.criado_em), locale) })}
          </p>
        </div>
        <Button
          variant="glory"
          onClick={() => {
            feedback("confirm");
            go("hub");
          }}
        >
          <Play size={17} aria-hidden="true" />
          {ct("profile.play")}
        </Button>
      </header>


      <div className="profile-stats">
        {stats.map((group) => (
          <Panel key={group.section} title={ct(group.section)}>
            <dl className="profile-stat-grid">
              {group.items.map((item) => (
                <div key={item.key} className="profile-stat">
                  <dt className="eyebrow text-2xs">{ct(item.key)}</dt>
                  <dd className="display numeric">{number(item.value)}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        ))}
      </div>

      <Showcase trophies={trophies} />

      <AccountPanel username={username} changedAt={profile.username_alterado_em} />

      <AdSlot placement="perfil" className="mt-6" />

      <p className="mt-6 text-center text-xs text-faint">
        <a
          href={screenUrl("privacy")}
          className="auth-link"
          onClick={(event) => {
            event.preventDefault();
            go("privacy");
          }}
        >
          {ct("profile.privacyLink")}
        </a>
        {" · "}
        <a
          href={screenUrl("terms")}
          className="auth-link"
          onClick={(event) => {
            event.preventDefault();
            go("terms");
          }}
        >
          {t("legal.terms")}
        </a>
      </p>
    </div>
  );
}

function Showcase({ trophies: all }: { trophies: readonly Trophy[] }) {
  const { t, tp, ct, locale } = useContaT();
  const go = useNavigation((state) => state.go);
  // D124: troféus do Técnico bloqueado ficam fora da vitrine e da contagem.
  const trophies = all.filter((trophy) => !isBlockedAchievement(trophy.id_trophy));
  const total = CATALOG.filter((entry) => !isBlockedAchievement(entry.id)).length;
  const shown = trophies
    .map((trophy) => ({ trophy, entry: catalogEntry(trophy.id_trophy) }))
    .filter((item): item is { trophy: Trophy; entry: NonNullable<ReturnType<typeof catalogEntry>> } => item.entry !== null)
    // Os títulos primeiro, depois as outras conquistas; em cada parte, da mais rara à mais comum.
    .sort((a, b) => Number(!a.entry.id.startsWith("title:")) - Number(!b.entry.id.startsWith("title:")) || rarityRank(a.entry.rarity) - rarityRank(b.entry.rarity) || b.trophy.quantidade - a.trophy.quantidade || a.trophy.data_desbloqueio.localeCompare(b.trophy.data_desbloqueio))
    .slice(0, SHOWCASE);
  return (
    <Panel
      title={ct("profile.showcase")}
      aside={<span className="numeric text-xs text-muted">{ct("profile.showcaseCount", { count: trophies.length, total })}</span>}
      className="mt-6"
    >
      {shown.length === 0 ? (
        <p className="text-sm text-muted">{ct("profile.showcaseEmpty")}</p>
      ) : (
        <ul className="profile-showcase">
          {shown.map(({ trophy, entry }) => {
            const { name, description } = entryText(locale, entry);
            const label = `${t("achievements.trophyUnlocked", { name })}, ${tp("achievements.quantity", trophy.quantidade).toLocaleLowerCase(locale)}`;
            return (
              <li key={trophy.id_trophy} className="profile-trophy">
                <TrophyIcon id={entry.id} group={entry.group} rarity={entry.rarity} unlocked quantity={trophy.quantidade} label={label} language={locale} size="lg" />
                <TrophyCaption name={name} description={description} />
              </li>
            );
          })}
        </ul>
      )}
      <Button
        variant="secondary"
        size="sm"
        className="mt-5"
        onClick={() => {
          feedback("select");
          go("achievements");
        }}
      >
        {ct("profile.allAchievements")}
        <ArrowRight size={16} aria-hidden="true" />
      </Button>
    </Panel>
  );
}

function AccountPanel({ username, changedAt }: { username: string; changedAt: string | null }) {
  const { ct, locale } = useContaT();
  // D118: depois de uma troca, o @ só muda de novo 30 dias depois.
  const unlockAt = changedAt ? Date.parse(changedAt) + USERNAME_COOLDOWN_DAYS * 86_400_000 : 0;
  const [now] = useState(() => Date.now());
  const locked = unlockAt > now;
  const nextChange = locked ? formatShortDate(unlockAt, locale) : null;
  const go = useNavigation((state) => state.go);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(username);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // D127: apagar tem dois passos. Primeiro manda o link para o e-mail; quem
  // volta pelo link (`/perfil?apagar=1`) vê a confirmação final.
  const [asking, setAsking] = useState(false);
  const [confirming, setConfirming] = useState(takeDeletionReturn);
  const email = useAccount((state) => state.user?.email ?? "");

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await useAccount.getState().setUsername(draft);
    setBusy(false);
    if (result) {
      setError(
        result === "taken" ? ct("login.errors.taken")
        : result === "network" ? ct("login.errors.network")
        : result === "recent" ? ct("login.errors.recent", { date: nextChange ?? "" })
        : result === "reserved" ? ct("login.errors.reserved")
        : result === "offensive" ? ct("login.errors.offensive")
        : ct("login.errors.username"),
      );
      return;
    }
    feedback("confirm");
    setEditing(false);
    notify({ id: "account-username", tone: "good", title: ct("profile.saved") });
  };

  return (
    <Panel title={ct("profile.account")} className="mt-6">
      {editing ? (
        <form className="flex flex-col gap-3 sm:max-w-sm" onSubmit={save} noValidate>
          <AuthField label={ct("login.username")} prefix="@" autoCapitalize="none" maxLength={21} value={draft} onValueChange={setDraft} hint={ct("login.usernameHint")} error={error ?? undefined} autoFocus />
          <p className="text-xs text-muted">{ct("profile.usernameRule", { days: USERNAME_COOLDOWN_DAYS })}</p>
          <div className="flex gap-2">
            <Button type="submit" loading={busy}>{ct("profile.save")}</Button>
            <Button variant="ghost" onClick={() => { setEditing(false); setDraft(username); setError(null); }}>{ct("profile.cancel")}</Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" disabled={locked} title={nextChange ? ct("profile.usernameNext", { date: nextChange }) : undefined} onClick={() => setEditing(true)}>
            <Pencil size={15} aria-hidden="true" />
            {ct("profile.editUsername")}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              feedback("back");
              await useAccount.getState().signOut();
              go("hub", { force: true });
            }}
          >
            <LogOut size={15} aria-hidden="true" />
            {ct("profile.signOut")}
          </Button>
          <Button variant="danger" size="sm" onClick={() => setAsking(true)}>
            <Trash2 size={15} aria-hidden="true" />
            {ct("profile.delete")}
          </Button>
        </div>
      )}
      {!editing && nextChange ? <p className="mt-3 text-xs text-faint">{ct("profile.usernameNext", { date: nextChange })}</p> : null}
      <ConfirmDialog
        open={asking}
        onOpenChange={setAsking}
        title={ct("profile.deleteTitle")}
        description={ct("profile.deleteAskBody", { email })}
        confirmLabel={ct("profile.deleteSend")}
        cancelLabel={ct("profile.deleteKeep")}
        onConfirm={async () => {
          const result = await useAccount.getState().requestAccountDeletion();
          if (result) notify({ id: "account-delete-error", tone: "bad", title: ct("profile.deleteSendError") });
          else notify({ id: "account-delete-sent", tone: "good", title: ct("profile.deleteSent", { email }) });
        }}
      />
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={ct("profile.deleteTitle")}
        description={ct("profile.deleteBody")}
        confirmLabel={ct("profile.deleteConfirm")}
        cancelLabel={ct("profile.deleteKeep")}
        onConfirm={async () => {
          const result = await useAccount.getState().deleteAccount();
          if (result === "confirm") notify({ id: "account-delete-error", tone: "bad", title: ct("profile.deleteExpired") });
          else if (result) notify({ id: "account-delete-error", tone: "bad", title: ct("profile.deleteError") });
          else go("hub", { force: true });
        }}
      />
    </Panel>
  );
}

/** Voltou pelo link do e-mail (D127)? Lê e limpa o `?apagar=1` da barra de endereço. */
function takeDeletionReturn(): boolean {
  if (typeof window === "undefined") return false;
  const url = new URL(window.location.href);
  if (url.searchParams.get("apagar") !== "1") return false;
  url.searchParams.delete("apagar");
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  return true;
}

/** O nome do troféu inteiro, com o resumo da conquista ao passar o mouse ou focar (D118). */
function TrophyCaption({ name, description }: { name: string; description: string }) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger delay={150} render={<span className="profile-trophy-name" tabIndex={0} />}>{name}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner side="top" sideOffset={6} collisionPadding={10} className="layer-popover">
            <Tooltip.Popup className="popover-popup" data-size="tip">{description}</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
