# PWA Icon Oluşturma Rehberi

PWA uygulamanız için icon'lar oluşturmanız gerekiyor.

## Gerekli Icon'lar

- `icon-192.png` - 192x192 piksel
- `icon-512.png` - 512x512 piksel

## Online Araçlar

### 1. Realfavicongenerator (Önerilen)
https://realfavicongenerator.net/

1. 512x512 veya daha büyük bir logo yükle
2. "PWA" sekmesine git
3. Ayarları yap
4. İndir ve `frontend/` klasörüne kopyala

### 2. PWA Asset Generator
https://www.pwabuilder.com/imageGenerator

1. Logo yükle
2. "Generate" tıkla
3. Tüm icon'ları indir
4. 192x192 ve 512x512 olanları seç
5. `frontend/` klasörüne kopyala

### 3. Figma (Manuel)

Figma'da tasarım yap:

**Icon Tasarım Önerileri:**
- Basit ve tanınabilir
- Kontrast renkler
- Merkezi logo
- 20% padding
- Şeffaf arkaplan veya solid renk

**Örnek Tasarım:**
```
┌─────────────────┐
│                 │
│     🛒          │
│   STOK          │
│                 │
└─────────────────┘
```

### 4. Canva

1. https://www.canva.com
2. Custom size: 512x512
3. Tasarla
4. PNG olarak export et
5. Online tool ile 192x192'ye resize et

## Placeholder Icon (Geçici)

Geliştirme aşamasında kullanmak için:

https://via.placeholder.com/512x512/667eea/ffffff?text=STOK

Bu URL'i tarayıcıda aç, sağ tık → "Resmi Kaydet":
- 512x512 olanı `icon-512.png` olarak kaydet
- Photoshop/GIMP ile 192x192'ye resize et → `icon-192.png` olarak kaydet

## Icon Renk Şeması

Manifest.json'daki `theme_color` ile uyumlu olmalı:

**Ana Renk:** `#667eea` (Mor/Mavi)
**Arka Plan:** `#ffffff` (Beyaz)

## Test

### iOS Safari
1. Uygulamayı aç
2. Paylaş → Ana Ekrana Ekle
3. Icon doğru görünüyor mu?

### Android Chrome
1. Uygulamayı aç
2. Menü → Ana ekrana ekle
3. Icon doğru görünüyor mu?

## Maskable Icon (Opsiyonel)

Android için "adaptive icon" desteği.

Online tool: https://maskable.app/

1. Icon'u yükle
2. Padding ayarla (%20 önerilen)
3. Export et
4. `manifest.json`'da güncelle:
   ```json
   {
     "src": "/icon-512.png",
     "sizes": "512x512",
     "type": "image/png",
     "purpose": "any maskable"
   }
   ```

## Örnek Icon Görselleri

Projenize uygun ücretsiz icon'lar:

- **Flaticon:** https://www.flaticon.com/search?word=shopping+cart
- **Icons8:** https://icons8.com/icons/set/shopping
- **Font Awesome:** https://fontawesome.com/icons/cart-shopping

## Son Kontrol

✅ icon-192.png mevcut
✅ icon-512.png mevcut
✅ Dosya boyutları < 100KB
✅ Format: PNG
✅ Şeffaf arkaplan (veya solid renk)
✅ manifest.json'da doğru path
✅ Mobil cihazda test edildi
