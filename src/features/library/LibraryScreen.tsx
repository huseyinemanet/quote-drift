import { useEffect, useState } from "react";
import { Share, StyleSheet, Text, TextInput, View } from "react-native";

import { useAppState } from "@/core/bootstrap";
import type { QuoteView } from "@/core/types";
import { ChoiceChip } from "@/ui/ChoiceChip";
import { Button } from "@/ui/Button";
import { EmptyState } from "@/ui/EmptyState";
import { Screen } from "@/ui/Screen";
import { colors } from "@/ui/theme";

function QuoteRow({
  quote,
  onToggleSave,
}: {
  quote: QuoteView;
  onToggleSave: () => void;
}) {
  return (
    <View style={styles.quoteRow}>
      <Text style={styles.quoteText}>{quote.text}</Text>
      <Text style={styles.quoteAuthor}>{quote.author}</Text>
      <View style={styles.quoteMeta}>
        {quote.primaryTag ? <Text style={styles.meta}>#{quote.primaryTag}</Text> : null}
        {quote.source ? <Text style={styles.meta}>{quote.source}</Text> : null}
      </View>
      <View style={styles.actions}>
        <Button
          label={quote.saved ? "Unsave" : "Save"}
          variant="secondary"
          onPress={onToggleSave}
        />
        <Button
          label="Share"
          variant="ghost"
          onPress={() =>
            Share.share({ message: `"${quote.text}" — ${quote.author}` })
          }
        />
      </View>
    </View>
  );
}

export function LibraryScreen() {
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
          <QuoteRow
            key={quote.id}
            quote={quote}
            onToggleSave={() => toggleSave(quote.id)}
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  quoteRow: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 26,
    color: colors.text,
  },
  quoteAuthor: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  quoteMeta: {
    gap: 2,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
});
