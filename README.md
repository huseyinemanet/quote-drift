# Quotify

Günlük alıntı uygulaması. Önce çevrimdışı çalışır, hesap istemez. Her gün bir alıntı, aranabilir kütüphane, isteğe bağlı hatırlatmalar ve günde bir tane ekstra alıntı hakkı var. Hepsi bu.

**Teknik:** Expo 55 · React Native 0.83 · TypeScript · Expo Router · SQLite · yerel bildirimler · ödüllü reklam (ekstra alıntı için) · iOS ana ekran widget’ı · **ikonlar: Lucide** (`lucide-react-native`)

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

## Caner için kurulum (adım adım)

Projeyi kendi bilgisayarına çekip ilk kez çalıştırmak için aşağıdaki adımları sırayla uygula. Ortam hazırsa 5 dakikada ayağa kalkar.

### 1. Gereksinimler

- **Node.js** — v18 veya üzeri (tercihen LTS). Kontrol: `node -v`
- **npm** — Node ile gelir. Kontrol: `npm -v`
- **Git** — Repoyu klonlamak için. Kontrol: `git --version`

**İstersen sadece web’de çalıştırmak için:** Bunlar yeterli; Xcode/Android Studio gerekmez.

**iOS simülatör veya cihaz için:** Mac + **Xcode** (App Store’dan). Xcode açılıp bir kez lisans kabul edilmeli.

**Android emülatör veya cihaz için:** **Android Studio** + SDK. İlk kez açıldığında SDK kurulumu tamamlanmalı.

### 2. Projeyi çek (clone)

Bilgisayarında çalışmak istediğin klasöre gir (örn. `Projects`), sonra:

```bash
git clone https://github.com/yabastudio/Quotify.git
cd Quotify
```

(Fork’ladıysan kendi repo URL’ini kullan: `git clone https://github.com/CANER_KULLANICI_ADI/Quotify.git`)

### 3. Bağımlılıkları kur

Proje klasöründeyken:

```bash
npm install
```

Bu komut `package.json`’daki tüm paketleri indirir. İlk seferde birkaç dakika sürebilir; hata almazsan devam et.

### 4. Uygulamayı çalıştır

**Metro’yu başlat:**

```bash
npm start
```

Tarayıcıda veya terminalde Expo sayfası açılır. Oradan:

- **Web’de denemek için:** Terminalde `w` tuşuna bas veya `npm run web` çalıştır. Uygulama tarayıcıda açılır.
- **iOS simülatör:** Mac’te ve Xcode kuruluysa terminalde `i` tuşuna bas veya yeni bir terminalde `npm run ios`.
- **Android emülatör:** Android Studio ve emülatör hazırsa terminalde `a` tuşuna bas veya `npm run android`.

**Not:** Reklamlar ve bazı native özellikler Expo Go’da tam çalışmaz; gerçek davranış için `npm run ios` veya `npm run android` ile native build gerekir (Xcode/Android Studio şart).

### 5. Ortam değişkenleri (.env) — isteğe bağlı

İlk kurulumda **.env dosyası zorunlu değil.** Uygulama test reklam ID’leri ile açılır.

Production reklamları veya kendi AdMob hesabını kullanmak istersen:

1. Proje kökünde `.env.example` dosyasını kopyala:  
   `cp .env.example .env`
2. `.env` dosyasını açıp gerekli değerleri doldur (AdMob ID’leri vb.).  
   Detay: [docs/ads.md](docs/ads.md).

### 6. Özet komutlar (kopyala-yapıştır)

```bash
# Projeyi çek
git clone https://github.com/yabastudio/Quotify.git
cd Quotify

# Kur
npm install

# Çalıştır (Metro açılır; w=web, i=iOS, a=Android)
npm start
```

Takıldığın yerde: README’deki **Caner için notlar** bölümünde bildirim, widget ve diğer to-do’lar var; onları sonra tamamlayabilirsin.

---

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

## Teknoloji özeti

| Alan | Kullanılan |
|------|------------|
| Framework | Expo 55, React Native 0.83, Expo Router |
| Dil | TypeScript |
| Veri | SQLite (expo-sqlite) |
| İkonlar | **Lucide** (`lucide-react-native`) |
| Bildirimler | expo-notifications (yerel) |
| Reklam | react-native-google-mobile-ads (ödüllü) |
| Widget | expo-widgets (iOS) |

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

