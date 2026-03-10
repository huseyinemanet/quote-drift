import ExpoModulesCore
import WatchConnectivity

private struct WatchQuoteItemRecord: Record {
  @Field var id: String = ""
  @Field var text: String = ""
  @Field var author: String = ""
  @Field var kind: String = "daily"
}

private struct WatchSyncPayloadRecord: Record {
  @Field var dayKey: String = ""
  @Field var quotes: [WatchQuoteItemRecord] = []
}

public class QuotifyWatchModule: Module {
  public func definition() -> ModuleDefinition {
    Name("QuotifyWatch")

    Function("syncQuotesToWatch") { (payload: WatchSyncPayloadRecord) in
      guard WCSession.isSupported() else { return }
      let session = WCSession.default
      if session.activationState != .activated {
        session.activate()
      }
      let dict: [String: Any] = [
        "dayKey": payload.dayKey,
        "quotes": payload.quotes.map { ["id": $0.id, "text": $0.text, "author": $0.author, "kind": $0.kind] },
      ]
      do {
        try session.updateApplicationContext(dict)
      } catch {
        // Context update failed (e.g. Watch not paired); ignore
      }
    }
  }
}
