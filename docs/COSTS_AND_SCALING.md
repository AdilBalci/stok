# 💰 Maliyet Analizi ve Ölçeklendirme

## Mevcut Kullanım Senaryosu

**6 şube, günde 2-3 kayıt, ortalama 30 saniye konuşma**

### Aylık Kullanım Tahmini

- **Toplam kayıt sayısı:** 6 şube × 3 kayıt × 30 gün = **540 kayıt/ay**
- **Toplam konuşma süresi:** 540 × 0.5 dakika = **270 dakika/ay**
- **Toplam API call:** 540 × 2 (Whisper + GPT) = **1,080 call/ay**

---

## 📊 Detaylı Maliyet Tablosu

### Google Cloud

| Servis | Özellik | Kullanım | Birim Fiyat | Aylık Maliyet |
|--------|---------|----------|-------------|---------------|
| **Cloud Run** | N8n hosting | ~20 saat/ay | $0.00002400/vCPU-second | $1.73 |
| | 1 vCPU, 1GB RAM | ~72,000 vCPU-seconds | | |
| | Requests | 540 requests | $0.40/million | $0.00 |
| **Cloud SQL** | PostgreSQL db-f1-micro | 720 saat/ay | $0.0150/hour | $10.80 |
| | 10GB HDD Storage | 10GB | $0.090/GB/month | $0.90 |
| **Networking** | Egress (çıkış) | ~1GB/ay | $0.12/GB (first 1GB free) | $0.00 |
| **Container Registry** | Storage | <1GB | $0.026/GB/month | $0.03 |
| **Subtotal** | | | | **$13.46** |

### OpenAI

| Model | Kullanım | Birim Fiyat | Aylık Maliyet |
|-------|----------|-------------|---------------|
| **Whisper** | 270 dakika | $0.006/minute | $1.62 |
| **GPT-3.5 Turbo** | 540 requests | | |
| - Input tokens | ~27,000 tokens | $0.50/1M tokens | $0.01 |
| - Output tokens | ~13,500 tokens | $1.50/1M tokens | $0.02 |
| **Subtotal** | | | **$1.65** |

### Google Sheets API

| Servis | Kullanım | Fiyat |
|--------|----------|-------|
| **Sheets API** | 540 write operations | Ücretsiz (quota dahilinde) |
| **Drive API** | Read operations | Ücretsiz |
| **Subtotal** | | **$0.00** |

### Vercel (PWA Hosting)

| Plan | Özellikler | Fiyat |
|------|------------|-------|
| **Hobby (Free)** | Unlimited requests | $0.00 |
| | 100GB bandwidth | |
| | HTTPS included | |
| **Subtotal** | | **$0.00** |

---

## 💵 TOPLAM AYLIK MALİYET

```
Google Cloud:  $13.46
OpenAI:        $ 1.65
Vercel:        $ 0.00
──────────────────────
TOPLAM:        $15.11/ay ✅
```

**Yıllık:** ~$181

---

## 🎯 Maliyet Optimizasyonu

### Seçenek 1: Cloud SQL → SQLite (Önerilmez)

Cloud Run'da persistent volume kullanarak SQLite:

**Tasarruf:** ~$11/ay
**Dezavantaj:**
- ❌ Data loss riski
- ❌ Ölçeklenemez
- ❌ Backup karmaşık

### Seçenek 2: GPT-3.5 → GPT-4o-mini

Daha ucuz model kullanımı:

**Maliyet değişimi:** ~%30 azalma
**Dezavantaj:**
- ❌ Doğruluk biraz düşebilir

### Seçenek 3: Whisper → Google Speech-to-Text

| Model | Fiyat | 270 dakika |
|-------|-------|------------|
| **OpenAI Whisper** | $0.006/min | $1.62 |
| **Google STT** | $0.006/15 sec | $6.48 |
| **Azure Speech** | $1/hour | $4.50 |

**Sonuç:** Whisper en ucuz ✅

### Seçenek 4: Cloud Run → Cloud Functions

**Sorun:** N8n Cloud Functions'da çalışmaz
**Alternatif:** Lightweight custom Node.js app yazılabilir
**Tasarruf:** ~%20
**Efor:** Çok yüksek (önerilmez)

### ✅ Önerilen Optimizasyon

**Cloud SQL tier değişikliği:**

`db-f1-micro` → `db-g1-small` (sadece yüksek trafikte)

Veya **Serverless Cloud SQL** kullanımı (henüz beta):
- Kullanıldığı kadar öde
- Auto-pause/resume
- Potansiyel tasarruf: %40-60

---

## 📈 Ölçeklendirme Senaryoları

### Senaryo 1: 2x Büyüme (12 Şube)

**Kullanım:**
- 12 şube × 3 kayıt × 30 gün = 1,080 kayıt/ay
- 540 dakika konuşma

**Maliyet:**
| Servis | Değişim | Yeni Maliyet |
|--------|---------|--------------|
| Cloud Run | Minimal artış | $2.50 |
| Cloud SQL | Değişmez | $11.70 |
| OpenAI Whisper | 2x | $3.24 |
| OpenAI GPT | 2x | $0.06 |
| **TOPLAM** | | **$17.50/ay** |

**Artış:** +$2.39 (+15.8%)

### Senaryo 2: 5x Büyüme (30 Şube)

**Kullanım:**
- 30 şube × 3 kayıt × 30 gün = 2,700 kayıt/ay
- 1,350 dakika konuşma

