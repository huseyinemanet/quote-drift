# Tek başına (standalone) native paket

Uygulama, Metro’ya bağlı olmadan tek başına çalışsın istiyorsan JS bundle’ın uygulama içine gömülü olduğu **Release** build alman gerekir.

## 1. Yerel Release build (bilgisayarında)

Telefonda veya simülatörde Metro’ya ihtiyaç duymayan sürüm:

```bash
# Cihaza yüklemek için (telefon bağlıyken)
npm run ios:release -- --device

# veya sadece Release build (sonra Xcode’dan cihaz seçip Run)
npm run ios:release
```

- Build sırasında JS bundle otomatik üretilir ve `.app` içine gömülür.
- Uygulamayı açtığında Metro çalışması gerekmez; tamamen offline çalışır.

## 2. EAS Build (TestFlight / App Store için)

Dağıtım için .ipa üretmek veya TestFlight’a yüklemek istersen EAS kullanılır.

### Kurulum (bir kez)

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### iOS production build

```bash
eas build --platform ios --profile production
```

Build bittikten sonra EAS sayfasından .ipa indirip TestFlight’a yükleyebilir veya “Submit to App Store” ile gönderebilirsin.

### EAS profilleri (opsiyonel)

`eas.json` içinde farklı profiller tanımlayabilirsin (örn. `production`, `preview`). `eas build:configure` temel bir `eas.json` oluşturur.

---

**Özet:** Günlük kullanım için `npm run ios:release -- --device` yeterli; uygulama tek başına çalışır. App Store / TestFlight için `eas build --platform ios --profile production` kullan.

---

## Cihazda “invalid code signature / inadequate entitlements” hatası

Build başarılı ama uygulama telefonda açılmıyorsa (Security / code signature / entitlements / profile not trusted):

### 1. Geliştiriciyi güvenilir yap (çoğu durumda yeterli)

İlk kez bu bilgisayarla imzalı bir uygulama yüklüyorsan iOS imzayı “güvenilmeyen” sayar.

- **iPhone:** **Ayarlar → Genel → VPN ve Cihaz Yönetimi** (veya **Profiller**) → “Geliştirici Uygulaması” altında ekibini seç → **“[Ekip adı]’a Güven”**.
- Sonra ana ekrandan uygulamayı tekrar aç.

### 2. Entitlements ile profil uyumsuzsa

Entitlements dosyasında **Push Notifications** (`aps-environment`) ve **App Groups** var. Provisioning profile bu yetenekleri içermiyorsa uygulama açılmaz.

- **Apple Developer Portal:** [Identifiers](https://developer.apple.com/account/resources/identifiers/list) → **com.huseyinemanet.quotify** → **Capabilities** bölümünde **Push Notifications** ve **App Groups** (grup: `group.com.huseyinemanet.quotify`) açık olsun. Kaydet.
- **Widget extension** için: **com.huseyinemanet.quotify.widgets** identifier’ında da **App Groups** aynı grupla açık olsun.
- Xcode’da: **Product → Clean Build Folder**, sonra tekrar `npm run ios:release -- --device`. Xcode otomatik imzalama kullanıyorsa yeni profil indirilir.
- Manuel profil kullanıyorsan: Portal’da ilgili **Profiles**’ı silip yeniden oluştur, indir, Xcode’da seç.

Bu adımlardan sonra build alıp cihaza yükleyince uygulama normalde açılır.

### Verify’a basınca hiçbir şey olmuyorsa

“Verify App”e basıyorsun ama ekran değişmiyor veya doğrulama tamamlanmıyorsa:

1. **Geliştirici modu (iOS 16+)**  
   **Ayarlar → Gizlilik ve Güvenlik → Geliştirici Modu** → Aç. Cihaz yeniden başlar. Geliştirici modu kapalıyken bazen doğrulama sessizce başarısız olur.

2. **Xcode’dan Debug ile çalıştır**  
   Release yerine Debug imzasıyla ilk kez Xcode’dan çalıştırmak, güven/doğrulama akışını tetikleyebilir.  
   - Mac’te projeyi aç: `open ios/Quotify.xcworkspace`  
   - Üstte cihazını (iPhone) seç, scheme **Quotify** ve **Run** (▶).  
   - Debug build yüklenir ve Xcode uygulamayı açar. Bir kez bu şekilde çalıştıktan sonra ana ekrandan da açılabilir.  
   - İstersen sonra `npm run ios:release -- --device` ile Release build’i tekrar yükleyip aynı cihazda deneyebilirsin.

3. **TestFlight ile kur**  
   Doğrulama ağı/cihazda hiç çalışmıyorsa, uygulamayı TestFlight üzerinden kurmak “Verify App” adımını atlatır.  
   - `eas build --platform ios --profile production` ile build al.  
   - Build’i App Store Connect’e gönderip TestFlight’a ekle.  
   - iPhone’da TestFlight uygulamasından Quotify’ı yükle ve aç.
