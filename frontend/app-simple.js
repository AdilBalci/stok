// Configuration
const CONFIG = {
  API_URL: window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://YOUR-API-URL',
};

// State
let recognition = null;
let isListening = false;
let currentSube = '';
let liveProducts = new Map(); // urun -> {urun, miktar, birim}
let allText = '';
let processTimer = null; // Timer for processing with batch/debounce
let lastProcessedText = ''; // Track what we've already processed

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const recordingScreen = document.getElementById('recording-screen');
const subeSelect = document.getElementById('sube-select');
const pinInput = document.getElementById('pin-input');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const micBtn = document.getElementById('mic-btn');
const statusText = document.getElementById('status');
const liveProductsDiv = document.getElementById('live-products');
const logoutBtn = document.getElementById('logout-btn');
const subeName = document.getElementById('sube-name');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Stok Yönetim Sistemi başlatılıyor...');
  checkAuth();
  setupEventListeners();
  checkSpeechRecognition();
});

function setupEventListeners() {
  loginBtn.addEventListener('click', handleLogin);
  micBtn.addEventListener('click', toggleRecording);
  logoutBtn.addEventListener('click', logout);

  pinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  pinInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  });
}

// Check Speech Recognition Support
function checkSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.error('❌ Web Speech API desteklenmiyor');
    alert('Tarayıcınız ses tanıma özelliğini desteklemiyor. Lütfen Chrome veya Edge kullanın.');
  } else {
    console.log('✅ Web Speech API destekleniyor');
  }
}

// Authentication
function checkAuth() {
  const token = localStorage.getItem('auth_token');
  const sube = localStorage.getItem('sube');

  if (token && sube) {
    currentSube = sube;
    showRecordingScreen();
  }
}

