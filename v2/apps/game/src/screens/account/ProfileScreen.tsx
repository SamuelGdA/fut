import { ArrowRight, LogOut, Pencil, Play, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { screenUrl, useNavigation } from "../../app/navigation";
import { openLogin } from "../../features/account/openLogin";
import type { Profile, Trophy } from "../../features/account/schemas";
import { useAccount } from "../../features/account/store";
import { AdSlot } from "../../features/consent/AdSlot";
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
        {[0, 1, 2].map((panel) => (
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
  const user = useAccount((state) => state.user);
  const trophies = useAccount((state) => state.trophies);
  const username = profile.username ?? "";
  const providers = (user?.providers ?? []).map((provider) => (provider === "google" ? ct("profile.providers.google") : ct("profile.providers.email")));
  const list = new Intl.ListFormat(locale, { type: "conjunction" }).format(providers);

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
        { key: "profile.stats.challenges", value: profile.desafios },
        { key: "profile.stats.bestChallenge", value: profile.melhor_desafio },
      ],
    },
    {
      section: "profile.sections.tecnico",
      items: [
        { key: "profile.stats.coachCareers", value: profile.carreiras_tecnico },
        { key: "profile.stats.coachSeasons", value: profile.temporadas_tecnico },
        { key: "profile.stats.coachTitles", value: profile.titulos_tecnico },
      ],
    },
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
            {list ? ` · ${ct("profile.signsInWith", { list })}` : ""}
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

      <AccountPanel username={username} />

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

function Showcase({ trophies }: { trophies: readonly Trophy[] }) {
  const { t, tp, ct, locale } = useContaT();
  const go = useNavigation((state) => state.go);
  const shown = trophies
    .map((trophy) => ({ trophy, entry: catalogEntry(trophy.id_trophy) }))
    .filter((item): item is { trophy: Trophy; entry: NonNullable<ReturnType<typeof catalogEntry>> } => item.entry !== null)
    .sort((a, b) => rarityRank(a.entry.rarity) - rarityRank(b.entry.rarity) || b.trophy.quantidade - a.trophy.quantidade || a.trophy.data_desbloqueio.localeCompare(b.trophy.data_desbloqueio))
    .slice(0, SHOWCASE);
  return (
    <Panel
      title={ct("profile.showcase")}
      aside={<span className="numeric text-xs text-muted">{ct("profile.showcaseCount", { count: trophies.length, total: CATALOG.length })}</span>}
      className="mt-6"
    >
      {shown.length === 0 ? (
        <p className="text-sm text-muted">{ct("profile.showcaseEmpty")}</p>
      ) : (
        <ul className="profile-showcase">
          {shown.map(({ trophy, entry }) => {
            const { name } = entryText(locale, entry);
            const label = `${t("achievements.trophyUnlocked", { name })}, ${tp("achievements.quantity", trophy.quantidade).toLocaleLowerCase(locale)}`;
            return (
              <li key={trophy.id_trophy} className="profile-trophy">
                <TrophyIcon id={entry.id} group={entry.group} rarity={entry.rarity} unlocked quantity={trophy.quantidade} label={label} language={locale} size="lg" />
                <span className="profile-trophy-name" aria-hidden="true">{name}</span>
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

function AccountPanel({ username }: { username: string }) {
  const { ct } = useContaT();
  const go = useNavigation((state) => state.go);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(username);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await useAccount.getState().setUsername(draft);
    setBusy(false);
    if (result) {
      setError(result === "taken" ? ct("login.errors.taken") : result === "network" ? ct("login.errors.network") : ct("login.errors.username"));
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
          <div className="flex gap-2">
            <Button type="submit" loading={busy}>{ct("profile.save")}</Button>
            <Button variant="ghost" onClick={() => { setEditing(false); setDraft(username); setError(null); }}>{ct("profile.cancel")}</Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
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
          <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
            <Trash2 size={15} aria-hidden="true" />
            {ct("profile.delete")}
          </Button>
        </div>
      )}
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={ct("profile.deleteTitle")}
        description={ct("profile.deleteBody")}
        confirmLabel={ct("profile.deleteConfirm")}
        cancelLabel={ct("profile.deleteKeep")}
        onConfirm={async () => {
          const result = await useAccount.getState().deleteAccount();
          if (result) notify({ id: "account-delete-error", tone: "bad", title: ct("profile.deleteError") });
          else go("hub", { force: true });
        }}
      />
    </Panel>
  );
}
