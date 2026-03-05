import Constants from "expo-constants";

export const appConfig = {
  supportUrl:
    Constants.expoConfig?.extra?.supportUrl ?? "https://www.example.com/",
  privacyUrl:
    Constants.expoConfig?.extra?.privacyUrl ?? "https://www.example.com/",
  sourcesUrl:
    Constants.expoConfig?.extra?.sourcesUrl ?? "https://www.example.com/",
};
