import { ArrowLeft, BarChart3, LogIn, Medal, ShieldCheck, Trophy, UserPlus } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { screenUrl, useNavigation } from "../../app/navigation";
import { useDraft } from "../../features/career/draft";
import { usePrefs } from "../../store/prefs";
import { ACCOUNTS_ENABLED } from "../../features/account/config";
import { renderGoogleButton } from "../../features/account/googleButton";
import { takeLoginReturn } from "../../features/account/openLogin";
import { useAccount } from "../../features/account/store";
import { type ContaKey, useContaT } from "../../i18n/conta/useContaT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { PitchMark } from "../../ui/PitchMark";
import { PlayerCard } from "../../ui/PlayerCard";
import { Segmented } from "../../ui/Segmented";
import { Skeleton } from "../../ui/Skeleton";
import { notify } from "../../ui/toast/notify";
import { AuthField, GoogleMark } from "./AuthField";

type Mode = "signIn" | "signUp" | "reset" | "confirm";
type Availability = "idle" | "checking" | "free" | "taken" | "invalid";

/** Códigos de erro que a tela sabe dizer; o resto vira "algo deu errado". */
const ERRORS = new Set(["invalid", "unconfirmed", "weakPassword", "samePassword", "rateLimit", "disabled", "exists", "network", "unknown", "email", "username", "reserved", "taken"]);
const errorKey = (code: string): ContaKey => `login.errors.${ERRORS.has(code) ? code : "unknown"}` as ContaKey;

/**
 * O login (D112), em `/login`: o palco com o campo e a carta do jogador, e o
 * cartão de acesso. Google primeiro; e-mail e senha logo abaixo (entrar,
 * criar conta com confirmação por e-mail, recuperar a senha). A volta dos
 * links (Google, confirmação, recuperação) também cai aqui: senha nova quando
 * o link é de recuperação e, na primeira vez, o passo obrigatório do @.
 */
export function LoginScreen() {
  const { t } = useContaT();
  const status = useAccount((state) => state.status);
  const dataStatus = useAccount((state) => state.dataStatus);
  const profile = useAccount((state) => state.profile);
  const recovery = useAccount((state) => state.recovery);
  const go = useNavigation((state) => state.go);
  const leaving = useRef(false);

  // Logado e com @: volta para onde estava (ou o hub), com as boas-vindas.
  useEffect(() => {
    if (leaving.current || status !== "member" || dataStatus !== "ready" || !profile?.username || recovery) return;
    leaving.current = true;
    notify({ id: "account-welcome", tone: "good", title: t("account.welcome", { name: profile.username }) });
    go(takeLoginReturn(), { replace: true });
  }, [status, dataStatus, profile, recovery, go, t]);

  let panel: ReactNode;
  if (!ACCOUNTS_ENABLED || status === "off") panel = <OffPanel />;
  else if (status === "checking" || (status === "member" && (dataStatus === "idle" || dataStatus === "loading"))) panel = <CheckingPanel />;
  else if (status === "member" && recovery) panel = <RecoveryPanel />;
  else if (status === "member" && dataStatus === "error") panel = <ErrorPanel />;
  else if (status === "member" && profile && !profile.username) panel = <OnboardingPanel />;
  else if (status === "member") panel = <CheckingPanel />;
  else panel = <GuestPanel />;

  return (
    <div className="auth-page">
      <Stage />
      <section className="auth-panel" aria-live="polite">
        {panel}
      </section>
    </div>
  );
}

