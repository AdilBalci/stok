# Google Sheets Kurulum Kılavuzu

## 1. Yeni Google Sheets Oluşturma

1. Google Sheets'e gidin: https://sheets.google.com
2. "Boş" şablon ile yeni bir tablo oluşturun
3. Tabloya isim verin: **"Market Stok Takip - 6 Şube"**

## 2. Sheet Yapısı

### Sheet Adı
`Stok` (tam olarak bu isim olmalı, N8n workflow'u buna göre yapılandırılmış)

### Sütun Yapısı (İlk Satır - Header)

```
| A           | B      | C              | D                | E            | F               | G                | H                |
|-------------|--------|----------------|------------------|--------------|-----------------|------------------|------------------|
| Ürün Adı    | Merkez | Kadıköy Şubesi | Beşiktaş Şubesi  | Şişli Şubesi | Üsküdar Şubesi  | Bakırköy Şubesi  | Son Güncelleme   |
```

### Örnek Veriler (İsteğe Bağlı)

```
| Ürün Adı    | Merkez | Kadıköy | Beşiktaş | Şişli | Üsküdar | Bakırköy | Son Güncelleme |
|-------------|--------|---------|----------|-------|---------|----------|----------------|
| Domates     | 50     | 45      | 60       | 55    | 40      | 50       | 2024-01-15     |
| Salatalık   | 30     | 25      | 35       | 30    | 28      | 32       | 2024-01-15     |
| Patlıcan    | 20     | 18      | 22       | 20    | 15      | 25       | 2024-01-15     |
```

## 3. Formatlandırma (Opsiyonel ama Önerilen)

### Header (1. Satır)
- **Yazı Tipi**: Kalın (Bold)
- **Arkaplan Rengi**: Açık mavi (#4A86E8)
- **Yazı Rengi**: Beyaz (#FFFFFF)
- **Hizalama**: Ortala

### Veri Sütunları (B-G)
- **Format**: Sayı
- **Ondalık Basamak**: 0 (tam sayı)
- **Hizalama**: Sağa yasla

### Tarih Sütunu (H)
- **Format**: Tarih (DD.MM.YYYY veya YYYY-MM-DD)
- **Hizalama**: Ortala

### Koşullu Biçimlendirme (Opsiyonel)
Düşük stok uyarısı için:

1. Veri sütunlarını seçin (B2:G1000)
2. Format → Koşullu biçimlendirme
3. Kural:
   - **Koşul**: Hücre değeri < 10
   - **Renk**: Kırmızı arkaplan (#F4C7C3)
4. Kural 2:
   - **Koşul**: Hücre değeri > 100
   - **Renk**: Yeşil arkaplan (#B7E1CD)

## 4. Google Sheets ID Bulma

1. Sheets URL'ini kopyalayın
2. URL formatı: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit#gid=0`
3. **SHEET_ID** kısmını kopyalayın
4. Bu ID'yi N8n workflow'unda kullanacaksınız

**Örnek:**
```
URL: https://docs.google.com/spreadsheets/d/1ABC123xyz456/edit#gid=0
SHEET_ID: 1ABC123xyz456
```

## 5. Paylaşım ve İzinler

### N8n için Google API Erişimi

1. **Google Cloud Console**'a gidin: https://console.cloud.google.com
2. Yeni proje oluşturun veya mevcut projeyi seçin
3. **APIs & Services** → **Enable APIs and Services**
4. **Google Sheets API**'yi etkinleştirin
5. **Google Drive API**'yi etkinleştirin (gerekli)
6. **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
7. Application type: **Web application**
8. Authorized redirect URIs:
   ```
   https://YOUR-N8N-URL/rest/oauth2-credential/callback
   ```
9. **Client ID** ve **Client Secret**'i kaydedin

### N8n Credentials Eklemek

1. N8n'de **Credentials** → **Add Credential**
2. **Google Sheets OAuth2 API** seçin
3. Client ID ve Client Secret'i girin
4. **Connect** butonuna tıklayın
5. Google hesabınızla yetkilendirme yapın
6. Credentials'a isim verin: **"Google Sheets - Stok Yönetim"**

### Manuel Paylaşım (Alternatif)

Eğer Service Account kullanıyorsanız:

1. Google Cloud Console → **Service Accounts**
2. Service Account email'ini kopyalayın (örn: `n8n-service@project.iam.gserviceaccount.com`)
3. Google Sheets'te **Paylaş** butonuna tıklayın
4. Service Account email'ini ekleyin
5. İzin: **Düzenleyici** (Editor)

## 6. Formüller ve Otomasyonlar (Opsiyonel)

### Toplam Stok Hesaplama

Yeni bir sütun ekleyin (I sütunu):

```
Header: Toplam Stok
Formül (I2): =SUM(B2:G2)
```

### Ortalama Stok

Yeni bir sütun ekleyin (J sütunu):

```
Header: Ortalama
Formül (J2): =AVERAGE(B2:G2)
```

### Otomatik Tarih Güncelleme

H sütunu için formül (sadece veri değiştiğinde güncellenmez, manuel girilmeli):

```
=TODAY()
```

## 7. Veri Doğrulama (Data Validation)

### Miktar Sütunları (B-G)

1. Sütunları seçin (B2:G1000)
2. Data → Data validation
3. Criteria: **Number** → **Greater than or equal to** → **0**
4. Geçersiz veri uyarısı göster

## 8. Sheet Koruması (Opsiyonel)

Header satırını korumak için:

1. 1. satırı seçin (header)
2. Data → Protect sheets and ranges
3. Range: `Stok!1:1`
4. Permissions: **Only you**
5. **Set permissions**

## 9. Test

Sistemi test etmek için:

1. PWA uygulamasından giriş yapın
2. Örnek ses kaydı yapın: _"Domates 50 kilo, salatalık 30 kilo"_
3. Google Sheets'i kontrol edin
4. Veri doğru şekilde yazıldı mı?

## 10. Yedekleme

### Otomatik Yedekleme
Google Sheets otomatik olarak versiyon geçmişi tutar:
- File → Version history → See version history

### Manuel Yedekleme
Düzenli olarak export edin:
- File → Download → Microsoft Excel (.xlsx) veya CSV

## 11. Sorun Giderme

### N8n'den veri yazılamıyor
- ✅ Google Sheets API aktif mi?
- ✅ OAuth2 credentials doğru mu?
- ✅ Sheet adı tam olarak "Stok" mu?
- ✅ Sheet ID doğru mu?

### Veri yanlış sütuna yazılıyor
- ✅ Column mapping (Sütun eşleştirme) doğru mu?
- ✅ Şube isimleri code node'da doğru tanımlı mı?

### Duplike satırlar oluşuyor
- ✅ "Append or Update" modu seçili mi?
- ✅ "Column to Match On" → A (Ürün Adı) seçili mi?

## 12. İleri Düzey: Dashboard ve Grafikler

### Pivot Table ile Analiz

1. Yeni bir sheet oluşturun: **"Analiz"**
2. Data → Pivot table
3. Satırlar: Ürün Adı
4. Değerler: SUM(her şube)
5. Grafik ekleyin (Insert → Chart)

### Örnek Dashboard

1. Yeni sheet: **"Dashboard"**
2. Eklenecek elemanlar:
   - Toplam ürün sayısı: `=COUNTA(Stok!A2:A)`
   - En çok stok olan şube
   - En az stok olan ürün
   - Günlük stok girişleri (bugün kaç kayıt yapıldı)

## Şablon Linki

Hazır şablon: [Kopyala](https://docs.google.com/spreadsheets/d/YOUR_TEMPLATE_ID/copy)

---

**Not:** Bu dokümandaki tüm ayarlar tamamlandıktan sonra Sheet ID'yi N8n workflow'unda güncelleyin:

```
n8n/workflows/02-stok-kayit-workflow.json → Google Sheets node → documentId: "YOUR_SHEET_ID"
```
