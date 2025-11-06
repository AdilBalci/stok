# 🚀 Deployment Guide - Adım Adım Kurulum

Bu rehber, sistemi sıfırdan production'a deploy etmek için gereken tüm adımları içerir.

---

## 📋 Ön Gereksinimler Kontrolü

### Hesaplar
- ✅ Google Cloud hesabı (300$ kredi)
- ✅ OpenAI hesabı (API key)
- ✅ GitHub hesabı
- ✅ Vercel hesabı (ücretsiz)

### Yerel Araçlar
- ✅ Git
- ✅ Docker Desktop
- ✅ Node.js 18+
- ✅ Google Cloud SDK

---

## AŞAMA 1: GOOGLE CLOUD KURULUMU

### 1.1 Google Cloud SDK Kurulumu

**macOS:**
```bash
brew install --cask google-cloud-sdk
```

**Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

**Windows:**
[Google Cloud SDK Installer](https://cloud.google.com/sdk/docs/install) linkinden indir

### 1.2 GCloud Authentication

```bash
# Login
gcloud auth login

# Yeni proje oluştur
gcloud projects create stok-yonetim-prod --name="Stok Yönetim"

# Projeyi aktif et
gcloud config set project stok-yonetim-prod

# Billing aktif et (web console üzerinden)
# https://console.cloud.google.com/billing
```

### 1.3 Gerekli API'leri Aktifleştir

```bash
# Container Registry API
gcloud services enable containerregistry.googleapis.com

# Cloud Run API
gcloud services enable run.googleapis.com

# Cloud SQL Admin API
gcloud services enable sqladmin.googleapis.com

# Compute Engine API
gcloud services enable compute.googleapis.com
```

### 1.4 Docker Auth

```bash
gcloud auth configure-docker
```

---

## AŞAMA 2: GOOGLE SHEETS KURULUMU

### 2.1 Yeni Sheet Oluştur

1. https://sheets.google.com adresine git
2. Yeni boş sheet oluştur
3. İsim: **"Market Stok Takip - 6 Şube"**

### 2.2 Header Ekle

İlk satıra (A1:H1):
```
Ürün Adı | Merkez | Kadıköy Şubesi | Beşiktaş Şubesi | Şişli Şubesi | Üsküdar Şubesi | Bakırköy Şubesi | Son Güncelleme
```

### 2.3 Sheet ID'yi Kopyala

URL'den Sheet ID'yi kopyala:
```
https://docs.google.com/spreadsheets/d/1ABC123xyz456/edit#gid=0
                                        ^^^^^^^^^^^^^^^^
                                        Bu kısım Sheet ID
```

### 2.4 Google Sheets API Kurulumu

1. https://console.cloud.google.com/apis adresine git
2. **"Enable APIs and Services"** tıkla
3. **"Google Sheets API"** ara ve aktifleştir
4. **"Google Drive API"** ara ve aktifleştir

### 2.5 OAuth2 Credentials

1. **APIs & Services** → **Credentials**
2. **Create Credentials** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: **"N8n Stok Yönetim"**
5. Authorized redirect URIs (şimdilik placeholder):
   ```
   https://n8n-stok-yonetim-PROJECT_ID.a.run.app/rest/oauth2-credential/callback
   ```
6. **Create** tıkla
7. **Client ID** ve **Client Secret**'i not al

---

## AŞAMA 3: OPENAI API KEY

### 3.1 OpenAI Hesabı

1. https://platform.openai.com/signup adresine git
2. Hesap oluştur / Login yap
3. **API Keys** → **Create new secret key**
4. İsim ver: **"Stok Yönetim Sistemi"**
5. API Key'i kopyala ve güvenli yere kaydet

### 3.2 Billing Ekle

1. **Settings** → **Billing**
2. Kredi kartı ekle
3. **$5-10 limit** ayarla (opsiyonel ama önerilen)

---

## AŞAMA 4: ENVIRONMENT VARIABLES

### 4.1 Secrets Oluştur

```bash
# JWT Secret oluştur
export JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET: $JWT_SECRET"

# N8n Encryption Key oluştur
export N8N_ENCRYPTION_KEY=$(openssl rand -base64 32)
echo "N8N_ENCRYPTION_KEY: $N8N_ENCRYPTION_KEY"

# Database şifresi oluştur
export DB_PASSWORD=$(openssl rand -base64 16)
echo "DB_PASSWORD: $DB_PASSWORD"

# N8n admin şifresi oluştur
export N8N_BASIC_AUTH_PASSWORD=$(openssl rand -base64 16)
echo "N8N_BASIC_AUTH_PASSWORD: $N8N_BASIC_AUTH_PASSWORD"
```

**ÖNEMLİ:** Bu değerleri güvenli bir yere kaydedin (1Password, LastPass vb.)

### 4.2 .env Dosyası Oluştur

Repository'de `.env` dosyası oluştur:

```bash
cp .env.example .env
```

Aşağıdaki değerleri doldurun:

```bash
# Google Cloud
PROJECT_ID=stok-yonetim-prod
REGION=us-central1

# Database
DB_PASSWORD=<yukarıda oluşturduğunuz>

# N8n
N8N_BASIC_AUTH_PASSWORD=<yukarıda oluşturduğunuz>
N8N_ENCRYPTION_KEY=<yukarıda oluşturduğunuz>

# JWT
JWT_SECRET=<yukarıda oluşturduğunuz>

# OpenAI
OPENAI_API_KEY=sk-...

# Google Sheets
GOOGLE_SHEET_ID=<Sheet ID'nizi buraya>
```

---

## AŞAMA 5: N8N DEPLOYMENT

### 5.1 Repository Clone

```bash
git clone https://github.com/yourusername/stok-yonetim.git
cd stok-yonetim
```

### 5.2 Environment Variables Export

```bash
source .env

# Export et
export PROJECT_ID
export REGION
export DB_PASSWORD
export N8N_BASIC_AUTH_PASSWORD
export N8N_ENCRYPTION_KEY
export JWT_SECRET
```

### 5.3 Deploy Script Çalıştır

```bash
cd deployment
chmod +x deploy-n8n.sh
./deploy-n8n.sh
```

Script şunları yapacak:
1. ✅ Cloud SQL PostgreSQL instance oluşturur
2. ✅ Database ve user oluşturur
3. ✅ Docker image build eder
4. ✅ Container Registry'e push eder
5. ✅ Cloud Run'a deploy eder

**Beklenen süre:** ~10-15 dakika

### 5.4 N8n URL'i Kaydet

Deployment sonunda şöyle bir output alacaksınız:

```
========================================
Deployment başarılı! ✓
========================================
N8n URL: https://n8n-stok-yonetim-stok-yonetim-prod.a.run.app
Username: admin
Password: <şifreniz>
========================================
```

URL'i kopyalayın ve `.env` dosyasına ekleyin:

```bash
WEBHOOK_URL=https://n8n-stok-yonetim-stok-yonetim-prod.a.run.app
```

---

## AŞAMA 6: N8N WORKFLOW KURULUMU

### 6.1 N8n'e Giriş

1. Tarayıcıda N8n URL'ini açın
2. Username: `admin`
3. Password: `.env`'deki şifreniz

### 6.2 OpenAI Credentials

1. **Credentials** → **Add Credential**
2. **OpenAI API** seçin
3. API Key'i yapıştırın
4. **Save** → İsim: **"OpenAI - Stok Yönetim"**

### 6.3 Google Sheets Credentials

1. **Credentials** → **Add Credential**
2. **Google Sheets OAuth2 API** seçin
3. Client ID ve Client Secret'i girin (AŞAMA 2.5'ten)
4. **Sign in with Google** tıklayın
5. Google hesabınızla yetkilendirin
6. **Save** → İsim: **"Google Sheets - Stok"**

