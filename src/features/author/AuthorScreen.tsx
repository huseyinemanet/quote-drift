import { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { getAuthorById, getAuthorQuoteCount, getQuotesByAuthorId } from "@/core/authors";
import { copyQuoteText, shareQuoteText } from "@/core/sharecard/quoteText";
import { useAppState } from "@/core/bootstrap";
import type { Author, QuoteView } from "@/core/types";
import type { AuthorQuoteSort } from "@/core/authors";
import { Button } from "@/ui/Button";
import { ChoiceChip } from "@/ui/ChoiceChip";
import { EmptyState } from "@/ui/EmptyState";
import { QuoteListItem } from "@/ui/QuoteListItem";
import { Screen } from "@/ui/Screen";
import { ToastMessage } from "@/ui/components/ToastMessage";
import { ThemeTokens, useTheme } from "@/ui/theme";

const SORT_OPTIONS: { value: AuthorQuoteSort; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "shortest", label: "Shortest" },
  { value: "longest", label: "Longest" },
  { value: "saved", label: "Saved first" },
];

type LoadState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "ready"; author: Author; quoteCount: number; quotes: QuoteView[] };

export function AuthorScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { authorId } = useLocalSearchParams<{ authorId?: string | string[] }>();
  const normalizedAuthorId = useMemo(
    () => (Array.isArray(authorId) ? authorId[0] : authorId) ?? "",
    [authorId]
  );
  const { toggleSave } = useAppState();
  const [sort, setSort] = useState<AuthorQuoteSort>("default");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2200);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!normalizedAuthorId) {
        setState({ status: "not-found" });
        return;
      }

      setState({ status: "loading" });
      const author = await getAuthorById(normalizedAuthorId);
      if (!author) {
        if (!cancelled) {
          setState({ status: "not-found" });
        }
        return;
      }

      const [quoteCount, quotes] = await Promise.all([
        getAuthorQuoteCount(normalizedAuthorId),
        getQuotesByAuthorId(normalizedAuthorId, sort),
      ]);

      if (!cancelled) {
        setState({
          status: "ready",
          author,
          quoteCount,
          quotes,
        });
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [normalizedAuthorId, sort]);

  const handleToggleSave = async (quoteId: string) => {
    await toggleSave(quoteId);
    if (state.status !== "ready") {
      return;
    }

    const quotes = await getQuotesByAuthorId(normalizedAuthorId, sort);
    setState({ ...state, quotes });
  };

  const handleCopy = async (quote: QuoteView) => {
    try {
      await copyQuoteText(quote);
      showToast("Copied quote.");
    } catch {
      showToast("Couldn't copy that quote.");
    }
  };

  const handleShare = async (quote: QuoteView) => {
    try {
      await shareQuoteText(quote);
    } catch {
      showToast("Couldn't open sharing right now.");
    }
  };

  if (state.status === "loading") {
    return (
      <Screen>
        <Button label="Back" variant="ghost" onPress={() => router.back()} />
        <EmptyState
          title="Loading author"
          body="Gathering quotes for this author."
        />
      </Screen>
    );
  }

  if (state.status === "not-found") {
    return (
      <Screen>
        <Button label="Back" variant="ghost" onPress={() => router.back()} />
        <EmptyState
          title="Author not found"
          body="This author page is unavailable or the link is no longer valid."
        />
      </Screen>
    );
  }

  const { author, quoteCount, quotes } = state;

  return (
    <Screen>
      <Button label="Back" variant="ghost" onPress={() => router.back()} />
      <View style={styles.header}>
        <Text style={styles.title}>{author.name}</Text>
        <Text style={styles.subtitle}>{quoteCount} quotes</Text>
      </View>
      {author.shortBio || author.description ? (
        <View style={styles.bioBlock}>
          {author.shortBio ? <Text style={styles.bio}>{author.shortBio}</Text> : null}
          {author.description ? (
            <Text style={styles.description}>{author.description}</Text>
          ) : null}
        </View>
      ) : null}
      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((option) => (
          <ChoiceChip
            key={option.value}
            label={option.label}
            selected={sort === option.value}
            onPress={() => setSort(option.value)}
          />
        ))}
      </View>
      {quotes.length === 0 ? (
        <EmptyState
          title="No quotes here yet"
          body="This author has metadata, but there are no quotes in the local collection."
        />
      ) : (
        quotes.map((quote) => (
          <QuoteListItem
            key={quote.id}
            quote={quote}
            showAuthor={false}
            onToggleSave={() => handleToggleSave(quote.id)}
            onCopy={() => handleCopy(quote)}
            onShare={() => handleShare(quote)}
          />
        ))
      )}
      {toastMessage ? <ToastMessage message={toastMessage} /> : null}
    </Screen>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    header: {
      gap: 4,
    },
    title: {
      fontSize: 32,
      fontWeight: "700",
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
    },
    bioBlock: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 16,
      gap: 8,
    },
    bio: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.text,
    },
    description: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.textMuted,
    },
    sortRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
  });