/** O palco: o campo visto de cima, a carta do jogador e o que a conta traz. */
function Stage() {
  const { t, ct } = useContaT();
  const draft = useDraft();
  const perks: { icon: typeof Trophy; key: ContaKey }[] = [
    { icon: Trophy, key: "login.perks.trophies" },
    { icon: Medal, key: "login.perks.ranking" },
    { icon: BarChart3, key: "login.perks.stats" },
  ];
  return (
    <section className="auth-stage pitch-stripes" aria-labelledby="auth-title">
      <div className="auth-stage-copy">
        <p className="eyebrow text-glory">{ct("login.eyebrow")}</p>
        <h1 id="auth-title" className="auth-title">{ct("login.title")}</h1>
        <p className="auth-lead">{ct("login.lead")}</p>
        <ul className="auth-perks">
          {perks.map(({ icon: Icon, key }) => (
            <li key={key}>
              <span className="auth-perk-icon" aria-hidden="true"><Icon size={16} /></span>
              {ct(key)}
            </li>
          ))}
        </ul>
      </div>
      {/* D118: o campo e a carta no meio do palco, à mostra, no espaço que sobrava. */}
      <div className="auth-stage-art" aria-hidden="true">
        <svg className="auth-stage-pitch" viewBox="0 0 400 600" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice">
          <rect x="20" y="20" width="360" height="560" rx="6" />
          <line x1="20" y1="300" x2="380" y2="300" />
          <circle cx="200" cy="300" r="64" className="auth-stage-circle" />
          <rect x="110" y="20" width="180" height="84" />
          <rect x="110" y="496" width="180" height="84" />
        </svg>
        <div className="auth-stage-card">
          <PlayerCard
            surname={draft.surname.trim().toLocaleUpperCase() || t("card.you")}
            position={draft.position ?? "st"}
            ovr={null}
            attributes={null}
            nationality={draft.nationality}
            club={null}
            league={null}
            shirt={draft.dreamNumber}
            avatar={draft.avatar}
            width={200}
          />
        </div>
      </div>
    </section>
  );
}

function PanelHead({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: string }) {
  return (
    <header className="mb-5">
      {eyebrow ? <p className="eyebrow text-glory">{eyebrow}</p> : null}
      <h2 className="display mt-1 text-4xl leading-none font-black uppercase">{title}</h2>
      {lead ? <p className="mt-2 text-sm text-muted">{lead}</p> : null}
    </header>
  );
}

function FormError({ code }: { code: string | null }) {
  const { ct } = useContaT();
  if (!code) return null;
  return (
    <p className="auth-error" role="alert">
      {ct(errorKey(code))}
    </p>
  );
}

function CheckingPanel() {
  const { ct } = useContaT();
  return (
    <div role="status" aria-label={ct("login.checking")} className="flex flex-col gap-4">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-1/2" />
      <span className="sr-only">{ct("login.checking")}</span>
    </div>
  );
}

function OffPanel() {
  const { t, ct } = useContaT();
  const go = useNavigation((state) => state.go);
  return (
    <div>
      <PanelHead title={ct("login.off.title")} lead={ct("login.off.body")} />
      <Button variant="secondary" onClick={() => go("hub")}>
        <ArrowLeft size={16} aria-hidden="true" />
        {t("brand.hub")}
      </Button>
    </div>
  );
}

function ErrorPanel() {
  const { ct } = useContaT();
  return (
    <div>
      <PanelHead title={ct("profile.loadError")} />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void useAccount.getState().refresh()}>{ct("profile.retry")}</Button>
        <Button variant="ghost" onClick={() => void useAccount.getState().signOut()}>{ct("login.onboarding.signOut")}</Button>
      </div>
    </div>
  );
}

/** As letras miúdas com os links das páginas legais. */
function Agreement() {
  const { ct } = useContaT();
  const go = useNavigation((state) => state.go);
  const [before, middle = "", after = ""] = ct("login.agree").split(/\{terms\}|\{privacy\}/);
  const link = (screen: "terms" | "privacy", label: string) => (
    <a
      href={screenUrl(screen)}
      className="auth-link"
      onClick={(event) => {
        event.preventDefault();
        go(screen);
      }}
    >
      {label}
    </a>
  );
  return (
    <p className="mt-4 text-xs text-faint">
      {before}
      {link("terms", ct("terms.title"))}
      {middle}
      {link("privacy", ct("privacy.title"))}
      {after}
    </p>
  );
}

/** Idioma do botão e da janelinha do Google. */
const GOOGLE_LANGUAGE = { pt: "pt-BR", es: "es", en: "en" } as const;

/**
 * "Continuar com Google" (D123): o botão oficial do Google, que abre a
 * janelinha do navegador a cada clique, sem sair do site. Enquanto o script
 * do Google carrega, e se ele não carregar, fica o botão do jogo, que vai
 * pela página do Google.
 */
