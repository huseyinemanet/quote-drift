import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View, StyleSheet } from "react-native";
import { Bookmark } from "lucide-react-native";
import { router } from "expo-router";

import { useAppState } from "@/core/bootstrap";
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
  const [savingQuoteId, setSavingQuoteId] = useState<string | null>(null);

  useEffect(() => {
    void loadLibrary({ query, topic, savedOnly }).then(setResults);
  }, [query, topic, savedOnly, loadLibrary]);

  const handleToggleSave = async (quoteId: string) => {
    setSavingQuoteId(quoteId);
    try {
      await toggleSave(quoteId);
    } finally {
      setSavingQuoteId(null);
    }
  };

  return (
    <Screen scroll={results.length > 0} edges={[]}>
      {results.length === 0 ? (
        <View style={styles.emptyStateRoot}>
          <View style={styles.header}>
            <Text style={styles.subtitle}>
              {savedOnly
                ? `${savedCount} saved quotes in your library`
                : "Search your library"}
            </Text>
          </View>
          <View style={styles.modeRow}>
            <ChoiceChip
              label="All"
              selected={!savedOnly}
              onPress={() => setSavedOnly(false)}
            />
            <ChoiceChip
              label="Saved"
              selected={savedOnly}
              onPress={() => setSavedOnly(true)}
            />
          </View>
          <TextInput
            placeholder="Search"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.accent}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
          />
          <View style={styles.topicSection}>
            <Text style={styles.topicLabel}>Topics</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topicScroller}
            >
              <ChoiceChip
                label="All"
                selected={topic === null}
                onPress={() => setTopic(null)}
              />
              {topics.map((value) => (
                <ChoiceChip
                  key={value}
                  label={value}
                  selected={topic === value}
                  onPress={() => setTopic((current) => (current === value ? null : value))}
                />
              ))}
            </ScrollView>
          </View>
          <View style={styles.emptyStateWrap}>
            <EmptyState
              title={savedOnly ? "No saved quotes yet" : "Nothing matched yet"}
              body={
                savedOnly
                  ? "Save quotes from Today or Library and they will appear here."
                  : "Try a different search term, remove a filter, or browse another topic."
              }
              icon={savedOnly ? <Bookmark size={48} color={colors.textMuted} /> : undefined}
              fillVertical
            />
          </View>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.subtitle}>
              {savedOnly
                ? `${savedCount} saved quotes in your library`
                : "Search your library"}
            </Text>
          </View>
          <View style={styles.modeRow}>
            <ChoiceChip
              label="All"
              selected={!savedOnly}
              onPress={() => setSavedOnly(false)}
            />
            <ChoiceChip
              label="Saved"
              selected={savedOnly}
              onPress={() => setSavedOnly(true)}
            />
          </View>
          <TextInput
            placeholder="Search"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.accent}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
          />
          <View style={styles.topicSection}>
            <Text style={styles.topicLabel}>Topics</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topicScroller}
            >
              <ChoiceChip
                label="All"
                selected={topic === null}
                onPress={() => setTopic(null)}
              />
              {topics.map((value) => (
                <ChoiceChip
                  key={value}
                  label={value}
                  selected={topic === value}
                  onPress={() => setTopic((current) => (current === value ? null : value))}
                />
              ))}
            </ScrollView>
          </View>
          {results.map((quote) => (
            <QuoteListItem
              key={quote.id}
              quote={quote}
              compact
              showShare={false}
              saving={savingQuoteId === quote.id}
              onToggleSave={() => handleToggleSave(quote.id)}
              onPressAuthor={() =>
                router.push({
                  pathname: "/author/[authorId]",
                  params: { authorId: quote.authorId, backLabel: "Library" },
                })
              }
            />
          ))}
        </>
      )}
    </Screen>
  );
}

const createStyles = (colors: ThemeTokens) =>
  StyleSheet.create({
    header: {
      gap: 2,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
    },
    modeRow: {
      flexDirection: "row",
      gap: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: colors.text,
    },
    topicSection: {
      gap: 10,
      marginTop: 12,
      marginHorizontal: -20,
    },
    topicLabel: {
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
      color: colors.accent,
      paddingHorizontal: 20,
    },
    topicScroller: {
      gap: 10,
      paddingHorizontal: 20,
    },
    emptyStateRoot: {
      flex: 1,
      gap: 14,
    },
    emptyStateWrap: {
      flex: 1,
      minHeight: 120,
    },
  });
