# 🧪 Lokal Test Rehberi

## Hızlı Başlangıç

### 1️⃣ Servisleri Başlat

```bash
cd /home/user/stok

# Mock API
cd mock-api
npm install
npm start &

# Frontend (başka terminal)
cd ../frontend
python3 -m http.server 3000 &

# Veya otomatik test script
cd ..
./test-local.sh
```

### 2️⃣ Tarayıcıda Aç

**URL:** http://localhost:3000

**Giriş Bilgileri:**
- Şube: Merkez Şube
- PIN: `123456`

---

## 📋 Mevcut Durum

✅ **Çalışan Servisler:**
- Frontend: http://localhost:3000
- Mock API: http://localhost:3001

### Process ID'ler:
```bash
# Frontend PID
cat /tmp/frontend.pid

# Mock API PID
cat /tmp/mock-api.pid
```

---

## 🛑 Servisleri Durdurma

```bash
# Frontend'i durdur
kill $(cat /tmp/frontend.pid)

# Mock API'yi durdur
kill $(cat /tmp/mock-api.pid)

# Tümünü durdur
pkill -f "python3 -m http.server 3000"
pkill -f "node server.js"
```

---

## 🔄 Servisleri Yeniden Başlatma

```bash
# Önce durdur
pkill -f "python3 -m http.server 3000"
pkill -f "node server.js"

# Sonra başlat
cd /home/user/stok/mock-api && npm start > /tmp/mock-api.log 2>&1 &
cd /home/user/stok/frontend && python3 -m http.server 3000 > /tmp/frontend.log 2>&1 &

# Test et
./test-local.sh
```

---

## 📊 Logları İzleme

```bash
# Mock API logs
tail -f /tmp/mock-api.log

# Frontend logs
tail -f /tmp/frontend.log

# Canlı HTTP istekler
# Frontend log'u otomatik gösterir
```

---

## 🧪 API Test Komutları

### Login Test
```bash
# Başarılı login
curl -X POST http://localhost:3001/webhook/login \
  -H "Content-Type: application/json" \
  -d '{"sube":"merkez","pin":"123456"}'

# Başarısız login
curl -X POST http://localhost:3001/webhook/login \
  -H "Content-Type: application/json" \
  -d '{"sube":"merkez","pin":"999999"}'
```

### Ses Kaydı Test
```bash
# Test dosyası oluştur
echo "test audio" > /tmp/test.webm

# Upload test
curl -X POST http://localhost:3001/webhook/ses-kayit \
  -H "Authorization: Bearer mock.token.here" \
  -F "file=@/tmp/test.webm" \
  -F "sube=merkez"
```

### Health Check
```bash
curl http://localhost:3001/health
curl http://localhost:3000/
```

---

## 🎯 Test Senaryoları

### Senaryo 1: Başarılı Login
1. Tarayıcı aç: http://localhost:3000
2. Şube: Merkez Şube
3. PIN: 123456
4. "Giriş Yap" tıkla
5. ✅ Kayıt ekranı açılmalı

### Senaryo 2: Başarısız Login
1. Şube: Merkez Şube
2. PIN: 999999
3. "Giriş Yap" tıkla
4. ✅ "Hatalı PIN" hatası görünmeli

### Senaryo 3: Ses Kaydı (Mock)
1. Giriş yap (123456)
2. "Kayda Başla" tıkla
3. Bekle (2 saniye mock delay)
4. ✅ 3 ürün gösterilmeli:
   - Domates 50 kg
   - Salatalık 30 kg
   - Patlıcan 20 ad

---

## 🐛 Sorun Giderme

### Port zaten kullanımda
```bash
# Hangi process kullanıyor?
lsof -i :3000
lsof -i :3001

# Durdur
kill -9 <PID>
```

### Mock API çalışmıyor
```bash
# Dependencies kurulu mu?
cd mock-api
npm install

# Port değiştir
PORT=3002 npm start
```

### Frontend açılmıyor
```bash
# Alternatif server
cd frontend
npx serve -s . -l 3000

# Veya Node.js ile
npx http-server -p 3000
```

---

## 📝 Otomatik Test Script

Tüm testleri çalıştır:
```bash
./test-local.sh
```

**Test Edilen:**
- ✅ Mock API health
- ✅ Frontend health
- ✅ Login (correct PIN)
- ✅ Login (wrong PIN)
- ✅ Voice upload
- ✅ Frontend files (5 dosya)

**Beklenen Sonuç:**
```
✅ TÜM TESTLER BAŞARILI!
Başarılı: 10
Başarısız: 0
```

---

## 🔧 Geliştirme Modu

### Frontend değişikliklerini test et
Frontend dosyaları değiştiğinde otomatik yenilenir (browser refresh gerekli).

### Mock API değişikliklerini test et
```bash
# Nodemon ile auto-restart
cd mock-api
npm run dev
```

### Frontend config değiştir
`frontend/app.js` → `CONFIG` objesi

**Şu anki:** Mock API (port 3001)
**Production:** N8n (port 5678 veya cloud URL)

---

## 📦 Docker ile Test (Alternatif)

```bash
# Tüm servisleri başlat
make start

# Logları izle
make logs

# Durdur
make stop

# Test
make test
```

---

## ✨ İpuçları

1. **Browser DevTools:** Console'u aç (F12), hataları gör
2. **Network Tab:** API request/response'ları izle
3. **PWA Install:** Desktop'a ekle ikonu görünecek
4. **Offline Test:** Service Worker'ı test et
5. **Mock Data:** `mock-api/server.js` → products array'i değiştir

---

## 📞 Yardım

Sorun mu var?

1. Testleri çalıştır: `./test-local.sh`
2. Logları kontrol et: `tail -f /tmp/*.log`
3. Servisleri yeniden başlat
4. README.md ve TROUBLESHOOTING.md oku

---

**Son Güncellenme:** 2024-11-06
**Versiyon:** 1.0.0
**Test Durumu:** ✅ 10/10 PASSING