function GoogleButton() {
  const { ct, locale } = useContaT();
  const theme = usePrefs((state) => state.theme);
  const slot = useRef<HTMLDivElement>(null);
  const [official, setOfficial] = useState(false);
  const [width, setWidth] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // O botão do Google tem largura fixa: acompanha a coluna do login.
  useEffect(() => {
    const node = slot.current?.parentElement;
    if (!node) return;
    const measure = () => setWidth(Math.round(node.getBoundingClientRect().width));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const parent = slot.current;
    if (!parent || width === 0) return;
    let current = true;
    void renderGoogleButton(parent, { theme: theme === "dark" ? "filled_black" : "outline", width, locale: GOOGLE_LANGUAGE[locale] }, (token, nonce) => {
      if (!alive.current) return;
      setBusy(true);
      setError(null);
      void useAccount
        .getState()
        .signInWithGoogleToken(token, nonce)
        .then((result) => {
          if (!alive.current) return;
          setBusy(false);
          setError(result);
        });
    }).then((drawn) => {
      if (current && alive.current) setOfficial(drawn);
    });
    return () => {
      current = false;
    };
  }, [theme, locale, width]);

  return (
    <>
      <div className="google-slot" aria-busy={busy || undefined}>
        <div ref={slot} className="google-official" hidden={!official} />
        {official ? null : (
          <button
            type="button"
            className="google-button"
            aria-busy={busy || undefined}
            disabled={busy}
            onClick={async () => {
              feedback("confirm");
              setBusy(true);
              setError(null);
              const result = await useAccount.getState().signInWithGoogle();
              // Sem erro, o navegador já está indo para o Google.
              if (result && alive.current) {
                setError(result);
                setBusy(false);
              }
            }}
          >
            <GoogleMark />
            {ct("login.google")}
          </button>
        )}
      </div>
      <FormError code={error} />
    </>
  );
}

/** O aviso da volta de um link (e-mail confirmado em outro navegador, link vencido, Google cancelado). */
function LinkNotice() {
  const { ct } = useContaT();
  const notice = useAccount((state) => state.notice);
  if (notice !== "confirmedElsewhere" && notice !== "linkExpired" && notice !== "oauthError") return null;
  return (
    <p className="auth-notice" data-tone={notice === "confirmedElsewhere" ? "good" : "bad"} role="status">
      {ct(`login.notices.${notice}`)}
    </p>
  );
}

function GuestPanel() {
  const { t, ct } = useContaT();
  const go = useNavigation((state) => state.go);
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");

  if (mode === "reset") return <ResetPanel email={email} onEmail={setEmail} onBack={() => setMode("signIn")} />;
  if (mode === "confirm") return <ConfirmPanel email={email} onBack={() => setMode("signIn")} />;

  return (
    <div>
      <LinkNotice />
      {/* O título grande está no palco; aqui o seletor já diz se é entrar ou criar conta. */}
      <h2 className="sr-only">{mode === "signIn" ? ct("login.tabs.signIn") : ct("login.tabs.signUp")}</h2>
      <GoogleButton />
      <p className="auth-divider"><span>{ct("login.or")}</span></p>
      <Segmented<"signIn" | "signUp">
        block
        className="mb-4"
        label={t("account.signInLong")}
        value={mode}
        onValueChange={(next) => {
          feedback("tick");
          setMode(next);
        }}
        options={[
          { value: "signIn", label: ct("login.tabs.signIn") },
          { value: "signUp", label: ct("login.tabs.signUp") },
        ]}
      />
      {mode === "signIn" ? (
        <SignInForm email={email} onEmail={setEmail} onForgot={() => setMode("reset")} />
      ) : (
        <SignUpForm email={email} onEmail={setEmail} onConfirm={() => setMode("confirm")} />
      )}
      <p className="mt-4 text-xs text-faint">{ct("login.sameAccount")}</p>
      <Agreement />
      <Button
        variant="ghost"
        size="sm"
        className="mt-3"
        onClick={() => {
          feedback("back");
          go(takeLoginReturn());
        }}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {ct("login.guest")}
      </Button>
      <span className="sr-only">{t("account.guestNotice")}</span>
    </div>
  );
}

