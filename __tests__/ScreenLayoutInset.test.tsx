jest.mock("expo-system-ui", () => ({
  setBackgroundColorAsync: jest.fn(),
}));

import { render } from "@testing-library/react-native";
import { Text } from "react-native";

import { BottomChromeInsetProvider } from "@/features/layout/BottomChromeInset";
import { Screen } from "@/ui/Screen";
import { ThemeProvider } from "@/ui/theme";

describe("Screen bottom inset", () => {
  it("applies bottom chrome inset to scroll content", () => {
    const view = render(
      <ThemeProvider>
        <BottomChromeInsetProvider value={140}>
          <Screen>
            <Text>Library</Text>
          </Screen>
        </BottomChromeInsetProvider>
      </ThemeProvider>
    );

    const scrollView = view.UNSAFE_getByType(require("react-native").ScrollView);
    const style = Array.isArray(scrollView.props.contentContainerStyle)
      ? Object.assign({}, ...scrollView.props.contentContainerStyle)
      : scrollView.props.contentContainerStyle;

    expect(style.paddingBottom).toBe(164);
  });
});
