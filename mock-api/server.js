const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

// Mock PIN database
const PINS = {
  'merkez': '123456',
  'sube-kadikoy': '234567',
  'sube-besiktas': '345678',
  'sube-sisli': '456789',
  'sube-uskudar': '567890',
  'sube-bakirkoy': '678901'
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'mock-api'
  });
});

// Login endpoint
app.post('/webhook/login', (req, res) => {
  const { sube, pin } = req.body;

  console.log(`[LOGIN] Sube: ${sube}, PIN: ${pin}`);

  // Validate
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

  // Generate mock JWT
  const mockToken = Buffer.from(JSON.stringify({
    sube: sube,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60)
  })).toString('base64');

  res.json({
    success: true,
    token: `mock.${mockToken}.signature`,
    sube: sube,
    expiresIn: '12h'
  });
});

// Voice recording endpoint
app.post('/webhook/ses-kayit', upload.single('file'), (req, res) => {
  const authHeader = req.headers.authorization;
  const sube = req.body.sube;
  const file = req.file;

  console.log(`[RECORDING] Sube: ${sube}, File: ${file ? file.size + ' bytes' : 'none'}`);

  // Validate token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token bulunamadı'
    });
  }

  // Validate file
  if (!file) {
    return res.status(400).json({
      success: false,
      error: 'Ses dosyası bulunamadı'
    });
  }

  // Simulate processing delay
  setTimeout(() => {
    // Mock product extraction
    const mockProducts = [
      { urun: 'Domates', miktar: 50, birim: 'kg' },
      { urun: 'Salatalık', miktar: 30, birim: 'kg' },
      { urun: 'Patlıcan', miktar: 20, birim: 'ad' }
    ];

    console.log(`[SUCCESS] Extracted ${mockProducts.length} products`);

    res.json({
      success: true,
      message: `${mockProducts.length} ürün başarıyla kaydedildi`,
      products: mockProducts,
      timestamp: new Date().toISOString(),
      note: 'Mock API - Gerçek AI işleme yapılmadı'
    });
  }, 2000); // 2 saniye simüle edilmiş gecikme
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
  console.log(`🚀 Mock API server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: http://localhost:${PORT}/webhook/login`);
  console.log(`🎤 Recording: http://localhost:${PORT}/webhook/ses-kayit`);
});
