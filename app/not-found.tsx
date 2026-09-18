import { BallOutIcon, ErrorAction, ErrorPage } from "@/components/ErrorPage";

export const metadata = { title: "404 | CRAQUE" };

export default function NotFound() {
  return (
    <ErrorPage
      code="404"
      tone="gold"
      eyebrow="Bola fora"
      title="Essa página saiu pela linha"
      description="O endereço que você tentou abrir não existe por aqui. Volte para o início e comece de novo, a carreira continua salva."
      art={<BallOutIcon />}
    >
      <ErrorAction href="/">Voltar ao início</ErrorAction>
    </ErrorPage>
  );
}