async function handleLogin() {
  const sube = subeSelect.value;
  const pin = pinInput.value.trim();

  if (!sube) {
    showError('Lütfen bir şube seçin');
    return;
  }

  if (!pin || pin.length !== 6) {
    showError('PIN 6 haneli olmalıdır');
    return;
  }

  try {
    loginBtn.disabled = true;
    loginBtn.textContent = 'Giriş yapılıyor...';

    const response = await fetch(`${CONFIG.API_URL}/webhook/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sube, pin })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Giriş başarısız');
    }

    const data = await response.json();

    if (!data.success || !data.token) {
      throw new Error('Geçersiz yanıt formatı');
    }

    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('sube', sube);
    currentSube = sube;

    console.log('✅ Giriş başarılı:', sube);
    showRecordingScreen();

  } catch (error) {
    console.error('❌ Giriş hatası:', error);
    showError('Giriş başarısız. Şube ve PIN kontrolü yapın.');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Giriş Yap';
  }
}

function showError(message) {
  loginError.textContent = message;
  loginError.style.display = 'block';
  setTimeout(() => {
    loginError.textContent = '';
    loginError.style.display = 'none';
  }, 4000);
}

function showRecordingScreen() {
  loginScreen.classList.add('hidden');
  recordingScreen.classList.remove('hidden');

  const subeNames = {
    'merkez': 'Merkez Şube',
    'sube-kadikoy': 'Kadıköy Şubesi',
    'sube-besiktas': 'Beşiktaş Şubesi',
    'sube-sisli': 'Şişli Şubesi',
    'sube-uskudar': 'Üsküdar Şubesi',
    'sube-bakirkoy': 'Bakırköy Şubesi'
  };

  subeName.textContent = subeNames[currentSube] || currentSube;
}

function logout() {
  if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('sube');
    currentSube = '';
    liveProducts.clear();
    allText = '';

    recordingScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');

    pinInput.value = '';
    subeSelect.value = '';

    console.log('👋 Çıkış yapıldı');
  }
}

// Main Recording Logic
function toggleRecording() {
  if (isListening) {
    stopRecording();
  } else {
    startRecording();
  }
}

function startRecording() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    updateStatus('❌ Tarayıcınız ses tanıma özelliğini desteklemiyor');
    return;
  }

  console.log('🎤 Dinleme başlatılıyor...');

  recognition = new SpeechRecognition();
  recognition.lang = 'tr-TR';
  recognition.continuous = true;
  recognition.interimResults = true;

  let finalTranscript = '';

  recognition.onstart = () => {
    console.log('🔴 Dinleme başladı');
    isListening = true;
    micBtn.classList.add('listening');
    updateStatus('🔴 Dinliyorum... Konuşun, ürünler aşağıda belirecek');
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
        console.log('✅ Final metin:', transcript);
      } else {
        interimTranscript += transcript;
      }
    }

    // Tüm metni birleştir
    allText = finalTranscript + interimTranscript;

    // REAL-TIME: Konuşurken metni göster
    updateStatus(`🎤 "${allText.trim()}"`);

    // Önceki timer'ı iptal et
    if (processTimer) {
      clearTimeout(processTimer);
    }

    // 200ms sessizlik bekle, sonra tüm context'i işle (ÇOK HIZLI)
    processTimer = setTimeout(() => {
      const textToProcess = allText.trim();

      // Sadece yeni metin varsa işle
      if (textToProcess.length > 0 && textToProcess !== lastProcessedText) {
        console.log('📤 Context ile işleniyor:', textToProcess);
        lastProcessedText = textToProcess;
        processTextWithContext(textToProcess);
      }

      processTimer = null;
    }, 200); // 200ms debounce - ultra hızlı
  };

  recognition.onerror = (event) => {
    console.error('❌ Ses tanıma hatası:', event.error);

    if (event.error === 'no-speech') {
      console.log('⚠️ Ses algılanamadı, devam ediliyor...');
      // Hata vermeden devam et
    } else if (event.error === 'not-allowed') {
      updateStatus('❌ Mikrofon izni reddedildi');
      stopRecording();
    } else {
      console.error('Hata:', event.error);
    }
  };

  recognition.onend = () => {
    console.log('⏹️ Dinleme bitti');

    // Eğer hala listening modundaysak, yeniden başlat (continuous)
    if (isListening) {
      console.log('🔄 Yeniden başlatılıyor...');
      recognition.start();
    }
  };

  recognition.start();
}

function stopRecording() {
  console.log('⏹️ Durduruldu');
  isListening = false;
  micBtn.classList.remove('listening');

  // Timer'ı temizle
  if (processTimer) {
    clearTimeout(processTimer);
    processTimer = null;
  }

  if (recognition) {
    recognition.stop();
    recognition = null;
  }

  // Final save to Google Sheets
  if (liveProducts.size > 0) {
    updateStatus('⏳ Google Sheets\'e kaydediliyor...');
    saveToGoogleSheets();
  } else {
    updateStatus('Başlamak için mikrofona dokunun');
  }

  // Reset processed text tracking
  lastProcessedText = '';
}

// Process text with GPT - WITH FULL CONTEXT
async function processTextWithContext(text) {
  if (!text || text.trim().length === 0) return;

  console.log('📤 GPT ile analiz ediliyor (Context dahil):', text);

  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${CONFIG.API_URL}/webhook/process-text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sube: currentSube,
        text: text, // Tüm conversation context
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('❌ API hatası:', response.status);
      return;
    }

    const result = await response.json();
    console.log('✅ GPT sonucu:', result);

    if (result.success && result.products && result.products.length > 0) {
      updateLiveProducts(result.products);
    }

  } catch (error) {
    console.error('❌ İşleme hatası:', error);
  }
}

// Update live products display
function updateLiveProducts(products) {
  products.forEach(product => {
    const { urun, miktar, birim, action = 'update' } = product;

    if (action === 'delete') {
      liveProducts.delete(urun.toLowerCase());
      console.log(`🗑️ Silindi: ${urun}`);
    } else {
      liveProducts.set(urun.toLowerCase(), { urun, miktar, birim });
      console.log(`✅ Güncellendi: ${urun} ${miktar} ${birim}`);
    }
  });

  renderLiveProducts();
}

function renderLiveProducts() {
  if (liveProducts.size === 0) {
    liveProductsDiv.innerHTML = '<div class="empty-state">Ürünler burada görünecek...</div>';
    return;
  }

  const html = Array.from(liveProducts.values())
    .map(product => `
      <div class="product-item">
        ${escapeHtml(product.urun)} - ${product.miktar} ${escapeHtml(product.birim)}
      </div>
    `)
    .join('');

  liveProductsDiv.innerHTML = html;
}

// Save all products to Google Sheets
async function saveToGoogleSheets() {
  if (liveProducts.size === 0) {
    updateStatus('Kaydedilecek ürün yok');
    return;
  }

  try {
    const token = localStorage.getItem('auth_token');
    const productsArray = Array.from(liveProducts.values());

    // Her ürün için Google Sheets'e kaydet
    const text = productsArray
      .map(p => `${p.urun} ${p.miktar} ${p.birim}`)
      .join(', ');

    const response = await fetch(`${CONFIG.API_URL}/webhook/ses-kayit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sube: currentSube,
        text: text,
        timestamp: new Date().toISOString()
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Google Sheets\'e kaydedildi:', result);

      updateStatus(`✅ ${liveProducts.size} ürün başarıyla kaydedildi!`);

      // 3 saniye sonra reset
      setTimeout(() => {
        liveProducts.clear();
        allText = '';
        lastProcessedText = '';
        renderLiveProducts();
        updateStatus('Başlamak için mikrofona dokunun');
      }, 3000);
    } else {
      throw new Error('Kaydetme başarısız');
    }

  } catch (error) {
    console.error('❌ Kaydetme hatası:', error);
    updateStatus('❌ Kaydetme başarısız. Lütfen tekrar deneyin.');
  }
}

function updateStatus(message) {
  statusText.textContent = message;
  console.log('📢', message);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

console.log('✅ Uygulama hazır');
