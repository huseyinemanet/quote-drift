# Quotify

Günlük alıntı uygulaması. Çevrimdışı çalışır, hesap istemez. Her gün bir alıntı, aranabilir kütüphane, isteğe bağlı hatırlatmalar ve günde bir ekstra alıntı hakkı (ödüllü reklamla). iOS’ta ana ekran ve kilit ekranı widget’ları.

**Teknoloji:** Expo 56 (canary) · React Native 0.84 · TypeScript · Expo Router · SQLite · yerel bildirimler · AdMob (banner + ödüllü) · Firebase Crashlytics · iOS widget (expo-widgets) · ikonlar: Lucide

---

## Ne yapıyor?

- **Bugün** — Günün alıntısı, kaydet / paylaş, isteğe bağlı bir alıntı daha (ödüllü reklamla).
- **Kütüphane** — Arama, konu filtreleri, sadece kaydettiklerim, yazar sayfaları.
- **Ayarlar** — Hatırlatmalar (sıklık, aktif saatler, duraklatma), destek / gizlilik / kaynaklar, uygulamayı değerlendir.
- **Yansımalar (Reflections)** — Alıntıya dair kısa notlar; Bugün ekranından erişilir, sekmede gizli.
- **Widget** — iOS ana ekranda küçük ve orta boy; kilit ekranında Inline, Rectangular, Circular. Günün alıntısını gösterir.

Tüm veri cihazda; günlük alıntı ve kütüphane ücretsiz. Ekstra alıntı isteğe bağlı ödüllü reklamla açılır.

---

## Hızlı başlangıç

```bash
npm install
npm start
```

- **iOS:** `npm run ios` (Xcode gerekli)
- **Android:** `npm run android` (Android Studio gerekli)
- **Web:** `npm run web`

Reklamlar ve bazı native özellikler Expo Go’da tam çalışmaz; gerçek davranış için `npm run ios` / `npm run android` ile native build gerekir.

---

## Proje yapısı

```
app/                 Ekranlar, sekmeler, onboarding (Expo Router)
src/core/            Veritabanı, alıntı motoru, reklamlar, bildirimler, widget/watch senkronu
src/features/        Bugün, Kütüphane, Ayarlar, Reflections, layout
src/ui/              Tema, ekran sarmalayıcı, butonlar, QuoteCard, paylaşım bileşenleri
assets/              quotes.json, ikonlar, splash
ios/ExpoWidgetsTarget/  iOS widget (DailyQuoteWidget)
modules/             quotify-siri-quote, quotify-watch (yerel modüller)
docs/                Mimari, reklamlar, paylaşım, TestFlight, QA, gönderim
scripts/             build-quotes, EAS Google Services inject, patch’ler
```

---

## Teknoloji özeti

| Alan        | Kullanılan |
|------------|-------------|
| Framework  | Expo 56 (canary), React Native 0.84, Expo Router |
| Dil        | TypeScript |
| Veri       | SQLite (expo-sqlite) |
| İkonlar    | Lucide (`lucide-react-native`) |
| Bildirimler| expo-notifications (yerel) |
| Reklam     | react-native-google-mobile-ads (banner + ödüllü) |
| Çökme      | Firebase Crashlytics |
| Widget     | expo-widgets (iOS, Home + Lock Screen) |

---

## Komutlar

| Komut | Açıklama |
|--------|-----------|
| `npm start` | Metro’yu başlatır |
| `npm run ios` | iOS uygulamasını çalıştırır |
| `npm run ios:release` | iOS Release build |
| `npm run android` | Android uygulamasını çalıştırır |
| `npm run web` | Web’de açar |
| `npm run typecheck` | TypeScript kontrolü |
| `npm test` | Jest testleri |
| `npm run build:quotes -- "<tsv-dosya-yolu>" [limit]` | `assets/quotes.json` üretir |

**iOS Release / “No script URL provided”:** Geliştirme için Debug kullan (`npm start` + `npm run ios`). Release deniyorsan Xcode’da **Product → Clean Build Folder**; gerekirse `ios/.xcode.env.local` içinde `export NODE_BINARY=$(which node)` tanımla.

---

## Yapılandırma

- **Uygulama:** `app.config.ts` — isim, scheme `quotify`, bundle id’ler (`com.huseyinemanet.quotify`).
- **URL’ler:** Destek, gizlilik, kaynaklar `expo.extra`; yayına almadan canlı URL’lerle güncellenmeli.
- **Reklamlar:** `EXPO_PUBLIC_ADS_ENV`, AdMob ID’leri; ayrıntı [docs/ads.md](docs/ads.md).
- **Widget:** `expo-widgets` — DailyQuoteWidget; Home: systemSmall, systemMedium; Lock Screen: accessoryInline, accessoryRectangular, accessoryCircular.
- **Firebase:** `GoogleService-Info.plist` (iOS) ve `google-services.json` (Android) repoda **yok**; [Firebase Console](https://console.firebase.google.com/) → Quotify projesi → uygulamadan indirip `ios/Quotify/` ve proje köküne koy. EAS build için [docs/testflight-share.md](docs/testflight-share.md) içinde plist enjeksiyonu anlatılıyor.

### Gizlilik ve veri

- Crash raporları: Firebase Crashlytics.
- Reklamlar: AdMob (banner + ödüllü); kendi veri politikasına tabi.
- Arka plan görselleri: İsteğe bağlı, Unsplash; çevrimdışıda yerel fallback.
- App Store App Privacy: AdMob ve Crashlytics beyan edilmeli. Rehber: [docs/app-privacy-declaration.md](docs/app-privacy-declaration.md).

Alıntılar ve kullanıcı tercihleri cihazda; hesap zorunlu değil.

---

## TestFlight / dağıtım

- **Xcode ile TestFlight’a yükleme:** [docs/testflight-share.md](docs/testflight-share.md) — Yol A: Archive → Distribute App.
- **EAS Build (isteğe bağlı):** Aynı dokümanda Yol B; `eas.json` ve `.easignore` mevcut.

---

## Alıntı verisi

`assets/quotes.json` paketlenir. Yazar–alıntı TSV’den üretmek için:

```bash
npm run build:quotes -- "/yol/author-quote.txt" 5000
```

---

## Dokümanlar

- [Mimari](docs/architecture.md)
- [Reklamlar](docs/ads.md)
- [Paylaşım](docs/sharing.md)
- [TestFlight paylaşım](docs/testflight-share.md)
- [Watch app](docs/watch-app.md)
- [QA listesi](docs/qa-checklist.md)
- [Gönderim listesi](docs/submission.md)
- [Standalone build](docs/standalone-build.md)
- [App Privacy beyanı](docs/app-privacy-declaration.md)
- [Kaynaklar](docs/sources.md) / [Foto kredileri](docs/photo-credits.md)

---

## Yayına almadan önce

- Destek / gizlilik / kaynak URL’lerini canlı değerlerle doldur (`app.config.ts` → `extra`).
- AdMob production ID’leri ve `EXPO_PUBLIC_ADS_ENV=production`; [docs/ads.md](docs/ads.md).
- Firebase dosyalarını yerleştir (veya EAS secret ile enjekte et).
- Hatırlatmaları ve ödüllü reklamı gerçek cihazda test et.
- Widget’ı (Home + Lock Screen) gerçek cihazda veya TestFlight ile test et.

---

## Repo

**GitHub:** [yabastudio/Quotify](https://github.com/yabastudio/Quotify)  
**Clone:** `https://github.com/yabastudio/Quotify.git`
