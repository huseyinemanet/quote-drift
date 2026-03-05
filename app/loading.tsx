import { Redirect } from "expo-router";

import { useAppState } from "@/core/bootstrap";
import { LoadingScreen } from "@/features/system/SystemScreens";

export default function LoadingRoute() {
  const { state } = useAppState();

  if (state === "ready") {
    return <Redirect href="/(app)/today" />;
  }

  if (state === "onboarding") {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  if (state === "fatalCorpus") {
    return <Redirect href="/fatal-data" />;
  }

  if (state === "exhausted") {
    return <Redirect href="/exhausted" />;
  }

  return <LoadingScreen />;
}
