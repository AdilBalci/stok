const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Stok v2 Backend is running!');
});

/**
 * Login Endpoint
 * Authenticates the user based on sube (branch) and pin.
 * In a real application, you would check this against a database.
 */
app.post('/api/login', (req, res) => {
  const { sube, pin } = req.body;

  console.log(`Login attempt for sube: ${sube} with pin: ${pin}`);

  // Mock validation: any 6-digit pin is accepted for now
  if (sube && pin && pin.length === 6) {
    res.json({
      success: true,
      message: 'Login successful',
      token: 'fake-jwt-token-for-testing', // Send a fake JWT token
      sube: sube,
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid sube or pin',
    });
  }
});

/**
 * Process Audio Endpoint
 * Simulates processing audio and returning a list of products.
 */
app.post('/api/process-audio', (req, res) => {
  // In a real app, you would handle file uploads (e.g., with multer)
  // and then send the audio to a speech-to-text service like OpenAI Whisper.
  // Here, we'll just return a mock response.

  console.log('Received audio processing request.');

  // Mock product list that simulates the output of a voice command like
  // "Domates 10 kilo, 5 kilo salatalık ve 20 adet de yumurta"
  const mockProducts = [
    { id: 1, urun: 'Domates', miktar: 10, birim: 'kg' },
    { id: 2, urun: 'Salatalık', miktar: 5, birim: 'kg' },
    { id: 3, urun: 'Yumurta', miktar: 20, birim: 'adet' },
  ];

  res.json({
    success: true,
    products: mockProducts,
  });
});


app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
