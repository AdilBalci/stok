// Configuration
const CONFIG = {
  N8N_WEBHOOK_URL: window.location.hostname === 'localhost'
    ? 'http://localhost:3001/webhook/ses-kayit'  // Mock API
    : 'https://YOUR-N8N-URL/webhook/ses-kayit',
  LOGIN_WEBHOOK_URL: window.location.hostname === 'localhost'
    ? 'http://localhost:3001/webhook/login'  // Mock API
    : 'https://YOUR-N8N-URL/webhook/login',
  MAX_RECORDING_TIME: 180000, // 3 dakika (ms)
};

// State
let mediaRecorder = null;
let audioChunks = [];
let recordingTimer = null;
let recordingStartTime = 0;
let currentSube = '';

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
  console.log('🚀 Stok Yönetim Sistemi başlatılıyor...');
  checkAuth();
  setupEventListeners();
  checkMicrophonePermission();
});

function setupEventListeners() {
  loginBtn.addEventListener('click', handleLogin);
  recordBtn.addEventListener('click', startRecording);
  stopBtn.addEventListener('click', stopRecording);
  newRecordBtn.addEventListener('click', resetRecording);
  logoutBtn.addEventListener('click', logout);

  // Enter key for login
  pinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });

  // Only allow numbers in PIN input
  pinInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  });
}

// Authentication Functions
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

  // Validation
  if (!sube) {
    showError('Lütfen bir şube seçin');
    return;
  }

  if (!pin) {
    showError('Lütfen PIN kodunuzu girin');
    return;
  }

  if (pin.length !== 6) {
    showError('PIN 6 haneli olmalıdır');
    return;
  }

  try {
    loginBtn.disabled = true;
    loginBtn.textContent = 'Giriş yapılıyor...';

    const response = await fetch(CONFIG.LOGIN_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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

    // Save credentials
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

  // Display sube name
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

    recordingScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');

    // Reset form
    pinInput.value = '';
    subeSelect.value = '';
    resetRecording();

    console.log('👋 Çıkış yapıldı');
  }
}

// Microphone Permission Check
async function checkMicrophonePermission() {
  try {
    const result = await navigator.permissions.query({ name: 'microphone' });
    console.log('🎤 Mikrofon izni:', result.state);

    result.addEventListener('change', () => {
      console.log('🎤 Mikrofon izni değişti:', result.state);
    });
  } catch (error) {
    console.log('⚠️ Permission API desteklenmiyor');
  }
}

// Recording Functions
async function startRecording() {
  try {
    console.log('🎤 Mikrofon erişimi isteniyor...');

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100,
        channelCount: 1
      }
    });

    console.log('✅ Mikrofon erişimi sağlandı');

    // Determine best supported MIME type
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus'
    ];

    let mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

    if (!mimeType) {
      throw new Error('Tarayıcınız ses kaydını desteklemiyor');
    }

    console.log('📝 Kullanılan format:', mimeType);

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: mimeType,
      audioBitsPerSecond: 128000
    });

    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
        console.log('📦 Veri parçası alındı:', event.data.size, 'bytes');
      }
    };

    mediaRecorder.onstop = () => {
      console.log('⏹️ Kayıt durduruldu');
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('🔇 Mikrofon kapatıldı');
      });
      processRecording();
    };

    mediaRecorder.onerror = (event) => {
      console.error('❌ Kayıt hatası:', event.error);
      updateStatus('❌ Kayıt sırasında hata oluştu', 'error');
      stopRecording();
    };

    mediaRecorder.start(1000); // Collect data every second
    recordingStartTime = Date.now();

    console.log('🔴 Kayıt başladı');

    // UI updates
    recordBtn.disabled = true;
    stopBtn.disabled = false;
    updateStatus('🔴 Kayıt ediliyor... Konuşmaya başlayın', 'recording');
    startTimer();

    // Auto-stop after max time
    setTimeout(() => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        console.log('⏱️ Maksimum süre doldu, otomatik durduruluyor');
        stopRecording();
      }
    }, CONFIG.MAX_RECORDING_TIME);

  } catch (error) {
    console.error('❌ Mikrofon hatası:', error);

    if (error.name === 'NotAllowedError') {
      updateStatus('❌ Mikrofon izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.', 'error');
    } else if (error.name === 'NotFoundError') {
      updateStatus('❌ Mikrofon bulunamadı. Lütfen cihazınızın mikrofonunu kontrol edin.', 'error');
    } else {
      updateStatus('❌ Mikrofon erişimi başarısız: ' + error.message, 'error');
    }
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    stopTimer();
    recordBtn.disabled = false;
    stopBtn.disabled = true;
    updateStatus('⏳ İşleniyor... Lütfen bekleyin', 'processing');
  }
}

