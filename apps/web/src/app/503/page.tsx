import { ErrorAction, ErrorPage, GroundworkIcon } from "@/components/ErrorPage";

export const metadata = { title: "503 | CRAQUE" };

/**
 * Same idea as the 403: the game never serves this itself, but a host taking
 * the site down for maintenance can point at it instead of a default page.
 */
export default function Unavailable() {
  return (
    <ErrorPage
      code="503"
      tone="muted"
      eyebrow="Gramado em manutenção"
      title="O jogo está fora do ar por um instante"
      description="Estamos mexendo em alguma coisa nos bastidores. Tente de novo daqui a pouco, sua carreira fica guardada no seu navegador."
      art={<GroundworkIcon />}
    >
      <ErrorAction href="/">Tentar de novo</ErrorAction>
    </ErrorPage>
  );
}