function SignInForm({ email, onEmail, onForgot }: { email: string; onEmail(value: string): void; onForgot(): void }) {
  const { ct } = useContaT();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await useAccount.getState().signInWithEmail(email, password);
    setBusy(false);
    if (result) {
      feedback("back");
      setError(result);
    } else {
      feedback("confirm");
    }
  };
  return (
    <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
      <AuthField label={ct("login.email")} type="email" autoComplete="email" inputMode="email" value={email} onValueChange={onEmail} required />
      <AuthField
        label={ct("login.password")}
        type="password"
        autoComplete="current-password"
        value={password}
        onValueChange={setPassword}
        reveal={{ show: ct("login.showPassword"), hide: ct("login.hidePassword") }}
        required
      />
      <button type="button" className="auth-link self-start text-sm" onClick={onForgot}>
        {ct("login.forgot")}
      </button>
      <FormError code={error} />
      <Button type="submit" size="lg" block loading={busy}>
        <LogIn size={18} aria-hidden="true" />
        {ct("login.submitSignIn")}
      </Button>
    </form>
  );
}

/** Confere o @ enquanto o jogador digita (com uma pausa curta para não perguntar a cada letra). */
function useUsernameCheck(username: string): Availability {
  const value = username.trim().replace(/^@/, "").toLowerCase();
  // A resposta guarda o @ que foi conferido: digitou outro, volta a "conferindo".
  const [answer, setAnswer] = useState<{ value: string; availability: Availability } | null>(null);
  useEffect(() => {
    if (value.length === 0) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const result = await useAccount.getState().checkUsername(value);
      if (!cancelled) setAnswer({ value, availability: result === "network" ? "idle" : result });
    }, 450);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value]);
  if (value.length === 0) return "idle";
  return answer?.value === value ? answer.availability : "checking";
}

function usernameStatus(availability: Availability, username: string, ct: (key: ContaKey, vars?: Record<string, string>) => string) {
  const name = username.trim().replace(/^@/, "").toLowerCase();
  if (availability === "checking") return { text: ct("login.onboarding.checking"), tone: "muted" as const };
  if (availability === "free") return { text: ct("login.onboarding.free", { name }), tone: "good" as const };
  if (availability === "taken") return { text: ct("login.onboarding.taken", { name }), tone: "bad" as const };
  return null;
}

function SignUpForm({ email, onEmail, onConfirm }: { email: string; onEmail(value: string): void; onConfirm(): void }) {
  const { ct } = useContaT();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const availability = useUsernameCheck(username);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await useAccount.getState().signUp(email, password, username);
    setBusy(false);
    if (result.error) {
      feedback("back");
      setError(result.error);
      return;
    }
    feedback("confirm");
    if (result.confirm) onConfirm();
  };
  return (
    <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
      <AuthField
        label={ct("login.username")}
        prefix="@"
        autoComplete="username"
        autoCapitalize="none"
        maxLength={21}
        value={username}
        onValueChange={setUsername}
        hint={ct("login.usernameHint")}
        error={availability === "invalid" && username.length > 2 ? ct("login.errors.username") : undefined}
        status={usernameStatus(availability, username, ct)}
        required
      />
      <AuthField label={ct("login.email")} type="email" autoComplete="email" inputMode="email" value={email} onValueChange={onEmail} required />
      <AuthField
        label={ct("login.password")}
        type="password"
        autoComplete="new-password"
        value={password}
        onValueChange={setPassword}
        hint={ct("login.passwordHint")}
        reveal={{ show: ct("login.showPassword"), hide: ct("login.hidePassword") }}
        required
      />
      <FormError code={error} />
      <Button type="submit" size="lg" block loading={busy} disabled={availability === "taken"}>
        <UserPlus size={18} aria-hidden="true" />
        {ct("login.submitSignUp")}
      </Button>
    </form>
  );
}

