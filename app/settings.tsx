import { Redirect } from "expo-router";

export default function SettingsDeepLinkRoute() {
  return <Redirect href="/(app)/settings" />;
}
