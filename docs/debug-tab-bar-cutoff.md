# Tab bar kesilme (cut-off) debug rehberi

"ONE MORE FOR TODAY" kartı tab bar'ın altında kesiliyorsa aşağıdaki adımlarla gerçek değerleri görüp sebebi netleştirebilirsin.

## 1. Ekranda değerleri göster

`TodayScreen.tsx` içinde `Screen` kullanımına `debugInsets` ekle:

```tsx
<Screen edges={["bottom"]} debugInsets>
```

Uygulamayı çalıştır, Today sekmesinde **tab bar'ın üstünde** siyah bir banner çıkacak:

- **inset:** Tab bar’dan gelen gerçek yükseklik (ilk render’da 0 olabilir).
- **effective:** Kullanılan inset (en az 84).
- **paddingBottom:** Scroll içeriğinin alt boşluğu (24 + effective).

Beklenen: `paddingBottom` en az ~108 (24+84) olmalı. Hâlâ kesiliyorsa bu değer uygulanmıyor veya layout başka bir şeyden etkileniyor demektir.

## 2. Konsol logları

Metro/simülatör konsolunda şunları ara:

- `[Screen] bottomChromeInset: X effectiveBottomInset: Y paddingBottom: Z`
- `[BottomChrome] tabBarHeight: X chromeHeight: Y`

Kontrol et:

- **inset hep 0 mı?** → Tab bar `onLayout` ile yüksekliği hiç raporlamıyor veya provider dışında kalmış olabilir.
- **inset sonradan doluyor mu?** → İlk frame’de 0, sonra ~80 civarı görünüyorsa `MIN_BOTTOM_CHROME_INSET` sayesinde kesilme olmamalı; başka bir layout sorunu ara (aşağıya bak).
- **paddingBottom 108+ mı?** → Değer doğru ama kesilme devam ediyorsa ScrollView’a gerçekten uygulanmıyor veya başka bir ScrollView/overflow var.

## 3. Olası sebepler

| Durum | Ne yapılır |
|-------|------------|
| inset hep 0, tab bar görünüyor | `BottomChromeInsetProvider` tab ekranlarını sarıyor mu kontrol et (`app/(app)/_layout.tsx`). |
| paddingBottom büyük ama hâlâ kesiliyor | ScrollView’ın `contentContainerStyle`’ı başka bir yerden override ediliyor olabilir; `Screen.tsx` dışında `contentContainerStyle` / `paddingBottom` araması yap. |
| Sadece “ONE MORE FOR TODAY” kesiliyor | Kartın kendi yüksekliği/overflow’u veya üstündeki bir View’ın `flex`/`maxHeight` ile alanı kısıtlıyor olabilir; `QuoteCard` ve `extraSection` stillerine bak. |

## 4. Debug’u kapatmak

İşin bitince `TodayScreen.tsx` içinden `debugInsets` prop’unu kaldır (veya `debugInsets={false}` yap).
