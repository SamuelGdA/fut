"use client";

import { useCareerStore } from "@/store/careerStore";
import { IntroScreen } from "@/components/screens/IntroScreen";
import { IdentityScreen } from "@/components/screens/IdentityScreen";
import { AppearanceScreen } from "@/components/screens/AppearanceScreen";
import { CareerScreen } from "@/components/screens/CareerScreen";
import { SummaryScreen } from "@/components/screens/SummaryScreen";
import { ChallengeScreen } from "@/components/screens/ChallengeScreen";
import { DebugPanel } from "@/components/DebugPanel";

export default function CareerPage() {
  const screen = useCareerStore((s) => s.screen);

  return (
    <>
      {screen === "identity" && <IdentityScreen />}
      {screen === "appearance" && <AppearanceScreen />}
      {screen === "career" && <CareerScreen />}
      {screen === "summary" && <SummaryScreen />}
      {screen === "challenge" && <ChallengeScreen />}
      {screen === "intro" && <IntroScreen />}
      <DebugPanel />
    </>
  );
}
