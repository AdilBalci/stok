'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Power } from 'lucide-react';

interface RecordingScreenProps {
  userBranch: string;
  onLogout: () => void;
}

export default function RecordingScreen({ userBranch, onLogout }: RecordingScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [statusText, setStatusText] = useState('Konuşmaya başlamak için dokunun');

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    setStatusText(isRecording ? 'Konuşmaya başlamak için dokunun' : 'Dinliyorum...');
    // In a real app, you would start/stop the microphone recording here.
  };

  return (
    <div className="w-full max-w-2xl h-[70vh] flex flex-col items-center justify-between p-8 bg-gray-800 rounded-2xl shadow-lg">
      <header className="w-full flex justify-between items-center">
        <div className="text-lg">
          Şube: <span className="font-bold text-purple-400">{userBranch}</span>
        </div>
        <button onClick={onLogout} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <Power size={24} />
        </button>
      </header>

      <div className="flex flex-col items-center justify-center flex-grow space-y-6">
        <p className="text-xl text-gray-300 h-8">{statusText}</p>

        {/* Animated Recording Button */}
        <motion.button
          onClick={toggleRecording}
          className="relative w-48 h-48 rounded-full bg-purple-600 flex items-center justify-center focus:outline-none"
          animate={{ scale: isRecording ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {isRecording && (
            <motion.div
              className="absolute inset-0 rounded-full bg-purple-500 opacity-75"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.75, 0, 0.75],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          )}
          <Mic size={64} color="white" />
        </motion.button>
      </div>

      <div className="w-full h-24 bg-gray-700 rounded-lg p-4">
        <p className="text-gray-400">Tanınan ürünler burada görünecek...</p>
      </div>
    </div>
  );
}
