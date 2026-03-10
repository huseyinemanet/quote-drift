# Quotify

Günlük alıntı uygulaması. Önce çevrimdışı çalışır, hesap istemez. Her gün bir alıntı, aranabilir kütüphane, isteğe bağlı hatırlatmalar ve günde bir tane ekstra alıntı hakkı var. Hepsi bu.

**Teknik:** Expo 55 · React Native 0.83 · TypeScript · Expo Router · SQLite · yerel bildirimler · ödüllü reklam (ekstra alıntı için) · iOS widget (ana ekran + Lock Screen, iOS 16+) · **ikonlar: Lucide** (`lucide-react-native`)

---

## Ne yapıyor?

- **Bugün** — Günün alıntısı, kaydet / paylaş, okuma serisi, isteğe bağlı bir alıntı daha (ödüllü reklamla açılıyor).
- **Kütüphane** — Arama, konu filtreleri, sadece kaydettiklerim, yazar sayfaları.
- **Ayarlar** — Hatırlatmalar (sıklık, aktif saatler, duraklatma), test bildirimi, destek / gizlilik / kaynaklar, uygulamayı değerlendir.
- **Widget** — iOS ana ekranda küçük ve orta boy widget’lar; Lock Screen’de ise Inline, Rectangular ve Circular (accessory) boyutları. Günün alıntısını gösteriyor.

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

**iOS Release build (`npm run ios:release`):** Uygulama JS’i paket içindeki `main.jsbundle` dosyasından yükler. Bu dosya Xcode’daki “Bundle React Native code and images” aşamasında üretilir. **“No script URL provided”** hatası alıyorsan: (1) Geliştirme için Debug kullan — önce `npm start`, sonra `npm run ios` (Release yerine); (2) Release denemek için Xcode’da **Product → Clean Build Folder**, sonra tekrar build al; (3) Hâlâ oluyorsa Xcode script ortamında Node bulunamıyordur — `ios/.xcode.env.local` oluşturup `export NODE_BINARY=$(which node)` ekle (terminalde `which node` ile yolu alıp yazabilirsin).

---

## Yapılandırma

