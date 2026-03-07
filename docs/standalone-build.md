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
