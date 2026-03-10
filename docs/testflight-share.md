# TestFlight ile Uygulamayı Arkadaşla Paylaşma

Bu rehber, Quotify uygulamasını TestFlight üzerinden bir arkadaşına (veya başka testçilere) adım adım nasıl paylaşacağını anlatır.

---

## Yol A: Xcode ile doğrudan TestFlight’a gönderme (EAS yok)

Expo/EAS kullanmadan, sadece Xcode ile archive alıp TestFlight’a yükleyebilirsin.

### Ön koşullar

- **Apple Developer Program** üyeliği (yıllık 99 USD).
- Mac’te **Xcode** kurulu.
- Projede **GoogleService-Info.plist** dosyası `ios/Quotify/` içinde olmalı (Firebase Console’dan indirip koy; repoda yok).

### Adımlar

1. **Projeyi Xcode’da aç**
   - Terminalde: `open ios/Quotify.xcworkspace`  
   - (`.xcworkspace` kullan; `.xcodeproj` değil.)

2. **Signing ayarlarını kontrol et**
   - Sol taraftan **Quotify** projesini seç → **Signing & Capabilities**.
   - **Team:** Apple Developer hesabın (veya ekibin).
   - **Bundle Identifier:** `com.huseyinemanet.quotify` (değiştirme).
   - **Automatically manage signing** işaretli olsun.

3. **Cihazı “Any iOS Device” yap**
   - Üstteki scheme’in yanında cihaz seçiciden **Any iOS Device (arm64)** seç.  
   - Gerçek cihaz veya simülatör seçiliyse Archive menüsü pasif kalır.

4. **Archive oluştur**
   - Menü: **Product → Archive**.
   - Derleme bitene kadar bekle; hata alırsan (örn. imza/provisioning) Xcode’daki hata mesajına göre düzelt.
   - Archive tamamlanınca **Organizer** penceresi açılır (Xcode’da **Window → Organizer** ile de açabilirsin).

5. **TestFlight’a yükle**
   - Organizer’da az önce oluşan archive’ı seç.
   - **Distribute App** butonuna tıkla.
   - **App Store Connect** → **Next**.
   - **Upload** → **Next**.
   - Dağıtım seçeneklerini varsayılan bırak → **Next**.
   - İmza: **Automatically manage signing** → **Next**.
   - Özeti kontrol et → **Upload**.
   - Yükleme bitince “Upload Successful” görürsün.