function ResetPanel({ email, onEmail, onBack }: { email: string; onEmail(value: string): void; onBack(): void }) {
  const { ct } = useContaT();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await useAccount.getState().requestPasswordReset(email);
    setBusy(false);
    if (result) setError(result);
    else setSent(true);
  };
  return (
    <div>
      <PanelHead title={ct("login.reset.title")} lead={ct("login.reset.lead")} />
      {sent ? (
        <p className="auth-notice" data-tone="good" role="status">{ct("login.reset.sent")}</p>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
          <AuthField label={ct("login.email")} type="email" autoComplete="email" inputMode="email" value={email} onValueChange={onEmail} required />
          <FormError code={error} />
          <Button type="submit" size="lg" block loading={busy}>{ct("login.reset.submit")}</Button>
        </form>
      )}
      <Button variant="ghost" size="sm" className="mt-4" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden="true" />
        {ct("login.reset.back")}
      </Button>
    </div>
  );
}

function ConfirmPanel({ email, onBack }: { email: string; onBack(): void }) {
  const { ct } = useContaT();
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <PanelHead eyebrow={ct("login.confirm.eyebrow")} title={ct("login.confirm.title")} lead={ct("login.confirm.body", { email: email.trim() })} />
      <p className="text-sm text-muted">{ct("login.confirm.spam")}</p>
      {resent ? <p className="auth-notice mt-4" data-tone="good" role="status">{ct("login.confirm.resent")}</p> : null}
      <FormError code={error} />
      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          loading={busy}
          disabled={resent}
          onClick={async () => {
            setBusy(true);
            setError(null);
            const result = await useAccount.getState().resendConfirmation(email);
            setBusy(false);
            if (result) setError(result);
            else setResent(true);
          }}
        >
          {ct("login.confirm.resend")}
        </Button>
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          {ct("login.confirm.back")}
        </Button>
      </div>
    </div>
  );
}

function RecoveryPanel() {
  const { ct } = useContaT();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await useAccount.getState().updatePassword(password);
    setBusy(false);
    if (result) setError(result);
    else notify({ id: "account-password", tone: "good", title: ct("login.recovery.done") });
  };
  return (
    <div>
      <PanelHead eyebrow={ct("login.recovery.eyebrow")} title={ct("login.recovery.title")} lead={ct("login.recovery.lead")} />
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <AuthField
          label={ct("login.passwordNew")}
          type="password"
          autoComplete="new-password"
          value={password}
          onValueChange={setPassword}
          hint={ct("login.passwordHint")}
          reveal={{ show: ct("login.showPassword"), hide: ct("login.hidePassword") }}
          required
        />
        <FormError code={error} />
        <Button type="submit" size="lg" block loading={busy}>
          <ShieldCheck size={18} aria-hidden="true" />
          {ct("login.recovery.submit")}
        </Button>
      </form>
    </div>
  );
}

/** O passo obrigatório do @ (D112): ninguém joga logado sem ele. */
function OnboardingPanel() {
  const { ct } = useContaT();
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const availability = useUsernameCheck(username);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await useAccount.getState().setUsername(username);
    setBusy(false);
    if (result) {
      feedback("back");
      setError(result);
    } else {
      feedback("whistle");
    }
  };
  return (
    <div>
      <PanelHead eyebrow={ct("login.onboarding.eyebrow")} title={ct("login.onboarding.title")} lead={ct("login.onboarding.lead")} />
      <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <AuthField
          label={ct("login.username")}
          prefix="@"
          autoComplete="username"
          autoCapitalize="none"
          maxLength={21}
          value={username}
          onValueChange={setUsername}
          hint={ct("login.usernameHint")}
          error={availability === "invalid" && username.length > 2 ? ct("login.errors.username") : undefined}
          status={usernameStatus(availability, username, ct)}
          autoFocus
          required
        />
        <FormError code={error} />
        <Button type="submit" size="lg" variant="glory" block loading={busy} disabled={availability === "taken"}>
          <PitchMark className="h-5 w-4" />
          {ct("login.onboarding.submit")}
        </Button>
      </form>
      <Button variant="ghost" size="sm" className="mt-4" onClick={() => void useAccount.getState().signOut()}>
        {ct("login.onboarding.signOut")}
      </Button>
    </div>
  );
}
