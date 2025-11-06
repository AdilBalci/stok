# 📱 Kullanıcı Kılavuzu - Market Stok Yönetim Sistemi

> **Basit, hızlı ve sesli stok girişi için detaylı kullanım rehberi**

---

## 📋 İçindekiler

1. [Giriş Yapma](#1-giriş-yapma)
2. [İlk Kullanım - PWA Kurulumu](#2-ilk-kullanım---pwa-kurulumu)
3. [Ses Kaydı Yapma](#3-ses-kaydı-yapma)
4. [Sonuçları Kontrol Etme](#4-sonuçları-kontrol-etme)
5. [İpuçları ve En İyi Uygulamalar](#5-ipuçları-ve-en-i̇yi-uygulamalar)
6. [Sık Karşılaşılan Sorunlar](#6-sık-karşılaşılan-sorunlar)
7. [SSS (Sıkça Sorulan Sorular)](#7-sss-sıkça-sorulan-sorular)

---

## 1. Giriş Yapma

### Adım 1: Uygulamayı Açın

Tarayıcınızda PWA URL'ini açın:
```
https://your-pwa-url.vercel.app
```

### Adım 2: Şubenizi Seçin

![Login Ekranı](screenshots/login.png)

Açılır menüden çalıştığınız şubeyi seçin:
- ✅ Merkez Şube
- ✅ Kadıköy Şubesi
- ✅ Beşiktaş Şubesi
- ✅ Şişli Şubesi
- ✅ Üsküdar Şubesi
- ✅ Bakırköy Şubesi

### Adım 3: PIN Kodunuzu Girin

6 haneli PIN kodunuzu girin.

**Örnek:** `123456`

> **🔒 Güvenlik Notu:** PIN kodunuzu kimseyle paylaşmayın. Her şubenin kendi PIN kodu vardır.

### Adım 4: Giriş Yap

**"Giriş Yap"** butonuna tıklayın.

✅ Başarılı giriş sonrası kayıt ekranı açılacaktır.

### Hata Mesajları

| Hata | Çözüm |
|------|-------|
| "Lütfen bir şube seçin" | Şube seçmeyi unutmuşsunuz |
| "PIN 6 haneli olmalıdır" | Tam 6 rakam girmelisiniz |
| "Giriş başarısız" | PIN yanlış veya internet bağlantısı yok |

---

## 2. İlk Kullanım - PWA Kurulumu

### iOS (iPhone/iPad)

1. **Safari** ile uygulamayı açın
2. **Paylaş** simgesine ( ⎙ ) tıklayın
3. **"Ana Ekrana Ekle"** seçeneğini seçin
4. İsim verin: **"Stok Kaydı"**
5. **"Ekle"** butonuna tıklayın

![iOS PWA Kurulum](screenshots/ios-pwa-install.png)

### Android

1. **Chrome** ile uygulamayı açın
2. Menü (⋮) → **"Ana ekrana ekle"**
3. İsim verin: **"Stok Kaydı"**
4. **"Ekle"** butonuna tıklayın

![Android PWA Kurulum](screenshots/android-pwa-install.png)

### Avantajları

✅ Uygulama gibi çalışır
✅ Anında açılır
✅ Tam ekran deneyimi
✅ Offline çalışma desteği

---

## 3. Ses Kaydı Yapma

### Adım 1: Mikrofon İzni Verin

İlk kullanımda tarayıcı mikrofon izni isteyecektir.

**"İzin Ver"** / **"Allow"** seçeneğini seçin.

![Mikrofon İzni](screenshots/mic-permission.png)

> **⚠️ Önemli:** İzin vermezseniz ses kaydı yapamazsınız!

### Adım 2: Kayda Başlayın

![Kayıt Ekranı](screenshots/recording.png)

**🎤 "Kayda Başla"** butonuna tıklayın.

- ⏱️ Zamanlayıcı başlayacaktır
- 🔴 Kayıt göstergesi yanacaktır

### Adım 3: Konuşun

**Net ve anlaşılır bir şekilde konuşun:**

#### ✅ Doğru Örnekler

```
"Domates 50 kilo, salatalık 30 kilo, patlıcan 20 adet"
```

```
"Elma 40 kilo, armut 35 kilo, muz 25 kilo"
```

```
"Süt 100 litre, yoğurt 50 kilo, peynir 20 kilo"
```

#### ❌ Yanlış Örnekler

```
"Domates var, salatalık az, patlıcan çok"
❌ Miktar belirtilmemiş
```

```
"Dün domates 50 kilo almıştık"
❌ Geçmiş zaman kullanımı
```

```
"50 domates kilo"
❌ Sıralama yanlış (miktar önce gelmeli)
```

### Adım 4: Kaydı Durdurun

**⏹️ "Durdur"** butonuna tıklayın.

- Kayıt sonlanacak
- Otomatik işleme başlayacak
- "İşleniyor..." mesajı görünecek

### İşleme Süresi

Tipik olarak **5-10 saniye** sürer:
1. Ses metne dönüştürülüyor (Whisper)
2. Ürünler çıkarılıyor (GPT-3.5)
3. Google Sheets'e yazılıyor

---

## 4. Sonuçları Kontrol Etme

### Başarılı Kayıt

![Sonuç Ekranı](screenshots/results.png)

✅ Yeşil onay mesajı görünecek
✅ Kaydedilen ürünler listelenecek

**Örnek:**

```
✅ 3 ürün başarıyla kaydedildi!

Domates       50 kg
Salatalık     30 kg
Patlıcan      20 ad
```

### Google Sheets'te Kontrol

1. Google Sheets'i açın
2. İlgili şubenizin sütununu kontrol edin
3. Veriler otomatik yazılmış olmalı

| Ürün Adı | Merkez | Kadıköy | ... | Son Güncelleme |
|----------|--------|---------|-----|----------------|
| Domates  | **50** | 45      | ... | 2024-01-15     |
| Salatalık| **30** | 25      | ... | 2024-01-15     |

### Yeni Kayıt Yapmak

**🔄 "Yeni Kayıt"** butonuna tıklayın.

Kayıt ekranına geri döneceksiniz.

---

## 5. İpuçları ve En İyi Uygulamalar

### 🎤 Ses Kaydı İçin

#### ✅ Yapılması Gerekenler

- 📍 Sessiz bir ortamda kayıt yapın
- 🗣️ Net ve yavaş konuşun
- 📱 Telefonu ağzınıza yakın tutun (10-20 cm)
- 🔊 Normal ses tonunda konuşun
- ✂️ Kısa cümleler kurun

#### ❌ Yapılmaması Gerekenler

- 🚫 Gürültülü ortamda kayıt yapmayın
- 🚫 Çok hızlı konuşmayın
- 🚫 Mırıldanmayın
- 🚫 Arka planda müzik çalmayın
- 🚫 3 dakikadan uzun kayıt yapmayın

### 📝 Ürün İsimlendirme

Sistem otomatik olarak standartlaştırır:

| Söylediğiniz | Sistem Yazar |
|--------------|--------------|
| "domates"    | Domates      |
| "SALATALIK"  | Salatalık    |
| "PaTLıCaN"   | Patlıcan     |

### 🔢 Miktar ve Birimler

Sistem otomatik olarak birim standartlaştırır:

| Söylediğiniz | Sistem Yazar |
|--------------|--------------|
| "50 kilo"    | 50 kg        |
| "30 kilogram"| 30 kg        |
| "20 adet"    | 20 ad        |
| "100 litre"  | 100 lt       |
| "50" (sadece)| 50 ad        |

### ⏰ En İyi Kullanım Zamanı

- ✅ Sabah açılışta (08:00-09:00)
- ✅ Öğleden sonra (14:00-15:00)
- ✅ Akşam kapanışta (18:00-19:00)

### 🔋 Pil Yönetimi

- Ses kaydı pil tüketir
- Telefon şarjının en az %20 olmasına dikkat edin
- Çok uzun kayıtlar yapmayın (max 3 dakika)

---

## 6. Sık Karşılaşılan Sorunlar

### ❌ "Mikrofon izni reddedildi"

**Çözüm:**

**iOS:**
1. Ayarlar → Safari → Kamera ve Mikrofon
2. İzin ver

**Android:**
1. Ayarlar → Uygulamalar → Chrome → İzinler
2. Mikrofon → İzin ver

### ❌ "Sunucuya bağlanılamıyor"

**Çözüm:**
1. ✅ İnternet bağlantınızı kontrol edin
2. ✅ Wi-Fi veya mobil veri açık mı?
3. ✅ VPN kullanıyorsanız kapatın
4. ✅ Sayfayı yenileyin (F5)

### ❌ "Metinde ürün bilgisi bulunamadı"

**Çözüm:**
1. ✅ Daha net konuşun
2. ✅ Ürün adı + Miktar + Birim formatında konuşun
3. ✅ Örnek: "Domates 50 kilo"
4. ✅ Tekrar deneyin

### ❌ "Token süresi dolmuş"

**Çözüm:**
1. Çıkış yapın
2. Tekrar giriş yapın
3. Token 12 saat geçerlidir

### ❌ "Ses kaydı çok kısa"

**Çözüm:**
1. En az 2-3 saniye konuşun
2. Hemen durdurmayın
3. Tam cümle kurun

### ❌ Ses kaydı yapılamıyor (iOS)

**Çözüm:**
1. Sadece **Safari** kullanın (Chrome değil!)
2. Private/Gizli mod kullanmayın
3. iOS 14+ gereklidir

---

## 7. SSS (Sıkça Sorulan Sorular)

### ❓ Aynı ürünü iki kez kaydettirsem ne olur?

✅ Son kaydedilen miktar geçerli olur. Sistem UPSERT yapar (günceller).

**Örnek:**
- İlk kayıt: "Domates 50 kilo" → Sheets'te: 50
- İkinci kayıt: "Domates 70 kilo" → Sheets'te: 70

### ❓ Kaç ürünü aynı anda kaydedebilirim?

✅ Sınır yok! Ancak **3-5 ürün** önerilir. Fazla ürün kaydederseniz hata riski artar.

### ❓ İnternet olmadan çalışır mı?

❌ Hayır. Ses işleme için OpenAI API gereklidir. İnternet olmadan kayıt yapılamaz.

### ❓ Hangi tarayıcıları kullanabilirim?

✅ **Desteklenen:**
- iOS: Safari 14+
- Android: Chrome 90+
- Desktop: Chrome, Edge, Firefox

❌ **Desteklenmeyen:**
- Internet Explorer
- Opera Mini

### ❓ Ses kaydım gizli mi?

✅ Evet! Ses kaydınız:
- Sadece transkripsiyon için kullanılır
- OpenAI sunucularında saklanmaz
- N8n'de loglanmaz
- Google Sheets'e sadece metin yazılır

### ❓ PIN'imi unuttum

🔑 Yöneticinize başvurun. PIN sıfırlama sadece admin tarafından yapılabilir.

### ❓ Aynı anda birden fazla şubeden giriş yapabilir miyim?

✅ Evet! Her cihaz/tarayıcı için ayrı giriş yapabilirsiniz. Token cihaza bağlıdır.

### ❓ Google Sheets'te manuel değişiklik yaparsam ne olur?

✅ Sorun olmaz. Manuel değişiklikler korunur. Sadece yeni kayıtlar UPSERT ile güncellenir.

### ❓ Sistemi kapatma saati var mı?

❌ Hayır. 7/24 kullanabilirsiniz.

### ❓ Ses kaydı maksimum ne kadar sürebilir?

⏱️ Maksimum **3 dakika**. Daha uzun kayıtlar otomatik durdurulur.

---

## 📞 Destek

### Teknik Sorunlar

**Email:** support@yourcompany.com
**Telefon:** +90 XXX XXX XX XX

### Acil Durum

Sistem tamamen çalışmıyorsa:
1. Google Sheets'e manuel giriş yapın
2. IT departmanına bildirin
3. Yedek kağıt formları kullanın

---

## 🎓 Video Eğitim

YouTube'da video eğitim serisi:

1. [Giriş ve İlk Kurulum](https://youtube.com/...)
2. [Ses Kaydı Nasıl Yapılır](https://youtube.com/...)
3. [Sorun Giderme](https://youtube.com/...)

---

## ✅ Hızlı Referans Kartı

**Yazdırıp şubede asabilirsiniz:**

```
┌─────────────────────────────────────┐
│  STOK KAYIT SİSTEMİ - HIZLI REHBERİ │
├─────────────────────────────────────┤
│                                     │
│ 1️⃣ Şube + PIN ile giriş yap        │
│ 2️⃣ "Kayda Başla" butonuna bas      │
│ 3️⃣ Net konuş:                      │
│    "Domates 50 kilo,               │
│     Salatalık 30 kilo"             │
│ 4️⃣ "Durdur" butonuna bas           │
│ 5️⃣ Sonuçları kontrol et            │
│                                     │
│ ⚠️ HATIRLATMA:                     │
│ • Net ve yavaş konuş               │
│ • Ürün + Miktar + Birim            │
│ • Max 3 dakika kayıt               │
│                                     │
│ 📞 Sorun mu var?                   │
│    IT: 0XXX XXX XX XX              │
└─────────────────────────────────────┘
```

---

**Son güncelleme:** 15 Ocak 2024

**Versiyon:** 1.0.0
