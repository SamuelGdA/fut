import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import { TopBar } from "@/components/TopBar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Condensed grotesque for headings — reads like a matchday programme.
const display = Archivo({
  variable: "--font-display",
  weight: ["600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRAQUE | Simulador de Carreira",
  description: "Monte seu jogador, evolua seus atributos e construa uma carreira do zero até a aposentadoria.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={`dark ${inter.variable} ${display.variable} h-full antialiased`}>
      {/* The shell is exactly one viewport tall and never scrolls itself.
          Anything that needs to scroll does so inside its own box, which keeps
          the card, the decision and the table on screen together instead of
          turning the game into a document you read top to bottom. `dvh` rather
          than `vh` so mobile browser chrome cannot push the bottom of the game
          out of sight. */}
      <body
        className="flex h-[100dvh] flex-col overflow-hidden bg-background text-foreground"
        suppressHydrationWarning
      >
        <I18nProvider>
          <TopBar />
          <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