- **Uygulama kimliği:** `app.config.ts` (isim Quotify, scheme `quotify`, bundle id’ler).
- **URL’ler:** Destek, gizlilik, kaynaklar `expo.extra` üzerinden; yayına almadan önce doldurulmalı.
- **Reklamlar:** `EXPO_PUBLIC_ADS_ENV`, AdMob uygulama / birim ID’leri; [docs/ads.md](docs/ads.md). Ödüllü reklamlar native build ister (Expo Go’da çalışmaz).
- **Widget:** `app.config.ts` içinde `expo-widgets`; DailyQuoteWidget — Home Screen: systemSmall, systemMedium; Lock Screen (iOS 16+): accessoryInline, accessoryRectangular, accessoryCircular.
- **Firebase (Crashlytics):** `GoogleService-Info.plist` ve `google-services.json` repoda **yer almaz** (güvenlik). iOS/Android native build için [Firebase Console](https://console.firebase.google.com/) → proje Quotify → ilgili uygulama → bu dosyaları indirip proje **köküne** koy. Bundle ID / package name: `com.huseyinemanet.quotify`.

### Gizlilik ve veri (App Store / Privacy Policy)

Store açıklamaları ve Gizlilik Politikası metninde aşağıdakilerin yer alması önerilir:

- **Crash reporting:** Hata ve çökme raporları Firebase Crashlytics ile toplanır (uygulama kararlılığını iyileştirmek için).
- **Reklamlar:** AdMob kullanılır (banner ve ödüllü reklam); reklam ağı kendi veri işleme politikasına tabidir.
- **İsteğe bağlı arka plan görselleri:** Alıntı kartı arka planları, çevrimiçi iken Unsplash üzerinden yüklenebilir; çevrimdışıda yerel fallback kullanılır.
- **App Store App Privacy:** AdMob ve Firebase (Crashlytics) veri topladığı için App Store Connect’te App Privacy formunda bu veri türleri beyan edilmelidir. Detaylı liste ve form doldurma rehberi: [docs/app-privacy-declaration.md](docs/app-privacy-declaration.md).

Alıntı metni, kütüphane ve kullanıcı tercihleri cihazda saklanır; hesap zorunlu değildir.

---

## Caner için notlar — Eksikler ve yapılacaklar

Bu bölüm projede şu an tam çalışmayan veya tamamlanması gereken öğeleri topluyor. To-do formatında; dönüp tek tek tamamlanabilir.

### Bildirim sistemi (Apple Developer hesabı ile çalışır)

- **Durum:** Yerel bildirimler (hatırlatmalar) için **Apple Developer Program** hesabı ve gerçek cihaz veya TestFlight build gerekir. Ücretsiz (Personal Team) ile simülatörde veya bazı cihazlarda izin/bildirim davranışı sınırlı olabilir.
- **Yapılanlar:**
  - [x] Apple Developer Program'a üye olundu (yıllık ücret; App Store dağıtımı için zaten gerekli).
  - [x] Ücretli hesapta entitlement'a `aps-environment` (production) eklendi. Xcode'da **Signing & Capabilities** → **Push Notifications** ekleyin (henüz eklemediyseniz). Yerel bildirimler için teknik olarak zorunlu değil ama App Store build'lerinde sorunsuz çalışması için önerilir.
  - [ ] Gerçek cihazda veya TestFlight ile hatırlatma açıp "Test reminder" ile bildirimin gelmesini test edin.
- **Not:** Uygulama sadece **yerel** bildirim kullanıyor; sunucu push'u yok. İleride push eklerseniz aynı capability ile APNs key/certificate ve backend eklemeniz gerekir.

### iOS widget

- **containerBackground (iOS 17+):** Tamamlandı. `ios/ExpoWidgetsTarget/DailyQuoteWidget.swift` içinde widget view’ı `#available(iOS 17.0, *)` ile `.containerBackground(for: .widget)` ile sarıyor; arka plan renkleri JS layout ile uyumlu (light/dark).
- **Tap → app:** Payload’da `deepLink: "quotify://today"` var; widget’a tıklanınca uygulama açılması için native tarafta (expo-widgets) bu değerin timeline entry’nin `widgetURL` alanına yazılması gerekir. expo-widgets canary bunu destekliyorsa otomatik çalışır; değilse ileride paket güncellemesi veya patch gerekebilir.
- **Lock Screen (iOS 16+):** Daily Quote widget’ı Home Screen (systemSmall, systemMedium) yanı sıra Lock Screen’de üç boyutta sunuluyor: accessoryInline (tek satır), accessoryRectangular (birkaç satır alıntı + yazar), accessoryCircular (kısa etiket). Arka plan Lock Screen’de sistem tarafından çizilir; containerBackground notu sadece Home Screen için geçerli.
- **Test notu:** Developer hesabı aktif olana kadar widget’ı gerçek cihazda tam test edemeyebilirsiniz. Altyapı hazır; hesap aktif olunca TestFlight veya gerçek cihazda widget ekleme, tap→app ve Lock Screen görünümünü doğrulayın.

### Diğer eksikler / to-do’lar

- [ ] **Destek / Gizlilik / Kaynak URL’leri:** `app.config.ts` içindeki `expo.extra`: supportUrl ve privacyUrl hâlâ placeholder; yayına almadan canlı URL’lerle güncellenmeli. sourcesUrl ve photoCreditsUrl `https://yaba.studio/quotify/sources` ve `.../photo-credits` olarak ayarlı; [docs/sources.md](docs/sources.md) ile [docs/photo-credits.md](docs/photo-credits.md) içeriklerinin bu adreslerde yayınlanması gerekir (içerik hakları / Apple incelemesi için).
- [ ] **AdMob production:** Production’da gerçek AdMob uygulama ve birim ID’leri kullanılmalı; `EXPO_PUBLIC_ADS_ENV=production` ve ilgili `EXPO_PUBLIC_ADMOB_*` env’ler set edilmeli. [docs/ads.md](docs/ads.md).
- [ ] **Widget bundle / group id:** `app.config.ts` içinde widget `bundleIdentifier` ve `groupIdentifier` ana uygulama bundle id’si ile uyumlu; farklı bir bundle id kullanılıyorsa bu değerler güncellenmeli.
- [ ] **Bildirim ve ödüllü reklam:** Gerçek cihazda hatırlatma zamanlaması ve “One more” ödüllü reklam akışı son kez test edilmeli (Expo Go’da reklamlar çalışmaz; dev client veya release build gerekir).

---

## Bildirimler

**Sadece yerel (local notifications).** Push bildirimi (APNs) kullanılmıyor. Hatırlatmalar isteğe bağlı: günde 1–3 kez, aktif saatler ayarlanabilir (varsayılan 09:00–21:00), duraklatma var. İzin verilmezse uygulama yine tam çalışır.

- **Ücretli Apple Developer hesabı:** Release/TestFlight build'lerinde sorunsuz çalışması için entitlement'a `aps-environment` (production) eklendi. Xcode'da **Signing & Capabilities**'te **Push Notifications** capability'sini açın (henüz yoksa). Yerel bildirimler için APNs zorunlu değil; bu ayar App Store build'leriyle uyum içindir.
- **İleride push eklerseniz:** Aynı capability ile APNs key/certificate ve backend ekleyin.

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
- Widget’ı (Home Screen + Lock Screen) gerçek cihazda veya TestFlight ile test et; tap ile uygulama açıldığını doğrula.

---

## Repo

**GitHub:** [yabastudio/Quotify](https://github.com/yabastudio/Quotify)  
**Clone:** `https://github.com/yabastudio/Quotify.git`
