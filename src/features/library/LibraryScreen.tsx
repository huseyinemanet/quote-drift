import { useEffect, useState } from "react";
import { Text, TextInput, View, StyleSheet } from "react-native";
import { router } from "expo-router";

import { useAppState } from "@/core/bootstrap";
import { shareQuoteText } from "@/core/sharecard/quoteText";
import type { QuoteView } from "@/core/types";
import { ChoiceChip } from "@/ui/ChoiceChip";
import { EmptyState } from "@/ui/EmptyState";
import { QuoteListItem } from "@/ui/QuoteListItem";
import { Screen } from "@/ui/Screen";
import { ThemeTokens, useTheme } from "@/ui/theme";

export function LibraryScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { topics, loadLibrary, toggleSave, savedCount } = useAppState();
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [savedOnly, setSavedOnly] = useState(false);
  const [results, setResults] = useState<QuoteView[]>([]);

  useEffect(() => {
    void loadLibrary({ query, topic, savedOnly }).then(setResults);
  }, [query, topic, savedOnly, loadLibrary]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.subtitle}>{savedCount} saved quotes</Text>
      </View>
      <TextInput
        placeholder="Search quotes or authors"
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.accent}
        style={styles.input}
        value={query}
        onChangeText={setQuery}
      />
      <View style={styles.filters}>
        <ChoiceChip
          label="Saved"
          selected={savedOnly}
          onPress={() => setSavedOnly((current) => !current)}
        />
        {topics.map((value) => (
          <ChoiceChip
            key={value}
            label={value}
            selected={topic === value}
            onPress={() => setTopic((current) => (current === value ? null : value))}
          />
        ))}
      </View>
      {results.length === 0 ? (
        <EmptyState
          title="Nothing matched yet"
          body="Try a different search term, remove a filter, or browse your saved collection."
        />
      ) : (
        results.map((quote) => (
          <QuoteListItem
            key={quote.id}
            quote={quote}
            onToggleSave={() => toggleSave(quote.id)}
            onPressAuthor={() => router.push(`/author/${quote.authorId}`)}
            onShare={() => shareQuoteText(quote)}
          />
        ))
      )}
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
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: colors.text,
    },
    filters: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
  });
