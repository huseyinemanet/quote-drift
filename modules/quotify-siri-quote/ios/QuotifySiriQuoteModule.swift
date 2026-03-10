import ExpoModulesCore

private let appGroupSuiteName = "group.com.huseyinemanet.quotify"
private let keyQuoteText = "siri_quote_text"
private let keyQuoteAuthor = "siri_quote_author"

public class QuotifySiriQuoteModule: Module {
  public func definition() -> ModuleDefinition {
    Name("QuotifySiriQuote")

    Function("setSiriQuote") { (text: String, author: String) in
      guard let defaults = UserDefaults(suiteName: appGroupSuiteName) else { return }
      defaults.set(text, forKey: keyQuoteText)
      defaults.set(author, forKey: keyQuoteAuthor)
      defaults.synchronize()
    }

    Function("clearSiriQuote") {
      guard let defaults = UserDefaults(suiteName: appGroupSuiteName) else { return }
      defaults.removeObject(forKey: keyQuoteText)
      defaults.removeObject(forKey: keyQuoteAuthor)
      defaults.synchronize()
    }
  }
}
