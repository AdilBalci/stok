require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { google } = require('googleapis');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

// PIN database
const PINS = {
  'merkez': process.env.PIN_MERKEZ || '123456',
  'sube-kadikoy': process.env.PIN_KADIKOY || '234567',
  'sube-besiktas': process.env.PIN_BESIKTAS || '345678',
  'sube-sisli': process.env.PIN_SISLI || '456789',
  'sube-uskudar': process.env.PIN_USKUDAR || '567890',
  'sube-bakirkoy': process.env.PIN_BAKIRKOY || '678901'
};

// Şube column mapping (Google Sheets columns)
const SUBE_COLUMNS = {
  'merkez': 'B',
  'sube-kadikoy': 'C',
  'sube-besiktas': 'D',
  'sube-sisli': 'E',
  'sube-uskudar': 'F',
  'sube-bakirkoy': 'G'
};

// Şube display names
const SUBE_NAMES = {
  'merkez': 'Merkez',
  'sube-kadikoy': 'Kadıköy',
  'sube-besiktas': 'Beşiktaş',
  'sube-sisli': 'Şişli',
  'sube-uskudar': 'Üsküdar',
  'sube-bakirkoy': 'Bakırköy'
};

// Google Sheets setup
let sheetsClient = null;
try {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  sheetsClient = google.sheets({ version: 'v4', auth });
  console.log('✅ Google Sheets API initialized');
} catch (error) {
  console.error('❌ Google Sheets API initialization failed:', error.message);
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'stok-api',
    features: {
      googleSheets: !!sheetsClient,
      openRouter: !!process.env.OPENROUTER_API_KEY
    }
  });
});

// Login endpoint
app.post('/webhook/login', (req, res) => {
  const { sube, pin } = req.body;

  console.log(`[LOGIN] Şube: ${sube}, PIN: ${pin}`);

  if (!sube || !pin) {
    return res.status(400).json({
      success: false,
      error: 'Şube ve PIN gereklidir'
    });
  }

  if (!PINS[sube]) {
    return res.status(401).json({
      success: false,
      error: 'Geçersiz şube'
    });
  }

  if (PINS[sube] !== pin) {
    return res.status(401).json({
      success: false,
      error: 'Hatalı PIN'
    });
  }

  const token = Buffer.from(JSON.stringify({
    sube: sube,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60)
  })).toString('base64');

  res.json({
    success: true,
    token: `stok.${token}.sig`,
    sube: sube,
    subeName: SUBE_NAMES[sube],
    expiresIn: '12h'
  });
});

