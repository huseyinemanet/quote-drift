module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|expo(nent)?|@expo(nent)?/.*|expo-.*|@expo/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-navigation|@react-navigation/.*))",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["/node_modules/"],
};
