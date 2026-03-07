# Quotify

Günlük alıntı uygulaması. Önce çevrimdışı çalışır, hesap istemez. Her gün bir alıntı, aranabilir kütüphane, isteğe bağlı hatırlatmalar ve günde bir tane ekstra alıntı hakkı var. Hepsi bu.

**Teknik:** Expo 55 · React Native 0.83 · TypeScript · Expo Router · SQLite · yerel bildirimler · ödüllü reklam (ekstra alıntı için) · iOS ana ekran widget’ı

---

## Ne yapıyor?

- **Bugün** — Günün alıntısı, kaydet / paylaş, okuma serisi, isteğe bağlı bir alıntı daha (ödüllü reklamla açılıyor).
- **Kütüphane** — Arama, konu filtreleri, sadece kaydettiklerim, yazar sayfaları.
- **Ayarlar** — Hatırlatmalar (sıklık, aktif saatler, duraklatma), test bildirimi, destek / gizlilik / kaynaklar, uygulamayı değerlendir.
- **Widget** — iOS ana ekranda küçük ve orta boy widget’lar; günün alıntısını gösteriyor.

Her şey çevrimdışı çalışıyor. Günlük alıntı ve kütüphane ücretsiz; günde bir tane ekstra alıntı isteğe bağlı ödüllü reklamla açılıyor.

---

## Hızlı başlangıç

```bash
npm install
npm start
```

Sonrası:

- **iOS:** `npm run ios` (Xcode gerekli)
- **Android:** `npm run android` (Android Studio gerekli)
- **Web:** `npm run web`

---

## Proje yapısı

```
app/              Ekranlar, sekmeler, onboarding (Expo Router)
src/core/         Veritabanı, alıntı motoru, reklamlar, bildirimler, bootstrap, widget senkronu
src/features/     Bugün, Kütüphane, Ayarlar, onboarding, layout
src/ui/           Tema, ekran sarmalayıcı, butonlar, QuoteCard vb.
assets/           quotes.json ve diğer varlıklar
widgets/          iOS widget giriş noktaları
docs/             Mimari, reklamlar, paylaşım, QA, gönderim notları
scripts/          build-quotes (yazar–alıntı dosyasından corpus üretir)
```

---

## Komutlar

| Komut | Açıklama |
|--------|-----------|
| `npm start` | Metro’yu başlatır |
| `npm run ios` | iOS uygulamasını çalıştırır |
| `npm run android` | Android uygulamasını çalıştırır |
| `npm run web` | Web’de açar |
| `npm run typecheck` | TypeScript kontrolü |
| `npm test` | Jest testleri |
| `npm run build:quotes -- "<tsv-dosya-yolu>" [limit]` | Yazar–alıntı dosyasından `assets/quotes.json` üretir |

---

## Yapılandırma

- **Uygulama kimliği:** `app.json` ve `app.config.ts` (isim Quotify, scheme `quotify`, bundle id’ler).
- **URL’ler:** Destek, gizlilik, kaynaklar `expo.extra` üzerinden; yayına almadan önce doldurulmalı.
- **Reklamlar:** `EXPO_PUBLIC_ADS_ENV`, AdMob uygulama / birim ID’leri; [docs/ads.md](docs/ads.md). Ödüllü reklamlar native build ister (Expo Go’da çalışmaz).
- **Widget:** `app.config.ts` içinde `expo-widgets`; DailyQuoteWidget, systemSmall / systemMedium.

---

## Bildirimler

Sadece yerel. Hatırlatmalar isteğe bağlı: günde 1–3 kez, aktif saatler ayarlanabilir (varsayılan 09:00–21:00), duraklatma var. İzin verilmezse uygulama yine tam çalışır.

---

## Alıntı verisi

`assets/quotes.json` içinde paketleniyor. Sekmeyle ayrılmış (yazar, alıntı) bir dosyadan üretmek için:

```bash
npm run build:quotes -- "/yol/author-quote.txt" 5000
```

---

## Dokümanlar

- [Mimari](docs/architecture.md)
- [Reklamlar](docs/ads.md)
- [Paylaşım](docs/sharing.md)
- [QA listesi](docs/qa-checklist.md)
- [İnceleme notları](docs/review-notes.md)
- [Gönderim listesi](docs/submission.md)
- [Standalone build](docs/standalone-build.md)

---

## Yayına almadan önce

- Destek / gizlilik / kaynak URL’lerini canlı değerlerle doldur.
- AdMob ID’lerini production için ayarla.
- Hatırlatmaları ve ödüllü reklamı gerçek cihazda dene.
- Widget bundle / group id’lerinin iOS bundle id ile uyumlu olduğunu kontrol et.

---

## Repo

**GitHub:** [yabastudio/Quotify](https://github.com/yabastudio/Quotify)  
**Clone:** `https://github.com/yabastudio/Quotify.git`
