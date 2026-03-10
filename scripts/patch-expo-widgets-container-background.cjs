/**
 * Applies the containerBackground API fix to expo-widgets EntryView.
 * Removes .containerBackground(.clear, for: .widget) so that only the app's
 * DailyQuoteWidget provides containerBackground (fixes "Please adopt containerBackground API").
 */
const fs = require("fs");
const path = require("path");

const entryPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo-widgets",
  "ios",
  "Widgets",
  "EntryView.swift"
);

const oldBlock = `  public var body: some View {
    if let node = entry.node {
      if #available(iOS 17.0, *) {
        WidgetsDynamicView(source: entry.source, kind: .widget, node: node, entryIndex: entry.entryIndex)
          .containerBackground(.clear, for: .widget)
      } else {
        WidgetsDynamicView(source: entry.source, kind: .widget, node: node, entryIndex: entry.entryIndex)
      }
    } else {
      EmptyView()
    }
  }`;

const newBlock = `  public var body: some View {
    if let node = entry.node {
      WidgetsDynamicView(source: entry.source, kind: .widget, node: node, entryIndex: entry.entryIndex)
    } else {
      EmptyView()
    }
  }`;

if (!fs.existsSync(entryPath)) {
  process.exit(0);
}

let content = fs.readFileSync(entryPath, "utf8");
if (content.includes(".containerBackground(.clear, for: .widget)")) {
  content = content.replace(oldBlock, newBlock);
  fs.writeFileSync(entryPath, content);
}