## Caner için notlar — Eksikler ve yapılacaklar

Bu bölüm projede şu an tam çalışmayan veya tamamlanması gereken öğeleri topluyor. To-do formatında; dönüp tek tek tamamlanabilir.

### Bildirim sistemi (şu an çalışmıyor)

- **Durum:** Yerel bildirimler (hatırlatmalar) için **Apple Developer Program hesabı** gerektiği başta bilinmiyordu; bu yüzden şu an tam çalışmıyor.
- **Yapılacaklar:**
  - [ ] Apple Developer Program’a üye olun (yıllık ücret; App Store dağıtımı için zaten gerekli).
  - [ ] [Apple Developer](https://developer.apple.com) → Certificates, Identifiers & Profiles → Identifiers → uygulama Bundle ID’si (örn. `com.huseyinemanet.quotify`) → **Push Notifications** capability’sini açın. (Yerel bildirimler için bile bu capability’nin açık olması bazı senaryolarda gerekebilir.)
  - [ ] Xcode’da ilgili target için **Signing & Capabilities** sekmesinde Push Notifications’ın eklendiğini doğrulayın.
  - [ ] Gerçek cihazda (simülatörde değil) hatırlatma açıp “Test reminder” ile bildirimin gelmesini test edin.
- **Not:** Uygulama sadece **yerel** bildirim kullanıyor (sunucu push’u yok). Yine de dağıtım ve bazı cihazlarda düzgün çalışması için Developer hesabı ve gerekirse capability ayarı şart.

### iOS widget — “Please adopt containerBackground API”

- **Durum:** iPhone’da widget eklenince sistem **“Please adopt containerBackground API”** uyarısı veriyor; widget tam anlamıyla aktif değil.
- **Sebep:** iOS 17’den itibaren WidgetKit, arka planın nasıl gösterileceğini tanımlamak için `containerBackground(for: .widget)` API’sini kullanmayı zorunlu kılıyor. expo-widgets ile üretilen native widget kodu bu API’yi henüz kullanmıyor olabilir.
- **Yapılacaklar:**
  - [ ] `npx expo prebuild` (veya ilgili build) sonrası oluşan **iOS widget extension** içindeki Swift/SwiftUI view’ı bulun (genelde `ios/` altında widget extension target’ında).
  - [ ] Widget’ın ana view’ına `.containerBackground(for: .widget) { ... }` ekleyin. Arka plan rengi için örn. `Color(theme.background)` veya mevcut tasarıma uygun bir view kullanın. Örnek (Swift):  
    `\.containerBackground(for: .widget) { Color(.systemBackground) }` veya tasarımda kullanılan renk.
  - [ ] iOS 16 uyumluluğu için, mümkünse `#available(iOS 17.0, *)` ile sadece iOS 17+’da `containerBackground`, öncesinde `background` kullanın.
  - [ ] expo-widgets sürümünü kontrol edin; ileride bu API’yi destekleyen bir güncelleme çıkarsa güncelleyin.
- **Referans:** [Apple – Displaying the right widget background](https://developer.apple.com/documentation/widgetkit/displaying-the-right-widget-background), Stack Overflow: “Adopt containerBackground API - iOS 17 widget”.

### Diğer eksikler / to-do’lar

- [ ] **Destek / Gizlilik / Kaynak URL’leri:** `app.json` veya `app.config.ts` içindeki `expo.extra` (supportUrl, privacyUrl, sourcesUrl) şu an placeholder (örn. `https://www.example.com/`). Yayına almadan canlı URL’lerle güncellenmeli.
- [ ] **AdMob production:** Production’da gerçek AdMob uygulama ve birim ID’leri kullanılmalı; `EXPO_PUBLIC_ADS_ENV=production` ve ilgili `EXPO_PUBLIC_ADMOB_*` env’ler set edilmeli. [docs/ads.md](docs/ads.md).
- [ ] **Widget bundle / group id:** `app.config.ts` içinde widget `bundleIdentifier` ve `groupIdentifier` ana uygulama bundle id’si ile uyumlu; farklı bir bundle id kullanılıyorsa bu değerler güncellenmeli.
- [ ] **Bildirim ve ödüllü reklam:** Gerçek cihazda hatırlatma zamanlaması ve “One more” ödüllü reklam akışı son kez test edilmeli (Expo Go’da reklamlar çalışmaz; dev client veya release build gerekir).

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
