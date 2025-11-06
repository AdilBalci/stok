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
let liveProducts = new Map();

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const recordingScreen = document.getElementById('recording-screen');
const subeSelect = document.getElementById('sube-select');
const pinInput = document.getElementById('pin-input');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const recordBtn = document.getElementById('record-btn');
const stopBtn = document.getElementById('stop-btn');
const timerDisplay = document.getElementById('timer');
const statusDisplay = document.getElementById('status');
const resultsDiv = document.getElementById('results');
const resultsList = document.getElementById('results-list');
const newRecordBtn = document.getElementById('new-record-btn');
const logoutBtn = document.getElementById('logout-btn');
const subeName = document.getElementById('sube-name');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Stok Yönetim Sistemi - Speech Recognition');
  checkAuth();
  setupEventListeners();
  checkSpeechRecognition();
});

function setupEventListeners() {
  loginBtn.addEventListener('click', handleLogin);
  recordBtn.addEventListener('click', startRecording);
  stopBtn.addEventListener('click', stopRecording);
  newRecordBtn.addEventListener('click', resetRecording);
  logoutBtn.addEventListener('click', logout);

  pinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  pinInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  });
}

function checkSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.error('❌ Speech Recognition desteklenmiyor');
    alert('Tarayıcınız ses tanıma özelliğini desteklemiyor. Lütfen Chrome veya Edge kullanın.');
  } else {
    console.log('✅ Speech Recognition hazır');
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

    recordingScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');

    pinInput.value = '';
    subeSelect.value = '';

    console.log('👋 Çıkış yapıldı');
  }
}

// Speech Recognition
function startRecording() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    updateStatus('❌ Tarayıcınız ses tanıma özelliğini desteklemiyor', 'error');
    return;
  }

  console.log('🎤 Dinleme başlatılıyor...');

  recognition = new SpeechRecognition();
  recognition.lang = 'tr-TR';
  recognition.continuous = true;
  recognition.interimResults = false;

  recognition.onstart = () => {
    console.log('🔴 Dinleme başladı');
    isListening = true;
    recordBtn.disabled = true;
    stopBtn.disabled = false;
    updateStatus('🔴 Kayıt ediliyor... Konuşmaya başlayın', 'recording');
  };

  recognition.onresult = async (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        const transcript = event.results[i][0].transcript;
        console.log('✅ Final:', transcript);

        // Her cümleyi hemen gönder
        await processText(transcript);
      }
    }
  };

  recognition.onerror = (event) => {
    console.error('❌ Ses tanıma hatası:', event.error);
    if (event.error === 'not-allowed') {
      updateStatus('❌ Mikrofon izni reddedildi', 'error');
      stopRecording();
    }
  };

  recognition.onend = () => {
    console.log('⏹️ Dinleme bitti');
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
  recordBtn.disabled = false;
  stopBtn.disabled = true;

  if (recognition) {
    recognition.stop();
    recognition = null;
  }

  // Sonuçları göster
  if (liveProducts.size > 0) {
    showResults(Array.from(liveProducts.values()));
  } else {
    updateStatus('', '');
  }
}

// Process text with GPT
async function processText(text) {
  if (!text || text.trim().length === 0) return;

  console.log('📤 Metdefin işleniyor:', text);

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
        text: text
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
}

function showResults(products) {
  console.log('✅ Ürünler:', products.length);

  updateStatus(`✅ ${products.length} ürün kaydedildi!`, 'success');

  resultsList.innerHTML = products.map(p => `
    <div class="result-item">
      <span class="product-name">${escapeHtml(p.urun)}</span>
      <span class="product-quantity">${p.miktar} ${escapeHtml(p.birim)}</span>
    </div>
  `).join('');

  resultsDiv.classList.remove('hidden');
  document.querySelector('.record-section').style.display = 'none';
}

function resetRecording() {
  resultsDiv.classList.add('hidden');
  document.querySelector('.record-section').style.display = 'block';
  timerDisplay.textContent = '00:00';
  updateStatus('', '');
  liveProducts.clear();

  console.log('🔄 Yeni kayıt için hazır');
}

function updateStatus(message, type) {
  statusDisplay.textContent = message;
  statusDisplay.className = `status ${type}`;

  if (message) {
    console.log('📢', message);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

console.log('✅ Uygulama hazır (Speech Recognition)');
