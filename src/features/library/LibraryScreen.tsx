import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View, StyleSheet } from "react-native";
import { Bookmark, Search, X } from "lucide-react-native";
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
  const { state: bootstrapState, topics, loadLibrary, toggleSave, savedCount } = useAppState();
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [savedOnly, setSavedOnly] = useState(false);
  const [results, setResults] = useState<QuoteView[]>([]);
  const [savingQuoteId, setSavingQuoteId] = useState<string | null>(null);

  const libraryReady =
    bootstrapState === "ready" ||
    bootstrapState === "exhausted" ||
    bootstrapState === "fatalCorpus";

  useEffect(() => {
    if (!libraryReady) {
      setResults([]);
      return;
    }
    let cancelled = false;
    loadLibrary({ query, topic, savedOnly })
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      });
    return () => {
      cancelled = true;
    };
  }, [libraryReady, query, topic, savedOnly, loadLibrary]);

  const handleToggleSave = async (quoteId: string) => {
    setSavingQuoteId(quoteId);
    try {
      await toggleSave(quoteId);
    } finally {
      setSavingQuoteId(null);
    }
  };

  return (
    <Screen scroll edges={[]}>
      {results.length === 0 ? (
        <View style={styles.emptyStateRoot}>
          <View style={styles.header}>
            {savedOnly ? (
              <Text style={styles.subtitle}>{savedCount} saved quotes in your library</Text>
            ) : null}
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
          <View style={styles.inputWrapper}>
            <View style={styles.searchIconLeft} pointerEvents="none">
              <Search size={20} color={colors.textMuted} />
            </View>
            <TextInput
              placeholder="Search"
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.accent}
              style={[styles.input, styles.inputWithSearchIcon, query.length > 0 && styles.inputWithClear]}
              value={query}
              onChangeText={setQuery}
            />
            {query.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed]}
                onPress={() => setQuery("")}
                hitSlop={8}
              >
                <X size={20} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
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
              {(topics ?? []).map((value) => (
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
            {savedOnly ? (
              <Text style={styles.subtitle}>{savedCount} saved quotes in your library</Text>
            ) : null}
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
          <View style={styles.inputWrapper}>
            <View style={styles.searchIconLeft} pointerEvents="none">
              <Search size={20} color={colors.textMuted} />
            </View>
            <TextInput
              placeholder="Search..."
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.accent}
              style={[styles.input, styles.inputWithSearchIcon, query.length > 0 && styles.inputWithClear]}
              value={query}
              onChangeText={setQuery}
            />
            {query.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed]}
                onPress={() => setQuery("")}
                hitSlop={8}
              >
                <X size={20} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
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
              {(topics ?? []).map((value) => (
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
    inputWrapper: {
      position: "relative",
    },
    searchIconLeft: {
      position: "absolute",
      left: 14,
      top: 0,
      bottom: 0,
      justifyContent: "center",
      zIndex: 1,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: colors.text,
      fontSize: 17,
      lineHeight: 20,
    },
    inputWithSearchIcon: {
      paddingLeft: 44,
    },
    inputWithClear: {
      paddingRight: 44,
    },
    clearButton: {
      position: "absolute",
      right: 12,
      top: 0,
      bottom: 0,
      justifyContent: "center",
    },
    clearButtonPressed: {
      opacity: 0.6,
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