### 6.4 Workflow Import

**Login Workflow:**
1. **Workflows** → **Import from File**
2. `n8n/workflows/01-login-workflow.json` seçin
3. **Import**
4. Workflow'u açın
5. **Activate** edin

**Stok Kaydı Workflow:**
1. **Workflows** → **Import from File**
2. `n8n/workflows/02-stok-kayit-workflow.json` seçin
3. **Import**
4. Workflow'u açın
5. **Google Sheets** node'unu düzenle:
   - **Document**: Google Sheets credentials seçin
   - **Document ID**: Sheet ID'nizi yapıştırın
6. **OpenAI** node'larını düzenle (2 adet):
   - Her ikisinde de OpenAI credentials seçin
7. **Save**
8. **Activate** edin

### 6.5 Webhook URL'leri Test

Test etmek için:

```bash
# Login endpoint test
curl -X POST https://YOUR-N8N-URL/webhook/login \
  -H "Content-Type: application/json" \
  -d '{"sube":"merkez","pin":"123456"}'

# Başarılı response:
# {"success":true,"token":"...","sube":"merkez"}
```

---

## AŞAMA 7: FRONTEND DEPLOYMENT

### 7.1 Frontend Klasöründe Config Güncelle

`frontend/app.js` dosyasını düzenle:

