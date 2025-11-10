'use client';

import { useState } from 'react';
import LoginScreen from '@/components/LoginScreen';
import RecordingScreen from '@/components/RecordingScreen';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userBranch, setUserBranch] = useState('');

  const handleLoginSuccess = (branch: string) => {
    setUserBranch(branch);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // In a real app, you would also clear any stored tokens
    setIsAuthenticated(false);
    setUserBranch('');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4">
      {isAuthenticated ? (
        <RecordingScreen userBranch={userBranch} onLogout={handleLogout} />
      ) : (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
    </main>
  );
}
