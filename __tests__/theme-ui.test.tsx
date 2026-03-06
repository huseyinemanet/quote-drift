import { render } from "@testing-library/react-native";
import * as ReactNative from "react-native";

import { ThemeProvider, darkTheme, lightTheme } from "@/ui/theme";
import { Screen } from "@/ui/Screen";
import { Button } from "@/ui/Button";
import { QuoteCard } from "@/ui/QuoteCard";
import { TodayScreen } from "@/features/today/TodayScreen";

jest.mock("expo-system-ui", () => ({
  setBackgroundColorAsync: jest.fn(),
}));

jest.mock("@/core/bootstrap", () => ({
  useAppState: jest.fn(),
}));

jest.mock("@/features/today/share/useShareQuote", () => ({
  useShareQuote: jest.fn(() => ({
    isPreparing: false,
    share: jest.fn(),
    captureTarget: null,
    toastMessage: null,
  })),
}));

jest.mock("@/features/today/useOneMoreGate", () => ({
  useOneMoreGate: jest.fn(() => ({
    isAlreadyUnlocked: false,
    isOpen: false,
    isSubmitting: false,
    modalStatus: "ready",
    toastMessage: null,
    handleOneMorePress: jest.fn(),
    handleClose: jest.fn(),
    handleWatchAd: jest.fn(),
  })),
}));

const { useAppState } = jest.requireMock("@/core/bootstrap") as {
  useAppState: jest.Mock;
};

function renderWithTheme(ui: React.ReactElement, scheme: "light" | "dark") {
  jest.spyOn(ReactNative, "useColorScheme").mockReturnValue(scheme);

  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe("theme-aware UI", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    useAppState.mockReset();
  });

  it("renders Screen and Button with light theme tokens", () => {
    const view = renderWithTheme(
      <Screen scroll={false}>
        <Button label="Save" onPress={jest.fn()} />
      </Screen>,
      "light"
    );
    const tree = view.toJSON();

    expect(tree).toMatchObject({
      props: {
        style: expect.objectContaining({
          backgroundColor: lightTheme.background,
        }),
      },
    });
    expect(view.getByRole("button")).toHaveStyle({
      backgroundColor: lightTheme.text,
    });
    expect(view.getByText("Save")).toHaveStyle({
      color: lightTheme.background,
    });
  });

  it("renders QuoteCard with dark theme tokens", () => {
    const view = renderWithTheme(
      <QuoteCard
        eyebrow="Quote of the day"
        quote={{
          id: "q-1",
          text: "Stay close to the work.",
          author: "Tester",
          authorId: "tester-000001",
          tags: ["clarity"],
          primaryTag: "clarity",
          saved: false,
        }}
      />,
      "dark"
    );
    const tree = view.toJSON();

    expect(view.getByText("Stay close to the work.")).toHaveStyle({
      color: darkTheme.text,
    });
    expect(tree).toMatchObject({
      props: {
        style: expect.objectContaining({
          backgroundColor: darkTheme.surface,
          borderColor: darkTheme.border,
        }),
      },
    });
  });

  it("propagates dark theme through TodayScreen", () => {
    useAppState.mockReturnValue({
      todayQuote: {
        id: "q-2",
        text: "Make the useful thing obvious.",
        author: "H. E.",
        authorId: "h-e-000001",
        tags: ["clarity"],
        primaryTag: "clarity",
        saved: false,
      },
      extraQuote: null,
      streak: 4,
      notificationSettings: {
        enabled: false,
        permission_status: "denied",
      },
      claimExtraQuote: jest.fn(),
      toggleSave: jest.fn(),
    });

    const view = renderWithTheme(<TodayScreen />, "dark");

    expect(view.getByText("Today")).toHaveStyle({
      color: darkTheme.text,
    });
    expect(view.getByText("4 day read streak")).toHaveStyle({
      color: darkTheme.textMuted,
    });
    expect(view.getByText("Reminders are currently off")).toBeTruthy();
  });
});
