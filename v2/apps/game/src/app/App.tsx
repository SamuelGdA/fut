import { LazyMotion, MotionConfig } from "motion/react";
import { useEffect } from "react";
import { usePrefs } from "../store/prefs";
import { AppShell } from "./AppShell";
import { ErrorBoundary } from "./ErrorBoundary";
import { connectHistory } from "./navigation";
import { PrefsEffects } from "./PrefsEffects";
import { PwaEffects } from "./PwaEffects";
import { ScreenOutlet } from "./ScreenOutlet";

const loadMotionFeatures = () => import("./motion-features").then((module) => module.default);

export function App() {
  const motion = usePrefs((state) => state.motion);

  useEffect(() => connectHistory(), []);

  return (
    <ErrorBoundary>
      <PrefsEffects />
      <PwaEffects />
      <LazyMotion features={loadMotionFeatures} strict>
        <MotionConfig reducedMotion={motion === "reduced" ? "always" : "user"}>
          <AppShell>
            <ScreenOutlet />
          </AppShell>
        </MotionConfig>
      </LazyMotion>
    </ErrorBoundary>
  );
}