```javascript
const CONFIG = {
  N8N_WEBHOOK_URL: 'https://YOUR-N8N-URL/webhook/ses-kayit',
  LOGIN_WEBHOOK_URL: 'https://YOUR-N8N-URL/webhook/login',
  MAX_RECORDING_TIME: 180000,
};
```

### 7.2 Vercel Deployment

```bash
cd frontend

# Vercel CLI kur
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Sorulara cevaplar:
- Set up and deploy?: **Y**
- Scope: **Kendi hesabınızı seçin**
- Link to existing project?: **N**
- Project name: **stok-yonetim**
- Directory: **./**
- Override settings?: **N**

### 7.3 PWA URL'i Kaydet

Deployment sonunda:

```
✅ Production: https://stok-yonetim.vercel.app
```

---

## AŞAMA 8: TEST

### 8.1 Login Testi

1. PWA URL'i aç: `https://stok-yonetim.vercel.app`
2. Şube: **Merkez Şube**
3. PIN: **123456**
4. **Giriş Yap**

✅ Başarılı → Kayıt ekranı açılmalı

### 8.2 Ses Kaydı Testi

1. **Kayda Başla** tıkla
2. Konuş: _"Domates 50 kilo, salatalık 30 kilo"_
3. **Durdur** tıkla
4. Bekle (5-10 saniye)

✅ Başarılı → Sonuçlar görünmeli

### 8.3 Google Sheets Testi

1. Google Sheets'i aç
2. Kontrol et:
   - Domates satırı var mı?
   - Merkez sütununda 50 yazıyor mu?
   - Salatalık satırı var mı?
   - Merkez sütununda 30 yazıyor mu?

✅ Başarılı → Veriler yazılmış olmalı

---

## AŞAMA 9: PRODUCTION HAZIRLIK

### 9.1 PIN'leri Değiştir

N8n workflow'da:

`01-login-workflow.json` → **PIN Validation** node → Edit

```javascript
const PINS = {
  'merkez': '123456',        // ← Değiştir!
  'sube-kadikoy': '234567',  // ← Değiştir!
  // ...diğerleri
};
```

### 9.2 HTTPS Enforce

Vercel otomatik HTTPS sağlar. Kontrol için:

```bash
curl -I https://stok-yonetim.vercel.app
```

`strict-transport-security` header'ı olmalı.

### 9.3 Monitoring Setup (Opsiyonel)

**UptimeRobot** ile uptime monitoring:

1. https://uptimerobot.com → Ücretsiz hesap
2. **Add New Monitor**
3. Monitor Type: **HTTPS**
4. URL: PWA URL'iniz
5. Interval: **5 minutes**
6. Alert Contacts: Email adresiniz

---

## AŞAMA 10: KULLANICI EĞİTİMİ

### 10.1 Dokümantasyon Dağıtımı

Print edilecek dökümanlar:

1. ✅ Hızlı Referans Kartı (KULLANICI_KILAVUZU.md'den)
2. ✅ PIN Listesi (güvenli tutun!)
3. ✅ PWA Kurulum Rehberi

### 10.2 Demo Toplantısı

Her şubede:
1. PWA kurulumu göster
2. Örnek kayıt yap
3. Google Sheets'i göster
4. Soruları yanıtla

---

## ✅ DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Google Cloud projesi oluşturuldu
- [ ] OpenAI API key alındı
- [ ] Google Sheets oluşturuldu ve API aktif
- [ ] Environment variables hazır

### N8n Deployment
- [ ] Cloud SQL instance çalışıyor
- [ ] N8n Cloud Run'da deploy
- [ ] Workflows import edildi
- [ ] Credentials eklendi
- [ ] Workflows aktif

### Frontend Deployment
- [ ] Config güncellendi (N8n URL'leri)
- [ ] Vercel'e deploy edildi
- [ ] HTTPS çalışıyor
- [ ] PWA manifest doğru

### Testing
- [ ] Login çalışıyor
- [ ] Ses kaydı çalışıyor
- [ ] Google Sheets'e yazıyor
- [ ] Tüm şubeler test edildi

### Production
- [ ] PIN'ler değiştirildi
- [ ] Monitoring kuruldu
- [ ] Yedekleme planı var
- [ ] Kullanıcılar eğitildi

---

## 🆘 Yardım

Sorun yaşıyorsanız:

1. **Logları kontrol et:**
   ```bash
   gcloud run services logs read n8n-stok-yonetim \
     --project=stok-yonetim-prod \
     --region=us-central1 \
     --limit=50
   ```

2. **N8n executions kontrol et:**
   - N8n'de **Executions** sekmesine git
   - Hata mesajlarını kontrol et

3. **GitHub Issues:**
   - Repository'de issue aç
   - Log çıktılarını ekle

---

**Başarılar! 🎉**
