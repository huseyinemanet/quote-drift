import { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getAuthorById, getAuthorQuoteCount, getQuotesByAuthorId } from "@/core/authors";
import { copyQuoteText, shareQuoteText } from "@/core/sharecard/quoteText";
import { useAppState } from "@/core/bootstrap";
import { selectionHaptic } from "@/core/haptics";
import type { Author, QuoteView } from "@/core/types";
import type { AuthorQuoteSort } from "@/core/authors";
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
  const { authorId, backLabel } = useLocalSearchParams<{
    authorId?: string | string[];
    backLabel?: string | string[];
  }>();
  const normalizedAuthorId = useMemo(
    () => (Array.isArray(authorId) ? authorId[0] : authorId) ?? "",
    [authorId]
  );
  const normalizedBackLabel = useMemo(
    () => (Array.isArray(backLabel) ? backLabel[0] : backLabel) ?? "Back",
    [backLabel]
  );
  const { toggleSave } = useAppState();
  const [sort, setSort] = useState<AuthorQuoteSort>("default");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const showToast = (message: string) => setToastMessage(message);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = setTimeout(() => setToastMessage(null), 1500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!copiedQuoteId) {
      return;
    }

    const timer = setTimeout(() => setCopiedQuoteId(null), 900);
    return () => clearTimeout(timer);
  }, [copiedQuoteId]);

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
      void selectionHaptic();
      setCopiedQuoteId(quote.id);
      showToast("Quote copied");
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
        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color={colors.text} />
          <Text style={styles.backLabel}>{normalizedBackLabel}</Text>
        </Pressable>
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
        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color={colors.text} />
          <Text style={styles.backLabel}>{normalizedBackLabel}</Text>
        </Pressable>
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
      <View style={styles.navRow}>
        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color={colors.text} />
          <Text style={styles.backLabel}>{normalizedBackLabel}</Text>
        </Pressable>
      </View>
      <View style={styles.headerBlock}>
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
      <View style={styles.sortSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortScroller}
        >
          {SORT_OPTIONS.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              selected={sort === option.value}
              onPress={() => setSort(option.value)}
            />
          ))}
        </ScrollView>
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
            compact
            onToggleSave={() => handleToggleSave(quote.id)}
            onCopy={() => handleCopy(quote)}
            isCopyConfirmed={copiedQuoteId === quote.id}
            onShare={() => handleShare(quote)}
          />
        ))
      )}
      {toastMessage ? <ToastMessage message={toastMessage} variant="hud" /> : null}
    </Screen>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    navRow: {
      minHeight: 32,
      justifyContent: "center",
      marginTop: -2,
    },
    backLink: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 2,
    },
    backLabel: {
      fontSize: 16,
      lineHeight: 20,
      color: colors.text,
      fontWeight: "500",
    },
    headerBlock: {
      gap: 4,
      paddingTop: 4,
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
    sortSection: {
      marginHorizontal: -20,
    },
    sortScroller: {
      gap: 10,
      paddingHorizontal: 20,
    },
  });
