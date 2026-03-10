# QA Checklist

## Core Product
- Daily quote loads offline.
- Library search works offline.
- Save/unsave works.
- Share image flow works.
- No repeats occur before exhaustion across Today and scheduled notifications.

## Rewarded One More
- Today shows `One more` when no extra quote has been unlocked.
- Tapping `One more` opens the modal.
- `Not now` closes the modal immediately.
- Rewarded completion grants exactly one extra quote.
- Skip/close/error/unavailable ad grants nothing and shows a friendly message when appropriate.
- After unlock, `One more` is no longer available for that day.

## Sticky Banner
- Banner appears above the tab bar on Today, Library, and Settings.
- There is visible spacing between the banner and tab bar.
- Content is never hidden behind the banner or tab bar.
- Failed banner loads leave no empty gap.
- Closing the banner hides it for 24 hours and removes the gap immediately.

## Notifications
- App works with notifications denied.
- Optional reminder scheduling respects active hours.
- Test notification does not consume a quote.

## Widget (iOS)
- Daily Quote widget appears in the widget gallery (Home Screen and Lock Screen).
- Home Screen: small and medium sizes show today’s quote, author, and theme-aligned background.
- Lock Screen: accessory rectangular and inline show a compact quote (tap opens app when supported).
- **Note:** Full widget testing (add to home/lock screen, tap-to-open) requires an active Apple Developer account and a real device or TestFlight build. Until then, the infrastructure is in place (containerBackground for iOS 17+, Lock Screen families, deepLink in payload).

## Submission Safety
- Privacy Policy and Support links open correctly.
- The app remains usable with ads failing and with notifications disabled.

## Submission öncesi teknik senaryolar

Submission öncesi aşağıdaki senaryoları tek tek test et. Kod referansları: `src/core/notifications.ts`, `src/core/ads/rewarded.ts`, `src/core/ads/useAdBanner.ts`, `src/core/sharecard/shareImage.ts`, `src/ui/theme.ts`.

### Notifications
- [ ] **allow** — Onboarding’de “Enable reminders” açık → Continue → sistem izin diyaloğunda “Allow”. Beklenen: izin granted, hatırlatıcılar planlanır, Settings’te Reminders açık.
- [ ] **deny** — İzin diyaloğunda “Don’t Allow”. Beklenen: uygulama normal çalışır, Settings’te reminders kapalı, tekrar izin istenmez.
- [ ] **allow later** — Onboarding’de “Enable reminders” kapalı bırak → Continue. Beklenen: izin hiç istenmez, onboarding biter; Settings’ten sonra açıp izin verilebilir.
- [ ] **toggle off** — Settings → Reminders switch’i kapat. Beklenen: planlanan bildirimler iptal, Today’da “Reminders are currently off” banner.
- [ ] **toggle on** — Settings → Reminders switch’i aç (izin yoksa izin istenir). Beklenen: izin verilirse schedule güncellenir, Today’daki reminder banner kaybolur.

### Notification timezone / DST / stability
- [ ] **timezone change** — Reminders açık, 1–3 bildirim planlı. Cihaz ayarlarından bölge/saat dilimini değiştir (örn. İstanbul → New York). Uygulamayı aç (foreground’a getir). Beklenen: Planlanan bildirimler yeni timezone’a göre yeniden hesaplanır; ayarlardaki active hours yerel saatte aynı kalır; o gün için beklenen sayıda bildirim gelir ve yerel saate göre doğru saatte gelir.
- [ ] **phone restart** — Reminders açık, birkaç bildirim planlı. Cihazı tamamen kapatıp aç (restart). Uygulamayı açmadan bir süre bekle (bildirim saati geçmesin). Uygulamayı aç. Beklenen: Sync tetiklenir; o gün için planlanan bildirimler yeniden schedule edilir; duplicate bildirim olmaz; beklenen saatte bildirim gelir.
- [ ] **app reinstall** — Reminders açıkken uygulamayı kaldır, aynı sürümü tekrar yükle (veya TestFlight/Internal build). Uygulamayı aç. Beklenen: Onboarding veya ayarlar ekranında reminder kapalı; izin tekrar istenebilir; açıp izin verince yeni planlama yapılır; eski kuruluma ait bildirim kalmadığı için duplicate yok.

### Ads
- [ ] **ad load fail** — Ağ kapalı veya reklam yok; Today’da “Get another quote” → “Watch ad”. Beklenen: modal “A short ad is unavailable right now.”, “Not now” ile kapanır, ekstra quote yok.
- [ ] **ad closed early** — Rewarded reklam açıldıktan sonra izlemeden kapat (X / back). Beklenen: ekstra quote verilmez, modal kapanır.
- [ ] **ad reward** — Rewarded reklamı sonuna kadar izle. Beklenen: tek ekstra quote o gün açılır, “One more” o gün tekrar gösterilmez.
- [ ] **ad network off** — Uçak modu veya Wi‑Fi/veri kapalı. Beklenen: banner boş alan bırakmaz; “One more” → modal “unavailable”; uygulama kullanılabilir.

### Share
- [ ] **AirDrop** — Today’da Share → sistem paylaşımında AirDrop → hedef cihaz. Beklenen: görsel AirDrop ile gider.
- [ ] **Messages** — Aynı akışta “Messages” seç → sohbet. Beklenen: görsel mesaj olarak gider.
- [ ] **WhatsApp** — Aynı akışta “WhatsApp” seç → sohbet. Beklenen: görsel WhatsApp’a gider.
- [ ] **Copy** — Library/Author’da copy ikonu veya “Copy text”; paylaşım sonrası görsel clipboard’a (best-effort). Beklenen: metin/görsel panoya kopyalanır.

### Offline mode
- [ ] **airplane mode** — Uçak modu aç → uygulamayı aç / Today’ı yenile. Beklenen: günlük quote, Library, arama, Save/unsave çalışır; reklamlar yüklenmez; paylaşım görseli oluşturulur, uygulama çökmez.

### Dark mode
- [ ] **system change** — Cihazda Ayarlar → Görünüm / Display & Brightness → Light/Dark veya Otomatik değiştir. Beklenen: uygulama ön plandayken tema anında güncellenir (arka plan, metin, kartlar, tab bar).
