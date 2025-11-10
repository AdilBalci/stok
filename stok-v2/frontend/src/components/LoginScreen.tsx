'use client';

import { useState } from 'react';

interface LoginScreenProps {
  onLoginSuccess: (branch: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [branch, setBranch] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!branch || pin.length !== 6) {
      setError('Lütfen şube seçin ve 6 haneli PIN girin.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // API call to the mock backend
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sube: branch, pin }),
      });

      const data = await response.json();

      if (data.success) {
        onLoginSuccess(branch);
      } else {
        setError(data.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      setError('Bir sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-white">Giriş Yap</h2>

      <div className="space-y-4">
        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="w-full px-4 py-3 text-lg bg-gray-700 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Şube Seçin...</option>
          <option value="merkez">Merkez Şube</option>
          <option value="kadikoy">Kadıköy</option>
          <option value="besiktas">Beşiktaş</option>
        </select>

        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          maxLength={6}
          placeholder="PIN Kodu"
          className="w-full px-4 py-3 text-lg tracking-widest text-center bg-gray-700 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          inputMode="numeric"
        />
      </div>

      {error && <p className="text-red-400 text-center">{error}</p>}

      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="w-full px-4 py-3 text-lg font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-500 transition-colors duration-300"
      >
        {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
      </button>
    </div>
  );
}
