import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Mic, Accessibility } from 'lucide-react';

interface BootScreenProps {
  onComplete: () => void;
  isReboot?: boolean;
}

export const playStartupChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.3);
    masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.8);
    masterGain.connect(ctx.destination);

    const padNotes = [103.83, 155.56, 261.63, 311.13];
    padNotes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 3.8);
    });

    const chimes = [311.13, 415.30, 466.16, 622.25];
    const delays = [0.4, 0.7, 1.0, 1.3];

    chimes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delays[idx]);
      gain.gain.setValueAtTime(0, ctx.currentTime + delays[idx]);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + delays[idx] + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delays[idx] + 1.6);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(ctx.currentTime + delays[idx]);
      osc.stop(ctx.currentTime + delays[idx] + 1.8);
    });
  } catch (e) {
    console.error('Web Audio startup chime failed:', e);
  }
};

export const BootScreen: React.FC<BootScreenProps> = ({ onComplete, isReboot = false }) => {
  const [msgIndex, setMsgIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  const messages = isReboot
    ? [
        '再起動しています...',
        'システム構成を準備中...',
        'デスクトップを再読み込みしています...',
        'まもなく完了します',
      ]
    : [
        '準備しています...',
        'デスクトップ環境を構成しています...',
        '設定とストレージを適用中...',
        'ようこそ',
      ];

  useEffect(() => {
    playStartupChime();

    const msgTimer = setInterval(() => {
      setMsgIndex((prev) => {
        if (prev < messages.length - 1) return prev + 1;
        return prev;
      });
    }, 900);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 3;
      });
    }, 90);

    const finishTimer = setTimeout(() => {
      onComplete();
    }, 3600);

    return () => {
      clearInterval(msgTimer);
      clearInterval(progressTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px)' }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-[999999] bg-[#004b87] text-white flex flex-col justify-between select-none font-sans overflow-hidden"
      id="webos-boot-screen"
    >
      {/* Top Header Bar matching OOBE */}
      <div className="w-full bg-[#003763] h-10 flex items-center justify-center border-b border-black/20 px-4">
        <div className="flex items-center gap-8 text-xs font-medium tracking-wide">
          <span className="text-white font-semibold">
            {isReboot ? 'システム再起動' : 'システム起動'}
          </span>
          <span className="text-white/40 text-[11px]">Abord2027.2 Web OS</span>
        </div>
      </div>

      {/* Main Center Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col justify-center items-center text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-light tracking-wide text-white">
            welcome to Abord2027.2 web os
          </h1>
          <p className="text-sm text-sky-100/80">
            {isReboot ? 'Abord OS を再起動しています' : 'Abord OS デスクトップ環境を開始しています'}
          </p>
        </div>

        {/* Clean Circular Loading Ring Spinner with EMPTY center (No icons inside) */}
        <div className="relative w-20 h-20 flex items-center justify-center my-2">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          {/* Animated Spinner Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-4 border-sky-300 border-t-transparent shadow-md shadow-sky-300/40"
          />
        </div>

        {/* Dynamic Narrator Status Text */}
        <div className="h-10 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(3px)' }}
              transition={{ duration: 0.3 }}
              className="text-lg sm:text-xl font-light tracking-wide text-sky-100"
            >
              {messages[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress Fill Bar */}
        <div className="w-full max-w-xs bg-[#003866] h-1.5 rounded-full overflow-hidden border border-white/20 p-0.5">
          <motion.div
            className="bg-white h-full rounded-full transition-all duration-100 ease-out shadow-xs shadow-white/50"
            style={{ width: `${progress}%` }}
          />
        </div>
      </main>

      {/* Bottom Windows / Abord Narrator Status Bar */}
      <footer className="w-full bg-[#111111] text-gray-300 text-xs py-2.5 px-6 flex items-center justify-between border-t border-white/10">
        <div className="flex items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
          <div className="flex items-center gap-2 text-sky-400 shrink-0">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span className="font-semibold text-white">ナレーション:</span>
          </div>
          <span className="text-gray-300 font-mono text-[11px] truncate">
            {messages[msgIndex]}
          </span>
        </div>
        <div className="flex items-center gap-4 text-gray-400 text-xs shrink-0">
          <Accessibility className="w-4 h-4 cursor-pointer hover:text-white" />
          <Mic className="w-4 h-4 cursor-pointer hover:text-white" />
          <Volume2 className="w-4 h-4 cursor-pointer hover:text-white" />
        </div>
      </footer>
    </motion.div>
  );
};
