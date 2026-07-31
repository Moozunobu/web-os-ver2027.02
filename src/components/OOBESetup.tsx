import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  Mic,
  Accessibility,
  Check,
  ChevronRight,
  ShieldCheck,
  Globe,
  FileText,
  Table,
  User,
  Monitor,
  Sparkles
} from 'lucide-react';
import { SettingsState, WALLPAPERS } from '../types';

interface OOBESetupProps {
  initialSettings: SettingsState;
  onComplete: (configuredSettings: SettingsState) => void;
}

const REGION_OPTIONS = [
  '台湾',
  '中央アフリカ共和国',
  '中国',
  '南アフリカ',
  '南スーダン',
  '南極',
  '日本',
  '米国 (United States)',
  'イギリス (United Kingdom)',
  'ドイツ (Germany)',
];

export const OOBESetup: React.FC<OOBESetupProps> = ({ initialSettings, onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Local state for all customizable options
  const [language, setLanguage] = useState<'ja' | 'en'>(initialSettings.language || 'ja');
  const [region, setRegion] = useState<string>(initialSettings.region || '日本');
  const [username, setUsername] = useState<string>(initialSettings.username || 'User');
  const [usePassword, setUsePassword] = useState<boolean>(initialSettings.usePassword || false);
  const [password, setPassword] = useState<string>(initialSettings.password || '');
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(initialSettings.isDarkTheme ?? true);
  const [taskbarAlignment, setTaskbarAlignment] = useState<'left' | 'center'>(initialSettings.taskbarAlignment || 'left');
  const [wallpaper, setWallpaper] = useState<string>(initialSettings.wallpaper || WALLPAPERS[0].url);

  // File Format & Storage Preferences
  const [defaultDocFormat, setDefaultDocFormat] = useState<'txt' | 'docx' | 'md'>(
    initialSettings.defaultDocFormat || 'docx'
  );
  const [defaultSheetFormat, setDefaultSheetFormat] = useState<'csv' | 'xlsx'>(
    initialSettings.defaultSheetFormat || 'xlsx'
  );
  const [autoSaveFiles, setAutoSaveFiles] = useState<boolean>(
    initialSettings.autoSaveFiles ?? true
  );

  // Region & Timezone
  const [timezone, setTimezone] = useState<string>(initialSettings.timezone || 'Asia/Tokyo');

  const isJa = language === 'ja';

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      finishSetup();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const finishSetup = () => {
    const finalSettings: SettingsState = {
      ...initialSettings,
      language,
      region,
      username: username.trim() || 'User',
      usePassword,
      password: usePassword ? password : '',
      isDarkTheme,
      taskbarAlignment,
      wallpaper,
      defaultDocFormat,
      defaultSheetFormat,
      autoSaveFiles,
      timezone,
    };
    onComplete(finalSettings);
  };

  // Status Narration Text at the bottom bar (like Win10 Cortana prompt)
  const getNarrationText = () => {
    switch (step) {
      case 1:
        return `お住まいの地域は ${region}、言語は ${language === 'ja' ? '日本語' : 'English'} に設定されています。これでよろしいですか？`;
      case 2:
        return `ドキュメント: .${defaultDocFormat} / 表計算: .${defaultSheetFormat} 形式に設定されています。`;
      case 3:
        return `ユーザー名「${username || 'User'}」${usePassword ? '（パスワード保護あり）' : '（パスワードなし）'} で作成します。`;
      case 4:
        return `テーマ: ${isDarkTheme ? 'ダーク' : 'ライト'}、タスクバー: ${taskbarAlignment === 'left' ? '左揃え' : '中央揃え'} に設定されています。`;
      case 5:
        return `設定内容の確認が完了しました。「はい」を押して Abord OS デスクトップを開きます。`;
      default:
        return '';
    }
  };

  return (
    <motion.div
      key="oobe-main-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-[99999] bg-[#004b87] text-white flex flex-col justify-between select-none font-sans overflow-hidden"
    >
      {/* Top Abord OOBE Navigation Header Bar */}
      <div className="w-full bg-[#003763] h-10 flex items-center justify-center border-b border-black/20 px-4 shrink-0 z-10">
        <div className="flex items-center gap-8 text-xs font-medium tracking-wide">
          <div className="relative py-2.5 text-white font-semibold cursor-pointer">
            {step === 1 && '基本'}
            {step === 2 && 'ファイル保存'}
            {step === 3 && 'アカウント'}
            {step === 4 && 'カスタマイズ'}
            {step === 5 && '完了'}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
          </div>
          <span className="text-white/40 text-[11px]">Abord2027.2 Web OS Initial Setup</span>
        </div>
      </div>

      {/* Main OOBE Screen Canvas (Scrollable so content never pushes buttons offscreen) */}
      <main className="flex-1 min-h-0 w-full max-w-4xl mx-auto px-6 py-4 sm:py-6 flex flex-col items-center text-center overflow-y-auto custom-scrollbar my-auto">
        <AnimatePresence mode="wait">
          {/* STEP 1: WELCOME & REGION */}
          {step === 1 && (
            <motion.div
              key="win10-step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex flex-col items-center gap-4 sm:gap-6 my-auto"
            >
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-4xl font-light tracking-wide text-white">
                  welcome to Abord2027.2 web os
                </h1>
                <p className="text-sm text-sky-100/80">
                  お住まいの地域とシステム言語を選択してください
                </p>
              </div>

              {/* Language Switch */}
              <div className="flex items-center gap-3 bg-[#003a6b] p-1.5 border border-white/20 rounded-xs">
                <button
                  type="button"
                  onClick={() => setLanguage('ja')}
                  className={`px-4 py-1.5 text-xs transition-colors cursor-pointer ${
                    language === 'ja'
                      ? 'bg-[#0078d7] text-white font-semibold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  日本語 (Japanese)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-1.5 text-xs transition-colors cursor-pointer ${
                    language === 'en'
                      ? 'bg-[#0078d7] text-white font-semibold'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  English (US)
                </button>
              </div>

              {/* Region Selection Scrollable List Box */}
              <div className="w-full max-w-md bg-[#003866] border border-white/30 h-44 sm:h-56 overflow-y-auto text-left shadow-inner custom-scrollbar">
                {REGION_OPTIONS.map((reg) => {
                  const isSelected = region === reg;
                  return (
                    <div
                      key={reg}
                      onClick={() => setRegion(reg)}
                      className={`px-4 py-2.5 text-sm cursor-pointer transition-colors border-b border-white/5 ${
                        isSelected
                          ? 'bg-[#0078d7] text-white font-semibold outline-1 outline-dashed outline-white/80'
                          : 'hover:bg-[#004e8a] text-sky-100'
                      }`}
                    >
                      {reg}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: FILE FORMAT PREFERENCES */}
          {step === 2 && (
            <motion.div
              key="win10-step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex flex-col items-center gap-4 sm:gap-5 my-auto"
            >
              <div className="space-y-1">
                <h1 className="text-xl sm:text-3xl font-light tracking-wide text-white">
                  ファイルの標準保存形式を選択してください
                </h1>
                <p className="text-xs sm:text-sm text-sky-100/80">
                  ドキュメントエディタや表計算アプリで新規保存する際の既定の拡張子を指定します
                </p>
              </div>

              <div className="w-full max-w-lg space-y-4 text-left">
                {/* Document Format */}
                <div className="space-y-1.5">
                  <span className="text-xs text-sky-200 font-semibold uppercase tracking-wider block">
                    ドキュメント保存形式 (Word / メモ帳)
                  </span>
                  <div className="bg-[#003866] border border-white/30">
                    {[
                      { id: 'docx', label: '.docx - Word ドキュメント (推奨)', desc: '標準的なオフィス互換形式' },
                      { id: 'txt', label: '.txt - テキストドキュメント', desc: 'シンプルなプレーンテキスト' },
                      { id: 'md', label: '.md - Markdown 文書', desc: 'マークダウンテキスト' },
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setDefaultDocFormat(opt.id as any)}
                        className={`p-2.5 text-xs cursor-pointer border-b border-white/10 flex flex-col gap-0.5 ${
                          defaultDocFormat === opt.id
                            ? 'bg-[#0078d7] text-white font-semibold'
                            : 'hover:bg-[#004e8a] text-sky-100'
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-bold">{opt.label}</span>
                        <span className="text-[10px] sm:text-[11px] opacity-80">{opt.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spreadsheet Format */}
                <div className="space-y-1.5">
                  <span className="text-xs text-sky-200 font-semibold uppercase tracking-wider block">
                    表計算スプレッドシート形式 (Excel)
                  </span>
                  <div className="bg-[#003866] border border-white/30">
                    {[
                      { id: 'xlsx', label: '.xlsx - Excel ワークブック (推奨)', desc: '標準的なスプレッドシート' },
                      { id: 'csv', label: '.csv - CSV カンマ区切りデータ', desc: '汎用データ形式' },
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setDefaultSheetFormat(opt.id as any)}
                        className={`p-2.5 text-xs cursor-pointer border-b border-white/10 flex flex-col gap-0.5 ${
                          defaultSheetFormat === opt.id
                            ? 'bg-[#0078d7] text-white font-semibold'
                            : 'hover:bg-[#004e8a] text-sky-100'
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-bold">{opt.label}</span>
                        <span className="text-[10px] sm:text-[11px] opacity-80">{opt.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Auto save checkbox */}
                <label className="flex items-center gap-3 p-2.5 bg-[#003866] border border-white/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSaveFiles}
                    onChange={(e) => setAutoSaveFiles(e.target.checked)}
                    className="w-4 h-4 accent-[#0078d7]"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">ファイルを自動的にバックグラウンド保存する</span>
                    <span className="text-[10px] text-sky-200">ブラウザのローカルストレージに作業状態を保護します</span>
                  </div>
                </label>
              </div>
            </motion.div>
          )}

          {/* STEP 3: USER ACCOUNT */}
          {step === 3 && (
            <motion.div
              key="win10-step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex flex-col items-center gap-6"
            >
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-light tracking-wide text-white">
                  この PC を使うのは誰ですか？
                </h1>
                <p className="text-sm text-sky-100/80">
                  ユーザー名とパスワードを設定します
                </p>
              </div>

              <div className="w-full max-w-md bg-[#003866] border border-white/30 p-6 space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-sky-200 block">名前 (ユーザー表示名)</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="User"
                    className="w-full bg-[#002747] text-white text-sm p-2.5 border border-white/30 focus:outline-none focus:border-[#0078d7]"
                  />
                </div>

                <div className="space-y-3 pt-2 border-t border-white/10">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePassword}
                      onChange={(e) => setUsePassword(e.target.checked)}
                      className="w-4 h-4 accent-[#0078d7]"
                    />
                    <span className="text-xs font-semibold text-white">ログイン時のパスワード保護を有効にする</span>
                  </label>

                  {usePassword && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-sky-200 block">パスワードを入力</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="パスワード"
                        className="w-full bg-[#002747] text-white text-sm p-2.5 border border-white/30 focus:outline-none focus:border-[#0078d7]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: CUSTOMIZATION */}
          {step === 4 && (
            <motion.div
              key="win10-step4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex flex-col items-center gap-6"
            >
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-light tracking-wide text-white">
                  デバイスのカスタマイズ設定
                </h1>
                <p className="text-sm text-sky-100/80">
                  カラーテーマやタスクバーのレイアウトを設定します
                </p>
              </div>

              <div className="w-full max-w-lg bg-[#003866] border border-white/30 p-6 space-y-5 text-left">
                {/* Theme */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-sky-200 block">システムテーマ</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsDarkTheme(true)}
                      className={`p-3 text-xs border text-left cursor-pointer transition-colors ${
                        isDarkTheme
                          ? 'bg-[#0078d7] border-white text-white font-bold'
                          : 'bg-[#002b4e] border-white/20 text-sky-200 hover:bg-[#00335c]'
                      }`}
                    >
                      ダークモード (Dark)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDarkTheme(false)}
                      className={`p-3 text-xs border text-left cursor-pointer transition-colors ${
                        !isDarkTheme
                          ? 'bg-[#0078d7] border-white text-white font-bold'
                          : 'bg-[#002b4e] border-white/20 text-sky-200 hover:bg-[#00335c]'
                      }`}
                    >
                      ライトモード (Light)
                    </button>
                  </div>
                </div>

                {/* Taskbar Alignment */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-sky-200 block">タスクバーアイコン配置</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTaskbarAlignment('left')}
                      className={`p-3 text-xs border text-left cursor-pointer transition-colors ${
                        taskbarAlignment === 'left'
                          ? 'bg-[#0078d7] border-white text-white font-bold'
                          : 'bg-[#002b4e] border-white/20 text-sky-200 hover:bg-[#00335c]'
                      }`}
                    >
                      左揃え (Abord 10 スタイル)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskbarAlignment('center')}
                      className={`p-3 text-xs border text-left cursor-pointer transition-colors ${
                        taskbarAlignment === 'center'
                          ? 'bg-[#0078d7] border-white text-white font-bold'
                          : 'bg-[#002b4e] border-white/20 text-sky-200 hover:bg-[#00335c]'
                      }`}
                    >
                      中央揃え (Abord 11 スタイル)
                    </button>
                  </div>
                </div>

                {/* Wallpaper */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-sky-200 block">標準壁紙</span>
                  <div className="grid grid-cols-3 gap-2">
                    {WALLPAPERS.map((wp) => (
                      <button
                        key={wp.id}
                        type="button"
                        onClick={() => setWallpaper(wp.url)}
                        className={`h-14 rounded-none overflow-hidden border-2 cursor-pointer transition-all relative ${
                          wallpaper === wp.url ? 'border-white ring-2 ring-[#0078d7]' : 'border-white/20 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={wp.url} alt={wp.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: FINAL CONFIRMATION */}
          {step === 5 && (
            <motion.div
              key="win10-step5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex flex-col items-center gap-6"
            >
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-light tracking-wide text-white">
                  設定が完了しました
                </h1>
                <p className="text-sm text-sky-100/80">
                  次回この Web ページを開く際は、設定内容が読み込まれ直接デスクトップが開きます
                </p>
              </div>

              <div className="w-full max-w-md bg-[#003866] border border-white/30 p-6 space-y-3 text-left text-xs">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-sky-200">ユーザー名:</span>
                  <span className="font-bold text-white">{username || 'User'}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-sky-200">地域 / 言語:</span>
                  <span className="font-bold text-white">{region} ({language})</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-sky-200">標準ドキュメント形式:</span>
                  <span className="font-bold text-sky-300">.{defaultDocFormat}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-sky-200">標準スプレッドシート形式:</span>
                  <span className="font-bold text-emerald-300">.{defaultSheetFormat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sky-200">テーマ & 配置:</span>
                  <span className="font-bold text-white">
                    {isDarkTheme ? 'Dark' : 'Light'} / {taskbarAlignment}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Action Area: Bottom Right Next / "はい" Button (Sticky shrink-0 container) */}
      <div className="w-full bg-[#003763] border-t border-white/10 px-6 py-2.5 shrink-0 z-10">
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 bg-[#003866] hover:bg-[#004e8a] active:bg-[#002d52] border border-white/30 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                いいえ / 戻る
              </button>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-2 bg-[#0078d7] hover:bg-[#0063b1] active:bg-[#005a9e] text-white text-xs sm:text-sm font-semibold border border-white/30 cursor-pointer shadow-sm transition-colors"
            >
              {step === totalSteps ? 'はい (デスクトップへ)' : 'はい (次へ)'}
            </button>
          </div>
        </div>
      </div>

      {/* Abord OS OOBE Bottom Narrator Status Bar */}
      <footer className="w-full bg-[#111111] text-gray-300 text-xs py-2 px-4 flex items-center justify-between border-t border-white/10">
        <div className="flex items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
          <div className="flex items-center gap-2 text-sky-400 shrink-0">
            <Accessibility className="w-4 h-4 cursor-pointer hover:text-white" />
            <Mic className="w-4 h-4 cursor-pointer hover:text-white" />
          </div>
          <span className="text-[11px] text-gray-300 truncate">
            {getNarrationText()}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sky-400 shrink-0 ml-2">
          <Volume2 className="w-4 h-4 cursor-pointer hover:text-white" />
        </div>
      </footer>
    </motion.div>
  );
};