function startTimer() {
  recordingTimer = setInterval(() => {
    const elapsed = Date.now() - recordingStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    timerDisplay.textContent =
      `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, 100);
}

function stopTimer() {
  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }
}

async function processRecording() {
  console.log('🔄 Kayıt işleniyor...');
  console.log('📦 Toplam parça sayısı:', audioChunks.length);

  if (audioChunks.length === 0) {
    updateStatus('❌ Ses kaydı alınamadı', 'error');
    return;
  }

  const audioBlob = new Blob(audioChunks, {
    type: audioChunks[0].type
  });

  console.log('📁 Ses dosyası boyutu:', (audioBlob.size / 1024).toFixed(2), 'KB');
  console.log('📝 Ses dosyası tipi:', audioBlob.type);

  // Check file size (max 25MB for OpenAI Whisper)
  if (audioBlob.size > 25 * 1024 * 1024) {
    updateStatus('❌ Ses dosyası çok büyük (max 25MB)', 'error');
    return;
  }

  if (audioBlob.size < 1000) {
    updateStatus('❌ Ses kaydı çok kısa. Lütfen tekrar deneyin.', 'error');
    return;
  }

  await sendToN8n(audioBlob);
}

async function sendToN8n(audioBlob) {
  const formData = new FormData();
  const extension = audioBlob.type.includes('webm') ? 'webm' :
                   audioBlob.type.includes('mp4') ? 'mp4' : 'ogg';

  formData.append('file', audioBlob, `recording.${extension}`);
  formData.append('sube', currentSube);
  formData.append('timestamp', new Date().toISOString());

  const token = localStorage.getItem('auth_token');

  console.log('📤 Sunucuya gönderiliyor...');
  console.log('🔑 Token var:', !!token);
  console.log('🏪 Şube:', currentSube);

  try {
    const response = await fetch(CONFIG.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    console.log('📥 Sunucu yanıtı:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Sunucu hatası:', errorText);
      throw new Error(`Sunucu hatası: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Sonuç:', result);

    if (result.success && result.products && result.products.length > 0) {
      showResults(result.products);
    } else if (result.success && result.products && result.products.length === 0) {
      updateStatus('⚠️ Metinde ürün bilgisi bulunamadı. Lütfen tekrar deneyin.', 'error');
    } else {
      throw new Error(result.error || 'İşlem başarısız');
    }

  } catch (error) {
    console.error('❌ Gönderim hatası:', error);

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      updateStatus('❌ Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.', 'error');
    } else {
      updateStatus('❌ Gönderim başarısız: ' + error.message, 'error');
    }
  }
}

function showResults(products) {
  console.log('✅ Başarılı! Ürün sayısı:', products.length);

  updateStatus(`✅ ${products.length} ürün başarıyla kaydedildi!`, 'success');

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
  audioChunks = [];

  console.log('🔄 Yeni kayıt için hazır');
}

function updateStatus(message, type) {
  statusDisplay.textContent = message;
  statusDisplay.className = `status ${type}`;

  if (message) {
    console.log('📢 Durum:', message);
  }
}

// Utility Functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Service Worker Registration (for PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker kaydedildi:', registration.scope);
      })
      .catch(error => {
        console.log('❌ Service Worker kaydı başarısız:', error);
      });
  });
}

// PWA Install Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('💾 PWA kurulum istemi hazır');
});

window.addEventListener('appinstalled', () => {
  console.log('✅ PWA kuruldu');
  deferredPrompt = null;
});

// Handle online/offline status
window.addEventListener('online', () => {
  console.log('🌐 İnternet bağlantısı sağlandı');
  updateStatus('🌐 Bağlantı sağlandı', 'success');
  setTimeout(() => updateStatus('', ''), 2000);
});

window.addEventListener('offline', () => {
  console.log('📡 İnternet bağlantısı kesildi');
  updateStatus('📡 İnternet bağlantısı yok', 'error');
});

console.log('✅ Uygulama hazır');
