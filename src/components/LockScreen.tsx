import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, ArrowRight, User } from 'lucide-react';

interface LockScreenProps {
  username: string;
  password?: string;
  wallpaper: string;
  language?: 'ja' | 'en';
  timezone?: string;
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  username,
  password = '',
  wallpaper,
  language = 'ja',
  timezone = 'Asia/Tokyo',
  onUnlock,
}) => {
  const [inputPassword, setInputPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [time, setTime] = useState(new Date());
  const [isPromptVisible, setIsPromptVisible] = useState(!password); // If no password required, prompt is shown immediately

  const isJa = language === 'ja';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || inputPassword === password) {
      setErrorMsg('');
      onUnlock();
    } else {
      setErrorMsg(isJa ? 'パスワードが正しくありません。' : 'Incorrect password. Try again.');
      setInputPassword('');
    }
  };

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  });

  const formattedDate = time.toLocaleDateString(isJa ? 'ja-JP' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: timezone,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[999990] flex flex-col justify-between p-8 sm:p-12 font-sans select-none overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${wallpaper})` }}
      onClick={() => {
        if (!isPromptVisible) setIsPromptVisible(true);
      }}
      id="webos-lock-screen"
    >
      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Top Left Clock Display (Windows 10 Lock Screen Style) */}
      <div className="relative z-10 text-white space-y-1 drop-shadow-md cursor-pointer">
        <h1 className="text-6xl sm:text-8xl font-light tracking-tight">{formattedTime}</h1>
        <p className="text-lg sm:text-2xl font-normal opacity-90">{formattedDate}</p>
      </div>

      {/* Center Lock / Password Entry Prompt */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center text-white">
        {!isPromptVisible ? (
          <div className="animate-bounce flex flex-col items-center gap-2 cursor-pointer opacity-80 hover:opacity-100">
            <Lock className="w-8 h-8" />
            <p className="text-sm font-semibold tracking-wider">
              {isJa ? 'クリックしてサインイン' : 'Click to Sign In'}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center max-w-sm w-full p-6 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 shadow-2xl space-y-4"
          >
            {/* User Avatar Circle */}
            <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-3xl shadow-lg border-2 border-white/20">
              <User className="w-10 h-10" />
            </div>

            <h2 className="text-lg font-bold tracking-wide">{username || (isJa ? 'ユーザー' : 'User')}</h2>

            {password ? (
              <form onSubmit={handleUnlockSubmit} className="w-full space-y-3">
                <div className="relative flex items-center">
                  <input
                    type="password"
                    placeholder={isJa ? 'パスワードを入力' : 'Enter Password'}
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-xs outline-none focus:border-blue-400 focus:bg-white/20 transition-all"
                    id="lockscreen-input-password"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {errorMsg && (
                  <p className="text-[11px] text-rose-300 font-semibold text-center animate-shake">
                    {errorMsg}
                  </p>
                )}
              </form>
            ) : (
              <button
                onClick={onUnlock}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-2"
                id="lockscreen-btn-signin"
              >
                <span>{isJa ? 'サインイン' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Bottom Status */}
      <div className="relative z-10 text-white/60 text-xs text-center font-medium">
        Abord OS &bull; {isJa ? '保護されたログインセッション' : 'Protected Login Session'}
      </div>
    </motion.div>
  );
};
