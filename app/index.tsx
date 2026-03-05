import { Redirect } from "expo-router";

import { useAppState } from "@/core/bootstrap";

export default function IndexRoute() {
  const { state } = useAppState();

  if (state === "loading") {
    return <Redirect href="/loading" />;
  }

  if (state === "fatalCorpus") {
    return <Redirect href="/fatal-data" />;
  }

  if (state === "onboarding") {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  if (state === "exhausted") {
    return <Redirect href="/exhausted" />;
  }

  return <Redirect href="/(app)/today" />;
}