**Maliyet:**
| Servis | Değişim | Yeni Maliyet |
|--------|---------|--------------|
| Cloud Run | +50% | $3.50 |
| Cloud SQL | db-g1-small | $25.00 |
| OpenAI Whisper | 5x | $8.10 |
| OpenAI GPT | 5x | $0.15 |
| **TOPLAM** | | **$36.75/ay** |

**Artış:** +$21.64 (+143%)

### Senaryo 3: 10x Büyüme (60 Şube)

**Kullanım:**
- 60 şube × 3 kayıt × 30 gün = 5,400 kayıt/ay
- 2,700 dakika konuşma

**Maliyet:**
| Servis | Değişim | Yeni Maliyet |
|--------|---------|--------------|
| Cloud Run | 2 instances | $6.00 |
| Cloud SQL | db-g1-small | $25.00 |
| OpenAI Whisper | 10x | $16.20 |
| OpenAI GPT | 10x | $0.30 |
| **TOPLAM** | | **$47.50/ay** |

### Senaryo 4: Massive Scale (1000 Şube - Enterprise)

**Kullanım:**
- 1000 şube × 5 kayıt × 30 gün = 150,000 kayıt/ay
- 75,000 dakika konuşma

**Maliyet (optimize edilmiş):**
| Servis | Çözüm | Maliyet |
|--------|-------|---------|
| Cloud Run | 10 instances + Load Balancer | $100 |
| Cloud SQL | db-n1-standard-2 + HA | $280 |
| OpenAI Whisper | 75K dakika | $450 |
| OpenAI GPT | Enterprise pricing | $100 |
| CDN | Cloudflare | $20 |
| **TOPLAM** | | **$950/ay** |

**Bu seviyede öneriler:**
1. OpenAI Enterprise plan → %20-30 indirim
2. Google Cloud CUD (Committed Use Discount) → %30-50 indirim
3. Custom Whisper fine-tuning → Daha iyi doğruluk
4. Redis cache → Duplicate request önleme

**Optimize edilmiş maliyet:** ~$600/ay

---

## 🎁 Ücretsiz Limitler

### Google Cloud (İlk 90 gün)

✅ **$300 kredi** (3 ay süreyle)
- İlk 3 ay tamamen ücretsiz
- Limit bitene kadar ücret yok

### Google Cloud (Always Free)

| Servis | Limit |
|--------|-------|
| Cloud Run | 2M requests/ay |
| | 360K GB-seconds/ay |
| Cloud Storage | 5GB/ay |
| Cloud Functions | 2M invocations/ay |

**Not:** Cloud SQL Always Free tier'da yok ❌

### OpenAI

❌ Free tier yok
✅ İlk kullanımda $5 kredi verilebilir (hesaba göre)

### Vercel

✅ **Hobby plan ücretsiz:**
- Unlimited deployments
- 100GB bandwidth
- HTTPS + Custom domain

---

## 📊 ROI Analizi

### Alternatif: Manuel Kayıt

**Personel maliyeti:**
- 6 şube × 15 dakika/gün (manuel giriş) = 90 dakika/gün
- 30 gün × 90 dakika = 2,700 dakika/ay = **45 saat/ay**
- Asgari ücret (₺17,002) ÷ 225 saat = ₺75/saat
- **Maliyet:** 45 saat × ₺75 = **₺3,375/ay** (~$110/ay)

### Kazanç

**Manuel:** $110/ay
**Otomatik:** $15/ay

**Tasarruf:** $95/ay = **$1,140/yıl** ✅

### Geri Ödeme Süresi (ROI)

**Geliştirme maliyeti:** ~$500 (one-time)
**Aylık tasarruf:** $95

**ROI:** 500 ÷ 95 = **5.3 ay** ✅

---

## 🔮 Gelecek Planları

### Potansiyel Yeni Özellikler

| Özellik | Maliyet Etkisi | Fayda |
|---------|----------------|-------|
| **Email bildirimleri** | +$0 (SendGrid free tier) | Stok uyarıları |
| **Dashboard/Analytics** | +$5/ay (Metabase hosting) | Görselleştirme |
| **SMS bildirimleri** | +$10-20/ay (Twilio) | Acil uyarılar |
| **Multi-language support** | +$0 (GPT zaten destekliyor) | Yabancı çalışanlar |
| **Görüntü tanıma** | +$15/ay (Vision API) | QR/Barkod okuma |

---

## 💡 Sonuç ve Öneriler

### Mevcut Durum (6 Şube)

✅ **$15/ay çok uygun**
✅ Google $300 kredi ile 20 ay ücretsiz
✅ ROI 5.3 ay
✅ Ölçeklenebilir mimari

### Optimize Edilmiş Kurulum

En düşük maliyetli kurulum:

```
Cloud Run (n8n):        $2/ay
Cloud SQL (f1-micro):   $11/ay
Whisper API:            $2/ay
GPT-3.5 Turbo:          $0/ay (minimal)
───────────────────────────────
TOPLAM:                 $15/ay ✅
```

### İleri Adımlar

1. ✅ İlk 3 ay Google $300 kredi kullan
2. ✅ 6 ay sonra kullanım verilerini analiz et
3. ✅ Gerekliyse Cloud SQL tier'ı optimize et
4. ✅ OpenAI volume discount için başvur (>$1000/ay ise)

**Sonuç:** Maliyet-etkin, ölçeklenebilir, sürdürülebilir ✅
