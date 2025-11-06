# 🛒 Market Stok Yönetim Sistemi

> **Sesli stok girişi yapabilen, 6 market şubesi için geliştirilmiş PWA uygulaması**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-18%2B-green.svg)](https://nodejs.org)
[![N8n](https://img.shields.io/badge/n8n-latest-orange.svg)](https://n8n.io)

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Özellikler](#özellikler)
- [Teknoloji Stack](#teknoloji-stack)
- [Mimari](#mimari)
- [Kurulum](#kurulum)
- [Deployment](#deployment)
- [Kullanım](#kullanım)
- [API Dokümantasyonu](#api-dokümantasyonu)
- [Troubleshooting](#troubleshooting)
- [Lisans](#lisans)

---

## 🎯 Genel Bakış

6 market şubesine sahip bir işletme için geliştirilmiş sesli stok yönetim sistemi. Manavcılar mobil cihazlarından ses kaydı yaparak stok girişi yapabilir, sistem otomatik olarak:

1. ✅ Sesi metne çevirir (OpenAI Whisper)
2. ✅ Ürün ve miktar bilgilerini çıkarır (GPT-3.5)
3. ✅ Google Sheets'e otomatik yazar
4. ✅ Gerçek zamanlı stok takibi sağlar

### 🎥 Demo

![Login Screen](docs/screenshots/login.png)
![Recording Screen](docs/screenshots/recording.png)
![Results Screen](docs/screenshots/results.png)

---

## ✨ Özellikler

### 🎤 Ses Kaydı
- Tarayıcı tabanlı ses kaydı (mikrofon erişimi)
- WebM/Opus codec ile optimize edilmiş kayıt
- Maksimum 3 dakika kayıt süresi
- Gerçek zamanlı zamanlayıcı

### 🤖 AI İşleme
- **OpenAI Whisper**: %95+ Türkçe doğruluk oranı
- **GPT-3.5 Turbo**: Akıllı ürün/miktar çıkarma
- Otomatik birim standartlaştırma (kilo→kg, adet→ad)
- Title case formatlaması

### 📊 Google Sheets Entegrasyonu
- Otomatik UPSERT (append or update)
- 6 şube için ayrı sütunlar
- Timestamp tracking
- Koşullu biçimlendirme desteği

### 🔐 Güvenlik
- JWT token authentication
- PIN bazlı şube girişi
- 12 saat token süresi
- HTTPS zorunlu

### 📱 PWA (Progressive Web App)
- Offline çalışma desteği
- Ana ekrana eklenebilir
- Mobil uyumlu responsive tasarım
- iOS & Android desteği

---

## 🛠️ Teknoloji Stack

### Frontend
- **HTML5 / CSS3 / Vanilla JavaScript**
- **Service Worker** (offline support)
- **Web Audio API** (mikrofon erişimi)
- **MediaRecorder API** (ses kaydı)

### Backend (N8n)
- **N8n** (self-hosted workflow automation)
- **Node.js** 18+
- **PostgreSQL** (N8n database)
- **Docker** (containerization)

### AI & APIs
- **OpenAI Whisper API** (speech-to-text)
- **OpenAI GPT-3.5 Turbo** (LLM)
- **Google Sheets API** (data storage)
- **Google Cloud Run** (hosting)

### Infrastructure
- **Google Cloud Platform**
  - Cloud Run (N8n hosting)
  - Cloud SQL (PostgreSQL)
  - Container Registry
- **Vercel** (PWA hosting)

---

## 🏗️ Mimari

```
┌─────────────┐
│   PWA App   │
│  (Vercel)   │
└──────┬──────┘
       │ HTTPS
       │
       ▼
┌──────────────────┐
│   N8n Workflow   │
│  (Cloud Run)     │
├──────────────────┤
│ 1. JWT Auth      │
│ 2. Whisper API   │
│ 3. GPT-3.5 API   │
│ 4. Sheets Write  │
└────┬─────────────┘
     │
     ├──────► OpenAI API
     │
     └──────► Google Sheets
```

### Veri Akışı

```
[Kullanıcı] → [Ses Kaydı] → [N8n Webhook]
                                  │
                                  ▼
                           [JWT Verification]
                                  │
                                  ▼
                           [Whisper API]
                                  │
                                  ▼
                           [GPT-3.5 Parsing]
                                  │
                                  ▼
                           [Google Sheets]
                                  │
                                  ▼
                           [Success Response]
```

---

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- Docker & Docker Compose
- Google Cloud hesabı (300$ kredi)
- OpenAI API key
- Google Sheets hesabı

### 1. Repository Clone

```bash
git clone https://github.com/yourusername/stok-yonetim.git
cd stok-yonetim
```

### 2. Environment Variables

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin ve gerekli değerleri doldurun:

```bash
# Kritik değişkenler
PROJECT_ID=your-gcp-project-id
OPENAI_API_KEY=sk-...
N8N_BASIC_AUTH_PASSWORD=strong-password
JWT_SECRET=your-32-char-secret
DB_PASSWORD=secure-db-password
```

### 3. Google Cloud Setup

```bash
# GCloud CLI kurulumu
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# GCloud login
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Docker auth
gcloud auth configure-docker
```

### 4. Google Sheets Setup

[Google Sheets Kurulum Kılavuzu](docs/GOOGLE_SHEETS_SETUP.md) dokümanını takip edin.

### 5. N8n Deployment

```bash
cd deployment
chmod +x deploy-n8n.sh

# Environment variables'ı export edin
export PROJECT_ID=your-project-id
export N8N_BASIC_AUTH_PASSWORD=your-password
export N8N_ENCRYPTION_KEY=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 32)
export DB_PASSWORD=your-db-password

# Deploy
./deploy-n8n.sh
```

Deployment tamamlandığında N8n URL'i verilecektir:
```
https://n8n-stok-yonetim-PROJECT_ID.a.run.app
```

### 6. N8n Workflow Import

1. N8n URL'e gidin ve login yapın
2. **Workflows** → **Import from File**
3. İki workflow'u import edin:
   - `n8n/workflows/01-login-workflow.json`
   - `n8n/workflows/02-stok-kayit-workflow.json`
4. Her workflow'da:
   - OpenAI credentials ekleyin
   - Google Sheets credentials ekleyin
   - Google Sheets ID'yi güncelleyin
5. Workflow'ları **Activate** edin

### 7. Frontend Deployment

#### Vercel ile (Önerilen)

```bash
cd frontend

# Vercel CLI kurulumu
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Manuel Deployment

Frontend klasörünü herhangi bir static hosting'e yükleyin:
- Netlify
- GitHub Pages
- Firebase Hosting
- Cloudflare Pages

**Önemli:** `frontend/app.js` dosyasındaki N8n URL'lerini güncelleyin:

```javascript
const CONFIG = {
  N8N_WEBHOOK_URL: 'https://YOUR-N8N-URL/webhook/ses-kayit',
  LOGIN_WEBHOOK_URL: 'https://YOUR-N8N-URL/webhook/login',
};
```

---

## 📖 Kullanım

### Kullanıcı Kılavuzu

Detaylı kullanıcı kılavuzu: [KULLANICI_KILAVUZU.md](docs/KULLANICI_KILAVUZU.md)

### Hızlı Başlangıç

1. **PWA URL'e gidin**
2. **Şube seçin** (örn: Merkez Şube)
3. **6 haneli PIN girin**
4. **"Kayda Başla"** butonuna tıklayın
5. **Konuşun:**
   > "Domates 50 kilo, salatalık 30 kilo, patlıcan 20 adet"
6. **"Durdur"** butonuna tıklayın
7. **Sonuçları kontrol edin**

### PIN Kodları

Varsayılan PIN'ler (`.env` dosyasında değiştirin):

| Şube | PIN |
|------|-----|
| Merkez | 123456 |
| Kadıköy | 234567 |
| Beşiktaş | 345678 |
| Şişli | 456789 |
| Üsküdar | 567890 |
| Bakırköy | 678901 |

---

## 📡 API Dokümantasyonu

### 1. Login API

**Endpoint:** `POST /webhook/login`

**Request:**
```json
{
  "sube": "merkez",
  "pin": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sube": "merkez",
  "expiresIn": "12h"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Hatalı PIN"
}
```

### 2. Ses Kaydı API

**Endpoint:** `POST /webhook/ses-kayit`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request:**
```
FormData:
  - file: audio/webm (binary)
  - sube: string
  - timestamp: ISO 8601 string
```

**Response (Success):**
```json
{
  "success": true,
  "message": "3 ürün başarıyla kaydedildi",
  "products": [
    {
      "urun": "Domates",
      "miktar": 50,
      "birim": "kg"
    },
    {
      "urun": "Salatalık",
      "miktar": 30,
      "birim": "kg"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Token süresi dolmuş",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🐛 Troubleshooting

### Frontend Sorunları

#### Mikrofon çalışmıyor
- ✅ HTTPS kullanıyor musunuz? (HTTP'de mikrofon çalışmaz)
- ✅ Tarayıcı izni verdiniz mi?
- ✅ Mikrofon başka uygulama tarafından kullanılıyor olabilir

#### Login başarısız
- ✅ N8n URL doğru mu?
- ✅ N8n workflow aktif mi?
- ✅ PIN doğru mu?
- ✅ CORS ayarları doğru mu?

### Backend Sorunları

#### N8n'e erişilemiyor
```bash
# Cloud Run logları kontrol et
gcloud run services logs read n8n-stok-yonetim \
  --project=YOUR_PROJECT_ID \
  --region=us-central1
```

#### Database bağlantı hatası
```bash
# Cloud SQL instance durumu kontrol et
gcloud sql instances describe n8n-database \
  --project=YOUR_PROJECT_ID
```

#### Whisper API hatası
- ✅ OpenAI API key geçerli mi?
- ✅ API quota aşıldı mı?
- ✅ Ses dosyası formatı destekleniyor mu?

### Google Sheets Sorunları

#### Veri yazılamıyor
- ✅ Google Sheets API aktif mi?
- ✅ OAuth2 credentials doğru mu?
- ✅ Sheet ID doğru mu?
- ✅ Sheet adı "Stok" mu?

---

## 💰 Maliyet Tahmini

### Aylık Kullanım (6 şube, günde 2-3 kayıt)

| Servis | Kullanım | Maliyet |
|--------|----------|---------|
| Cloud Run (N8n) | ~10 saat/ay | $2-3 |
| Cloud SQL (db-f1-micro) | 24/7 | $7-8 |
| OpenAI Whisper | ~500 dakika | $3-5 |
| OpenAI GPT-3.5 | ~2000 request | $2-3 |
| Vercel (Hobby) | Unlimited | $0 |
| Google Sheets | Free tier | $0 |
| **TOPLAM** | | **$14-19/ay** ✅ |

**Not:** İlk 3 ay Google Cloud $300 kredi ile tamamen ücretsiz!

---

## 🔒 Güvenlik

### Best Practices

1. ✅ `.env` dosyasını asla Git'e commit etmeyin
2. ✅ Production'da güçlü PIN'ler kullanın (min 8 karakter)
3. ✅ JWT secret'i düzenli değiştirin
4. ✅ HTTPS zorunlu tutun
5. ✅ Rate limiting ekleyin (N8n workflow'da)
6. ✅ Google Sheets'i sadece gerekli kişilerle paylaşın

### Güvenlik Kontrol Listesi

- [ ] Tüm API key'ler environment variable olarak saklanıyor
- [ ] JWT secret minimum 32 karakter
- [ ] Database şifresi güçlü
- [ ] N8n basic auth aktif
- [ ] HTTPS kullanılıyor
- [ ] PIN'ler production'da değiştirildi

---

## 📚 Ek Kaynaklar

- [Google Sheets Setup](docs/GOOGLE_SHEETS_SETUP.md)
- [Kullanıcı Kılavuzu](docs/KULLANICI_KILAVUZU.md)
- [N8n Dokümantasyonu](https://docs.n8n.io)
- [OpenAI API Docs](https://platform.openai.com/docs)

---

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır!

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📄 Lisans

MIT License - detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 👥 İletişim

- **Proje Sahibi:** [Your Name]
- **Email:** your.email@example.com
- **GitHub:** [@yourusername](https://github.com/yourusername)

---

## 🙏 Teşekkürler

- [N8n](https://n8n.io) - Harika workflow automation
- [OpenAI](https://openai.com) - Whisper & GPT-3.5
- [Google Cloud](https://cloud.google.com) - Cloud infrastructure
- [Vercel](https://vercel.com) - PWA hosting

---

**⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**
