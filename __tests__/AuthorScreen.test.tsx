import { render } from "@testing-library/react-native";

import { ThemeProvider } from "@/ui/theme";
import { AuthorScreen } from "@/features/author/AuthorScreen";

jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({
    authorId: "missing-author",
  })),
}));

jest.mock("@/core/bootstrap", () => ({
  useAppState: jest.fn(() => ({
    toggleSave: jest.fn(),
  })),
}));

jest.mock("@/core/authors", () => ({
  getAuthorById: jest.fn(async () => null),
  getAuthorQuoteCount: jest.fn(),
  getQuotesByAuthorId: jest.fn(),
}));

describe("AuthorScreen", () => {
  it("renders a safe empty state for an invalid route", async () => {
    const view = render(
      <ThemeProvider>
        <AuthorScreen />
      </ThemeProvider>
    );

    expect(await view.findByText("Author not found")).toBeTruthy();
  });
});
