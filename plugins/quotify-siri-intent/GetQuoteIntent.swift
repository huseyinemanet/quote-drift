import AppIntents
import AVFoundation

private let appGroupSuiteName = "group.com.huseyinemanet.quotify"
private let keyQuoteText = "siri_quote_text"
private let keyQuoteAuthor = "siri_quote_author"

/// Speaks the cached quote when the user says "Hey Siri, give me a quote".
@available(iOS 16.0, *)
struct GetQuoteIntent: AppIntent {
  static var title: LocalizedStringResource = "Get quote"
  static var description = IntentDescription("Speaks today's Quotify quote.")
  static var openAppWhenRun: Bool = false

  func perform() async throws -> some IntentResult {
    guard let defaults = UserDefaults(suiteName: appGroupSuiteName) else {
      return .result(dialog: "Open Quotify to load today's quote.")
    }
    let text = defaults.string(forKey: keyQuoteText)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    let author = defaults.string(forKey: keyQuoteAuthor)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""

    if text.isEmpty {
      return .result(dialog: "Open Quotify to load today's quote.")
    }

    let utteranceText = author.isEmpty ? text : "\(text) By \(author)."
    let utterance = AVSpeechUtterance(string: utteranceText)
    utterance.rate = AVSpeechUtteranceDefaultSpeechRate
    utterance.pitchMultiplier = 1.0
    utterance.volume = 1.0

    let synthesizer = AVSpeechSynthesizer()
    await withCheckedContinuation { (continuation: CheckedContinuation<Void, Never>) in
      let delegate = SpeechDelegate(continuation: continuation)
      objc_setAssociatedObject(synthesizer, &delegateKey, delegate, .OBJC_ASSOCIATION_RETAIN)
      synthesizer.delegate = delegate
      synthesizer.speak(utterance)
    }

    return .result(dialog: "Here’s your quote.")
  }
}

private var delegateKey: UInt8 = 0

@available(iOS 16.0, *)
private final class SpeechDelegate: NSObject, AVSpeechSynthesizerDelegate {
  let continuation: CheckedContinuation<Void, Never>

  init(continuation: CheckedContinuation<Void, Never>) {
    self.continuation = continuation
  }

  func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
    continuation.resume()
  }

  func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
    continuation.resume()
  }
}

@available(iOS 16.0, *)
struct QuotifyAppShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    [
    AppShortcut(
      intent: GetQuoteIntent(),
      phrases: [
        "Give me a quote in \(.applicationName)",
        "Get a quote in \(.applicationName)",
        "Read me a quote in \(.applicationName)",
        "Give me a quote",
        "Get a quote",
        "Read me a quote",
      ],
      shortTitle: "Get quote",
      systemImageName: "quote.bubble"
    )
    ]
  }
}