6. **App Store Connect’te build’i görmek**
   - [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **My Apps** → **Quotify**.
   - **TestFlight** sekmesi → **iOS**.
   - Birkaç dakika içinde yeni build “Processing” sonra “Ready to Submit” / kullanılabilir olur.
   - Buradan **External Testing** ile testçi grubu oluşturup arkadaşının e-postasını ekleyebilirsin (davet gider).

7. **Arkadaşının yapması gerekenler**
   - iPhone’a **TestFlight** uygulamasını indirmek.
   - Apple’dan gelen davet e-postasındaki linke tıklayıp **Install** ile Quotify’ı yüklemek.

---

## Yol B: EAS Build ile (Expo bulut)

Aşağıdaki bölümler EAS CLI kullanarak bulutta build alıp TestFlight’a göndermeyi anlatır. Bunu kullanmak zorunda değilsin; **Yol A** yeterli.

---

## Ön koşullar (EAS için)

- **Apple Developer Program** üyeliği (yıllık 99 USD). [developer.apple.com](https://developer.apple.com/programs/) üzerinden kayıt.
- Mac’te **Xcode** ve **Node.js** kurulu.
- Proje dizininde `npm install` yapılmış olmalı.

---

## Adım 1: EAS CLI kurulumu ve giriş (bir kez)

Terminalde:

```bash
npm install -g eas-cli
eas login
```

Expo hesabınla giriş yap. Hesabın yoksa [expo.dev](https://expo.dev) üzerinden oluştur.

---

## Adım 2: EAS projesini yapılandır (bir kez)

Proje kökünde:

```bash
eas build:configure
```

Bu komut `eas.json` oluşturur. iOS production build için varsayılan profil yeterlidir.

---

## Adım 2b: GoogleService-Info.plist secret (production build için zorunlu)

`GoogleService-Info.plist` repoda yok (.gitignore’da). EAS Build’de dosyayı oluşturmak için **Expo Dashboard’da bir secret** tanımlaman gerekir.

1. [expo.dev](https://expo.dev) → **quotify** projesi → **Secrets** (veya Project settings → Environment variables / Secrets).
2. **Create secret** ile yeni secret ekle.
3. **İsim:** `GOOGLE_SERVICES_PLIST_BASE64` (önerilen) veya `GOOGLE_SERVICES_PLIST_CONTENT`.
4. **Değer:**
   - **GOOGLE_SERVICES_PLIST_BASE64:** Firebase Console’dan indirdiğin `GoogleService-Info.plist` dosyasının içeriğini base64 yap. Terminalde:  
     `base64 -i GoogleService-Info.plist | tr -d '\n' | pbcopy`  
     (Proje kökünde dosya varken çalıştır; base64 çıktı panoya kopyalanır. Sonra Secret değerine yapıştır.)
   - **GOOGLE_SERVICES_PLIST_CONTENT:** Aynı plist dosyasının **tam XML içeriğini** kopyalayıp secret değerine yapıştır. Çok satırlı; bazen dashboard’da sorun çıkabilir, o yüzden base64 tercih edilir.
5. Secret’ı **production** (veya ilgili) environment’a bağla ve kaydet.

Build sırasında `scripts/eas-inject-google-services.js` bu secret’ı okuyup `ios/Quotify/GoogleService-Info.plist` dosyasını oluşturur; Xcode dosyayı bulur.

---

## Adım 3: iOS production build al

```bash
eas build --platform ios --profile production
```

- EAS sunucuda build alır; tamamlanması birkaç dakika sürebilir.
- Build bittiğinde [expo.dev](https://expo.dev) → projen → **Builds** sayfasında görünür.

---

## Adım 4: Build’i App Store Connect’e gönder

İki yol var:

### A) EAS Submit ile (önerilen)

Build bittikten sonra aynı build’i TestFlight’a göndermek için:

```bash
eas submit --platform ios --latest
```

- İlk seferde Apple ID ve App-Specific Password (veya API key) isteyebilir.
- **App-Specific Password:** [appleid.apple.com](https://appleid.apple.com) → Sign-In and Security → App-Specific Passwords ile oluştur.

### B) Manuel yükleme

1. [expo.dev](https://expo.dev) → projen → **Builds** → ilgili iOS build’e tıkla.
2. **Download** ile `.ipa` dosyasını indir.
3. **Transporter** uygulamasını (Mac App Store’dan) aç, `.ipa` dosyasını sürükleyip bırak, **Deliver** ile gönder.

---

## Adım 5: App Store Connect’te uygulamayı hazırla (ilk kez)

1. [App Store Connect](https://appstoreconnect.apple.com) → **My Apps**.
2. Uygulama yoksa **+** → **New App** → Platform **iOS**, isim **Quotify**, Bundle ID **com.huseyinemanet.quotify** (config’teki ile aynı), SKU (örn. `quotify-1`) gir → **Create**.
3. Sol menüden **TestFlight** sekmesine gir.
4. Build yüklendikten sonra **iOS** bölümünde build görünür. İlk kez kullanıyorsan **Missing Compliance** vb. uyarılar çıkabilir; **Provide Export Compliance Information** vb. soruları cevapla (genelde “No” / encryption kullanmıyorsanız).

---

## Adım 6: Testçi (arkadaşın) ekle

### Seçenek A: Harici testçi (arkadaşın) – en yaygın

1. App Store Connect → **TestFlight** → **External Testing**.
2. **+** ile yeni bir **External Group** oluştur (örn. “Arkadaşlar”).
3. Gruba tıkla → **Add Testers**.
4. Arkadaşının **e-posta adresini** gir (Apple ID ile ilişkili olan).
5. **Add** → sonra bu grup için **Build** seç (az önce yüklediğin build).
6. **Submit for Review** (Beta App Review). İlk defa 24–48 saat sürebilir; onaydan sonra davet gider.

### Seçenek B: Dahili testçi (ekip üyeleri)

- **Internal Testing** → **App Store Connect kullanıcıları** eklenir (rol: Admin, Developer, App Manager, Marketing, vb.).
- Bu kişiler aynı ekipte olmalı; en fazla 100 kişi. Beta incelemesi gerekmez, build yüklenir yüklenmez görürler.

---

## Adım 7: Arkadaşının yapması gerekenler

1. **iPhone’da TestFlight uygulamasını** indir (App Store’dan “TestFlight”).
2. **E-posta** gelen daveti aç (Apple’dan “You’re invited to test Quotify”).
3. Davetteki **View in TestFlight** / **Accept** linkine tıklasın; TestFlight uygulaması açılır.
4. **Install** ile Quotify’ı yüklesin.
5. Yükleme bitince **Open** ile uygulamayı açabilir.

Davet e-postası gelmezse:

- Spam klasörünü kontrol etsin.
- App Store Connect’te e-posta adresinin doğru olduğundan emin ol; davet yeniden gönderilebilir (External group → testçi → **Resend Invitation**).

---

## Yeni sürüm paylaşmak (sonraki build’ler)

1. Kod değişikliği yap.
2. `eas build --platform ios --profile production` ile yeni build al.
3. `eas submit --platform ios --latest` ile aynı build’i TestFlight’a gönder.
4. App Store Connect → TestFlight → ilgili **External Group** → **Build** alanından yeni build’i seç. Mevcut testçiler otomatik güncelleme alır (TestFlight uygulamasında “Update” çıkar).

---

## Özet komutlar

| Aşama              | Komut |
|--------------------|--------|
| EAS yapılandırma   | `eas build:configure` |
| iOS build          | `eas build --platform ios --profile production` |
| TestFlight’a gönder| `eas submit --platform ios --latest` |

Testçi ekleme ve davet: **App Store Connect → TestFlight → External Testing → Grup oluştur → E-posta ekle → Build seç → Submit for Review**.