// OpenRouter GPT ile metin analizi - CONTEXT AWARE
async function analyzeTextWithGPT(text) {
  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Sen bir stok yönetim asistanısın. Kullanıcının DEVAM EDEN konuşmasından ürün ve miktarları çıkar.

ÖNEMLİ - CONTEXT KURALLARI:
- Bu tek cümle DEĞİL, bir konuşmanın tamamıdır
- Kullanıcı aynı üründen farklı özelliklerle bahsederse (örn: "çuval patates" vs "file patates"), bunlar FARKLI ürünlerdir
- Ürün tanımlamasında birim/özellik önemlidir: "10 çuval patates" ile "5 file patates" AYRI ürünlerdir
- Tüm konuşmadaki BÜTÜN ürünleri çıkar ve döndür

Çıktı formatı JSON array: [{"urun": "Ürün Adı", "miktar": sayı, "birim": "birim", "action": "update"}]

Ürün isimlendirme:
- Ürün adlarını Title Case yap (Domates, Salatalık, vb.)
- Eğer özel birim/paketleme türü varsa, ürün adına EKLE:
  * "10 çuval patates" → {"urun": "Çuval Patates", "miktar": 10, "birim": "çuval"}
  * "5 file patates" → {"urun": "File Patates", "miktar": 5, "birim": "ad"}
  * "3 kasa domates" → {"urun": "Domates", "miktar": 3, "birim": "kasa"}

ÖNEMLİ - GEÇERSİZ ÜRÜNLER:
- "file", "çuval", "kasa", "paket", "deste" gibi kelimeler TEK BAŞINA ürün DEĞİLDİR
- Sadece "file 5 adet" veya "çuval 10" gibi anlamsız girdileri IGNORE et
- Mutlaka ürün adı olmalı: "file patates", "çuval domates" gibi
- Eğer ürün adı yoksa, o entry'yi JSON array'e EKLEME

Birim standartlaştırma:
- kilo/kilogram → kg
- adet/tane → ad
- litre → lt
- gram → gr
- kasa/kutu → kasa
- çuval/torba → çuval
- file → ad
- paket → paket
- deste → deste

Action belirleme:
- Normal ürün ekle/güncelle: {"action": "update"}
- "[ürün] iptal", "[ürün] sil": {"action": "delete"}

Örnekler:
"iki kasa domates" → [{"urun": "Domates", "miktar": 2, "birim": "kasa"}]
"10 çuval patates file patates 5 adet" → [{"urun": "Çuval Patates", "miktar": 10, "birim": "çuval"}, {"urun": "File Patates", "miktar": 5, "birim": "ad"}]
"domates 5 kilo limon 10 kasa patates 3 çuval" → [{"urun": "Domates", "miktar": 5, "birim": "kg"}, {"urun": "Limon", "miktar": 10, "birim": "kasa"}, {"urun": "Patates", "miktar": 3, "birim": "çuval"}]

- Sadece JSON array döndür, başka açıklama yapma
- Miktar belirtilmediyse 1 kabul et
- Birim belirtilmediyse "ad" kullan`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'Stok Yönetim Sistemi'
      }
    });

    const result = response.data.choices[0].message.content.trim();
    console.log('[GPT] Raw response:', result);

    // JSON parse et
    const products = JSON.parse(result);
    return products;
  } catch (error) {
    console.error('[GPT] Error:', error.response?.data || error.message);
    throw new Error('Metin analizi başarısız');
  }
}

// Google Sheets'e ürün yaz, güncelle veya sil
async function writeToSheets(sube, products) {
  if (!sheetsClient) {
    console.warn('[SHEETS] Google Sheets client not initialized, skipping write');
    return;
  }

  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const sheetName = process.env.GOOGLE_SHEET_NAME || 'Stok';

    // Mevcut verileri oku
    const readResponse = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:I`
    });

    const rows = readResponse.data.values || [];
    const header = rows[0] || [];
    const dataRows = rows.slice(1);

    const subeColumn = SUBE_COLUMNS[sube];
    const timestamp = new Date().toLocaleString('tr-TR');

    for (const product of products) {
      const { urun, miktar, birim, action = 'update' } = product;

      // Ürün var mı kontrol et
      let rowIndex = -1;
      for (let i = 0; i < dataRows.length; i++) {
        if (dataRows[i][0] && dataRows[i][0].toLowerCase() === urun.toLowerCase()) {
          rowIndex = i + 2; // +2 çünkü 1-indexed ve header var
          break;
        }
      }

      // Silme işlemi
      if (action === 'delete') {
        if (rowIndex > 0) {
          // Sadece o şubenin verisini temizle (satırı silme)
          await sheetsClient.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!${subeColumn}${rowIndex}`,
            valueInputOption: 'RAW',
            resource: { values: [['']] }
          });
          console.log(`[SHEETS] Deleted: ${urun} from ${SUBE_NAMES[sube]}`);
        } else {
          console.log(`[SHEETS] Skip delete: ${urun} not found`);
        }
        continue;
      }

      // Güncelleme veya ekleme
      if (rowIndex > 0) {
        // Güncelle
        const range = `${sheetName}!${subeColumn}${rowIndex}`;
        await sheetsClient.spreadsheets.values.update({
          spreadsheetId,
          range,
          valueInputOption: 'RAW',
          resource: { values: [[miktar]] }
        });

        // Birimi güncelle (H sütunu)
        await sheetsClient.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!H${rowIndex}`,
          valueInputOption: 'RAW',
          resource: { values: [[birim]] }
        });

        // Timestamp güncelle (I sütunu)
        await sheetsClient.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetName}!I${rowIndex}`,
          valueInputOption: 'RAW',
          resource: { values: [[timestamp]] }
        });

        console.log(`[SHEETS] Updated: ${urun} → ${miktar} ${birim} (row ${rowIndex})`);
      } else {
        // Yeni satır ekle
        const newRow = new Array(9).fill('');
        newRow[0] = urun; // A: Ürün
        newRow[SUBE_COLUMNS[sube].charCodeAt(0) - 65] = miktar; // Şube sütunu
        newRow[7] = birim; // H: Birim
        newRow[8] = timestamp; // I: Son Güncelleme

        await sheetsClient.spreadsheets.values.append({
          spreadsheetId,
          range: `${sheetName}!A:I`,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: { values: [newRow] }
        });

        console.log(`[SHEETS] Added new row: ${urun} → ${miktar} ${birim}`);
      }
    }
  } catch (error) {
    console.error('[SHEETS] Error:', error.message);
    throw new Error('Google Sheets yazma hatası');
  }
}

// Metin işleme endpoint (Web Speech API'den gelecek)
app.post('/webhook/process-text', async (req, res) => {
  const authHeader = req.headers.authorization;
  const { sube, text } = req.body;

  console.log(`[TEXT] Şube: ${sube}, Text: "${text}"`);

  // Validate token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token bulunamadı'
    });
  }

  if (!text || text.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Metin boş olamaz'
    });
  }

  try {
    // GPT ile analiz et
    const products = await analyzeTextWithGPT(text);

    if (!products || products.length === 0) {
      return res.json({
        success: false,
        error: 'Ürün bulunamadı. Lütfen "domates 5 kilo, salatalık 3 adet" formatında söyleyin.'
      });
    }

    // SADECE frontend'e döndür (Google Sheets'e YAZMA - quota aşımını önlemek için)
    // Sheets kaydı stopRecording() -> saveToGoogleSheets() -> /webhook/ses-kayit ile yapılacak

    res.json({
      success: true,
      message: `${products.length} ürün analiz edildi`,
      products: products,
      sube: SUBE_NAMES[sube],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[ERROR]', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Sunucu hatası'
    });
  }
});

// Ses kayıt endpoint (backward compatibility için)
app.post('/webhook/ses-kayit', upload.single('file'), async (req, res) => {
  const authHeader = req.headers.authorization;
  const sube = req.body.sube;
  const text = req.body.text; // Frontend'den metin gelirse

  console.log(`[RECORDING] Şube: ${sube}, Text: "${text}"`);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token bulunamadı'
    });
  }

  if (!text) {
    return res.status(400).json({
      success: false,
      error: 'Metin bulunamadı. Lütfen tarayıcınızın ses tanıma özelliğini kullanın.'
    });
  }

  try {
    const products = await analyzeTextWithGPT(text);

    if (!products || products.length === 0) {
      return res.json({
        success: false,
        error: 'Ürün bulunamadı'
      });
    }

    await writeToSheets(sube, products);

    res.json({
      success: true,
      message: `${products.length} ürün başarıyla kaydedildi`,
      products: products,
      sube: SUBE_NAMES[sube],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[ERROR]', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Sunucu hatası'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint bulunamadı',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Sunucu hatası'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Stok API running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: http://localhost:${PORT}/webhook/login`);
  console.log(`📝 Process Text: http://localhost:${PORT}/webhook/process-text`);
  console.log(`🎤 Recording: http://localhost:${PORT}/webhook/ses-kayit`);
  console.log('');
  console.log('🔧 Features:');
  console.log(`  - OpenRouter GPT: ${process.env.OPENROUTER_API_KEY ? '✅' : '❌'}`);
  console.log(`  - Google Sheets: ${sheetsClient ? '✅' : '❌'}`);
});
