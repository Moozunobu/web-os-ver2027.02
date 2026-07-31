import React, { useState } from 'react';
import { WALLPAPERS, SettingsState } from '../../types';
import {
  Palette,
  Layout,
  Globe,
  UserCheck,
  RotateCw,
  Trash2,
  Clock,
  Shield,
  Search,
  ChevronLeft,
  Check,
  Lock,
  User,
  Key,
  Monitor,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface SettingsAppProps {
  settings: SettingsState;
  onUpdateSettings: (s: SettingsState) => void;
  onResetSystem: () => void;
  onRestartSystem?: () => void;
  onReRunOOBE?: () => void;
}

type SettingsCategory = 'home' | 'personalization' | 'taskbar' | 'time' | 'accounts' | 'system';

export const SettingsApp: React.FC<SettingsAppProps> = ({
  settings,
  onUpdateSettings,
  onResetSystem,
  onRestartSystem,
  onReRunOOBE,
}) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for username & password
  const [usernameInput, setUsernameInput] = useState(settings.username || 'User');
  const [passwordInput, setPasswordInput] = useState(settings.password || '');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState(settings.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('');

  const isJa = settings.language === 'ja';

  const handleUpdate = (partial: Partial<SettingsState>) => {
    onUpdateSettings({
      ...settings,
      ...partial,
    });
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.usePassword && passwordInput !== confirmPasswordInput) {
      alert(isJa ? 'パスワードが一致しません。' : 'Passwords do not match.');
      return;
    }
    handleUpdate({
      username: usernameInput.trim() || 'User',
      password: passwordInput,
    });
    setSavedSuccessMsg(isJa ? 'アカウント設定を更新しました！' : 'Account settings updated successfully!');
    setTimeout(() => setSavedSuccessMsg(''), 3000);
  };

  const categories = [
    {
      id: 'personalization' as SettingsCategory,
      title: isJa ? '個人設定' : 'Personalization',
      desc: isJa ? '背景画面、テーマカラー' : 'Background, theme colors',
      icon: Palette,
      color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    },
    {
      id: 'taskbar' as SettingsCategory,
      title: isJa ? 'タスクバー' : 'Taskbar',
      desc: isJa ? '表示/非表示(Qキー)、配置(左寄せ/中央)' : 'Visibility (Q key), alignment (left/center)',
      icon: Layout,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'time' as SettingsCategory,
      title: isJa ? '時刻と言語' : 'Time & Language',
      desc: isJa ? '言語変更、タイムゾーン、地域設定' : 'Language, timezone, region settings',
      icon: Globe,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'accounts' as SettingsCategory,
      title: isJa ? 'アカウント' : 'Accounts & Security',
      desc: isJa ? 'ユーザー名、パスワードの有無、パスワード設定' : 'Username, password enable/disable, set password',
      icon: UserCheck,
      color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    },
    {
      id: 'system' as SettingsCategory,
      title: isJa ? 'システムと復元' : 'System & Recovery',
      desc: isJa ? 'システム再起動、初期化、フォーマット' : 'System restart, reset WebOS, format',
      icon: Monitor,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
  ];

  const filteredCategories = categories.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`flex flex-col h-full font-sans select-none overflow-hidden transition-colors ${
        settings.isDarkTheme ? 'bg-zinc-900 text-zinc-100' : 'bg-slate-50 text-slate-800'
      }`}
      id="settings-app"
    >
      {/* Windows 10 Header Bar */}
      <div
        className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 ${
          settings.isDarkTheme ? 'bg-zinc-950/60 border-zinc-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {activeCategory !== 'home' && (
            <button
              onClick={() => setActiveCategory('home')}
              className={`p-1.5 rounded-full transition-colors ${
                settings.isDarkTheme ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-200 text-slate-600'
              }`}
              title={isJa ? 'ホームに戻る' : 'Back to Home'}
              id="settings-btn-back-home"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* User Account Card Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm border border-white/20">
              {(settings.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                <span>{settings.username || (isJa ? 'ローカル ユーザー' : 'Local User')}</span>
                {settings.usePassword && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-medium">
                    {isJa ? '保護中' : 'Protected'}
                  </span>
                )}
              </h2>
              <p className="text-[11px] opacity-60">
                {isJa ? 'Abord OS 設定ホーム' : 'Abord OS Settings Home'}
              </p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] sm:min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
          <input
            type="text"
            placeholder={isJa ? '設定の検索...' : 'Find a setting...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-1.5 rounded-full text-xs border outline-none transition-all ${
              settings.isDarkTheme
                ? 'bg-zinc-800/80 border-zinc-700 focus:border-blue-500 text-zinc-100 placeholder-zinc-500'
                : 'bg-slate-100 border-slate-300 focus:border-blue-500 text-slate-800 placeholder-slate-400'
            }`}
            id="settings-input-search"
          />
        </div>
      </div>

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Category Sidebar (if not on home page) */}
        {activeCategory !== 'home' && (
          <div
            className={`w-48 sm:w-56 border-r p-3 shrink-0 flex flex-col gap-1 overflow-y-auto animate-in fade-in slide-in-from-left-4 duration-200 ${
              settings.isDarkTheme ? 'bg-zinc-950/40 border-zinc-800' : 'bg-slate-100/70 border-slate-200'
            }`}
          >
            <button
              onClick={() => setActiveCategory('home')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all active:scale-95 ${
                activeCategory === 'home'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : settings.isDarkTheme ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>{isJa ? '設定 ホーム' : 'Settings Home'}</span>
            </button>
            <div className={`h-[1px] my-1 ${settings.isDarkTheme ? 'bg-zinc-800' : 'bg-slate-200'}`} />

            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all active:scale-95 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : settings.isDarkTheme
                      ? 'hover:bg-zinc-800 text-zinc-300'
                      : 'hover:bg-slate-200 text-slate-700'
                  }`}
                  id={`settings-nav-${cat.id}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{cat.title}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Content Area with Smooth Screen Switch Animation */}
        <div
          key={activeCategory}
          className="flex-1 p-6 overflow-y-auto animate-in fade-in slide-in-from-right-6 zoom-in-95 duration-250 ease-out"
        >
          {/* ─── HOME VIEW ─── */}
          {activeCategory === 'home' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-250">
              <div className="text-center py-4 space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {isJa ? 'Abord OS の設定' : 'Abord OS Settings'}
                </h1>
                <p className="text-xs opacity-60">
                  {isJa ? 'システム、タスクバー、アカウント、時刻言語の設定を変更します' : 'Manage system, taskbar, account, time and language preferences'}
                </p>
              </div>

              {/* Grid of Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`group cursor-pointer p-4 rounded-xl border transition-all duration-200 active:scale-98 hover:-translate-y-0.5 hover:shadow-md flex items-start gap-3.5 ${
                        settings.isDarkTheme
                          ? 'bg-zinc-800/60 border-zinc-700/80 hover:border-blue-500/80 hover:bg-zinc-800'
                          : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'
                      }`}
                      id={`settings-tile-${cat.id}`}
                    >
                      <div className={`p-3 rounded-lg ${cat.color} shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        <h3 className="font-bold text-sm group-hover:text-blue-500 transition-colors">
                          {cat.title}
                        </h3>
                        <p className="text-xs opacity-60 leading-relaxed line-clamp-2">
                          {cat.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── CATEGORY 1: PERSONALIZATION (個人設定) ─── */}
          {activeCategory === 'personalization' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-3">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Palette className="w-5 h-5 text-pink-500" />
                  <span>{isJa ? '個人設定 (背景 & テーマ)' : 'Personalization'}</span>
                </h2>
                <p className="text-xs opacity-60 mt-1">
                  {isJa ? '壁紙の変更やダークテーマの設定を行います。' : 'Customize desktop wallpaper background and theme options.'}
                </p>
              </div>

              {/* Theme Mode Toggle */}
              <div className={`p-4 rounded-xl border ${settings.isDarkTheme ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs">{isJa ? 'ダークテーマ モード' : 'Dark Theme Mode'}</p>
                    <p className="text-[11px] opacity-60 mt-0.5">
                      {isJa ? 'タスクバー、スタートメニュー、ウィンドウヘッダーの色調を切替' : 'Toggle dark mode across taskbar, start menu and popups.'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUpdate({ isDarkTheme: !settings.isDarkTheme })}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      settings.isDarkTheme
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                    }`}
                    id="settings-toggle-theme"
                  >
                    {settings.isDarkTheme ? (isJa ? 'ダーク (有効)' : 'Dark (Enabled)') : (isJa ? 'ライト (無効)' : 'Light (Disabled)')}
                  </button>
                </div>
              </div>

              {/* Image Preview Height Control */}
              <div className={`p-4 rounded-xl border space-y-2 ${settings.isDarkTheme ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs">{isJa ? '画像表示の高さ設定' : 'Image Display Height'}</p>
                    <p className="text-[11px] opacity-60 mt-0.5">
                      {isJa ? '壁紙プレビューカードの高さサイズを変更します（初期設定は従来より低め）' : 'Adjust the card height of wallpaper and image previews (default is lower).'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => handleUpdate({ wallpaperImageHeight: 'low' })}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                      (settings.wallpaperImageHeight || 'low') === 'low'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : settings.isDarkTheme ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    }`}
                    id="settings-img-height-low"
                  >
                    <span>{isJa ? '低め (56px・標準)' : 'Low (56px)'}</span>
                  </button>
                  <button
                    onClick={() => handleUpdate({ wallpaperImageHeight: 'medium' })}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                      settings.wallpaperImageHeight === 'medium'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : settings.isDarkTheme ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    }`}
                    id="settings-img-height-medium"
                  >
                    <span>{isJa ? '中 (80px)' : 'Medium (80px)'}</span>
                  </button>
                  <button
                    onClick={() => handleUpdate({ wallpaperImageHeight: 'high' })}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                      settings.wallpaperImageHeight === 'high'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : settings.isDarkTheme ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    }`}
                    id="settings-img-height-high"
                  >
                    <span>{isJa ? '高め (112px)' : 'High (112px)'}</span>
                  </button>
                </div>
              </div>

              {/* Wallpapers Selection */}
              <div className={`p-4 rounded-xl border space-y-3 ${settings.isDarkTheme ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-slate-200'}`}>
                <p className="font-bold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{isJa ? 'デスクトップ壁紙の選択' : 'Select Desktop Background Wallpaper'}</span>
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {WALLPAPERS.map((wp) => {
                    const isSelected = settings.wallpaper === wp.url;
                    const imageHeightClass =
                      settings.wallpaperImageHeight === 'high'
                        ? 'h-28'
                        : settings.wallpaperImageHeight === 'medium'
                        ? 'h-20'
                        : 'h-14';
                    return (
                      <div
                        key={wp.id}
                        onClick={() => handleUpdate({ wallpaper: wp.url })}
                        className={`group cursor-pointer rounded-lg overflow-hidden border transition-all ${
                          isSelected
                            ? 'ring-2 ring-blue-500 border-transparent shadow-md'
                            : settings.isDarkTheme ? 'border-zinc-700 hover:border-zinc-500' : 'border-slate-200 hover:border-slate-400'
                        }`}
                        id={`wallpaper-item-${wp.id}`}
                      >
                        <div className={`relative ${imageHeightClass} overflow-hidden transition-all duration-200`}>
                          <img
                            src={wp.url}
                            alt={wp.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 bg-blue-600 text-white p-1 rounded-full shadow-sm">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <div className={`p-2 text-[10px] text-center font-semibold truncate ${
                          settings.isDarkTheme ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-50 text-slate-700'
                        }`}>
                          {wp.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── CATEGORY 2: TASKBAR (タスクバー) ─── */}
          {activeCategory === 'taskbar' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-3">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Layout className="w-5 h-5 text-blue-500" />
                  <span>{isJa ? 'タスクバーの設定' : 'Taskbar Settings'}</span>
                </h2>
                <p className="text-xs opacity-60 mt-1">
                  {isJa ? 'タスクバーの配置、ショートカットキーによる自動非表示設定を行います。' : 'Configure taskbar layout alignment and Q-key auto hide behavior.'}
                </p>
              </div>

              {/* Taskbar Alignment */}
              <div className={`p-4 rounded-xl border space-y-3 ${settings.isDarkTheme ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-slate-200'}`}>
                <div>
                  <p className="font-bold text-xs">{isJa ? 'タスクバーの配置' : 'Taskbar Alignment'}</p>
                  <p className="text-[11px] opacity-60 mt-0.5">
                    {isJa ? 'スタートボタンやアプリ操作アイコンの配置位置を変更します。' : 'Choose left or centered icon alignment on the taskbar.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => handleUpdate({ taskbarAlignment: 'left' })}
                    className={`flex-1 p-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      settings.taskbarAlignment === 'left'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : settings.isDarkTheme ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    }`}
                    id="settings-btn-align-left"
                  >
                    <span>{isJa ? '⬅ 左寄せ (Abord 10 スタイル)' : '⬅ Left Aligned (Abord 10 Style)'}</span>
                  </button>

                  <button
                    onClick={() => handleUpdate({ taskbarAlignment: 'center' })}
                    className={`flex-1 p-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      settings.taskbarAlignment === 'center'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : settings.isDarkTheme ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    }`}
                    id="settings-btn-align-center"
                  >
                    <span>{isJa ? '↔ 中央寄せ (Abord 11 スタイル)' : '↔ Center Aligned (Abord 11 Style)'}</span>
                  </button>
                </div>
              </div>

              {/* Abord 10 Base Color & Opacity / Translucency Settings */}
              {settings.taskbarAlignment === 'left' && (
                <div className={`p-4 rounded-xl border space-y-4 ${settings.isDarkTheme ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-slate-200'}`}>
                  <div>
                    <p className="font-bold text-xs flex items-center justify-between">
                      <span>{isJa ? 'Abord 10 ベースカラー (Base Color)' : 'Abord 10 Base Color'}</span>
                      <span className="text-[10px] text-blue-500 font-bold px-2 py-0.5 rounded bg-blue-500/10">Abord 10</span>
                    </p>
                    <p className="text-[11px] opacity-60 mt-0.5">
                      {isJa ? 'タスクバーおよびスタートメニューのベースカラーを選択します。' : 'Choose base theme color for Abord 10 taskbar and start menu.'}
                    </p>
                  </div>

                  {/* Base Color Presets Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                    {[
                      { id: 'dark', labelJa: 'ダーク', labelEn: 'Dark', color: '#1e1e1f' },
                      { id: 'navy', labelJa: 'ネイビー', labelEn: 'Navy', color: '#0f172a' },
                      { id: 'slate', labelJa: 'スレート', labelEn: 'Slate', color: '#1e293b' },
                      { id: 'purple', labelJa: 'パープル', labelEn: 'Purple', color: '#2e1065' },
                      { id: 'red', labelJa: 'レッド', labelEn: 'Red', color: '#450a0a' },
                      { id: 'emerald', labelJa: 'エメラルド', labelEn: 'Emerald', color: '#064e3b' },
                      { id: 'clear', labelJa: 'クリア', labelEn: 'Clear', color: 'rgba(255, 255, 255, 0.2)', isClear: true },
                    ].map((item) => {
                      const isSelected = (settings.taskbarBaseColor || 'dark') === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleUpdate({ taskbarBaseColor: item.id })}
                          className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? 'ring-2 ring-blue-500 border-blue-500 shadow-md font-bold'
                              : 'hover:opacity-90 opacity-75'
                          } ${
                            settings.isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-100 border-slate-300'
                          }`}
                          id={`settings-basecolor-${item.id}`}
                        >
                          <div
                            className="w-full h-6 rounded-md shadow-inner border border-white/20 flex items-center justify-center relative overflow-hidden"
                            style={{
                              backgroundColor: item.color,
                              backgroundImage: item.isClear ? 'linear-gradient(45deg, #bbb 25%, transparent 25%), linear-gradient(-45deg, #bbb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #bbb 75%), linear-gradient(-45deg, transparent 75%, #bbb 75%)' : undefined,
                              backgroundSize: item.isClear ? '8px 8px' : undefined,
                              backgroundPosition: item.isClear ? '0 0, 0 4px, 4px -4px, -4px 0px' : undefined,
                            }}
                          >
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs ring-2 ring-white" />}
                          </div>
                          <span className="text-[10px] truncate w-full">{isJa ? item.labelJa : item.labelEn}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Translucency / Opacity Slider */}
                  <div className="pt-3 border-t border-zinc-700/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{isJa ? '半透明度 (不透明度)' : 'Opacity / Translucency'}</span>
                      <span className="text-blue-500 font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10">
                        {settings.taskbarOpacity ?? 85}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] opacity-60 shrink-0">{isJa ? '透明 (0%)' : 'Clear (0%)'}</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={settings.taskbarOpacity ?? 85}
                        onChange={(e) => handleUpdate({ taskbarOpacity: parseInt(e.target.value, 10) })}
                        className="w-full h-2 bg-zinc-700/60 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        id="settings-slider-taskbar-opacity"
                      />
                      <span className="text-[10px] opacity-60 shrink-0">{isJa ? '不透明 (100%)' : 'Solid (100%)'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Start Menu Widgets Settings (Abord 10 & 11) */}
              <div className={`p-4 rounded-xl border space-y-4 ${settings.isDarkTheme ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-slate-200'}`}>
                <div>
                  <p className="font-bold text-xs flex items-center justify-between">
                    <span>{isJa ? 'スタートメニュー ウィジェット表示設定' : 'Start Menu Widgets Settings'}</span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 font-bold px-2 py-0.5 rounded">
                      {isJa ? 'ウィジェット' : 'Widgets'}
                    </span>
                  </p>
                  <p className="text-[11px] opacity-60 mt-0.5">
                    {isJa ? 'スタートメニュータイルエリアに表示するウィジェットをカスタマイズできます。' : 'Customize widgets displayed in the Start Menu tile section.'}
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Weather Widget */}
                  <div className="p-3 rounded-lg bg-black/10 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold">{isJa ? '🌤️ 天気ウィジェット' : '🌤️ Weather Widget'}</p>
                        <p className="text-[10px] opacity-60">{isJa ? 'リアルタイム天候・気温を表示' : 'Show live weather & temperature tile'}</p>
                      </div>
                      <button
                        onClick={() => handleUpdate({ showWeatherWidget: !(settings.showWeatherWidget ?? true) })}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                          (settings.showWeatherWidget ?? true)
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-700 text-zinc-300'
                        }`}
                        id="settings-toggle-weather"
                      >
                        {(settings.showWeatherWidget ?? true) ? (isJa ? '表示' : 'Show') : (isJa ? '非表示' : 'Hide')}
                      </button>
                    </div>

                    {(settings.showWeatherWidget ?? true) && (
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                        <span className="opacity-80 text-[11px]">{isJa ? '対象都市 (City):' : 'Weather Location:'}</span>
                        <select
                          value={settings.weatherCity || 'Tokyo'}
                          onChange={(e) => handleUpdate({ weatherCity: e.target.value })}
                          className={`px-2.5 py-1 rounded text-xs font-semibold border outline-none ${
                            settings.isDarkTheme ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-800'
                          }`}
                          id="settings-select-weather-city"
                        >
                          <option value="Tokyo">東京 (Tokyo)</option>
                          <option value="Osaka">大阪 (Osaka)</option>
                          <option value="Nagoya">名古屋 (Nagoya)</option>
                          <option value="Fukuoka">福岡 (Fukuoka)</option>
                          <option value="Sapporo">札幌 (Sapporo)</option>
                          <option value="New York">New York</option>
                          <option value="London">London</option>
                          <option value="Paris">Paris</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Clock & Calendar Widget */}
                  <div className="p-3 rounded-lg bg-black/10 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold">{isJa ? '🕒 時計・カレンダー ウィジェット' : '🕒 Clock & Calendar Widget'}</p>
                        <p className="text-[10px] opacity-60">{isJa ? '現在時刻と日付タイルを表示' : 'Show live clock & date tile'}</p>
                      </div>
                      <button
                        onClick={() => handleUpdate({ showClockWidget: !(settings.showClockWidget ?? true) })}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                          (settings.showClockWidget ?? true)
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-700 text-zinc-300'
                        }`}
                        id="settings-toggle-clock"
                      >
                        {(settings.showClockWidget ?? true) ? (isJa ? '表示' : 'Show') : (isJa ? '非表示' : 'Hide')}
                      </button>
                    </div>

                    {/* Clock Style Choice: Analog vs Digital */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold">{isJa ? '時計表示スタイル (デスクトップ & スタート)' : 'Clock Display Style'}</p>
                        <p className="text-[10px] opacity-60">{isJa ? '針時計 (アナログ) または デジタル時計を選択' : 'Choose Analog hand clock or Digital clock'}</p>
                      </div>
                      <div className="flex items-center bg-black/25 p-1 rounded-lg border border-white/10 gap-1">
                        <button
                          onClick={() => handleUpdate({ clockWidgetType: 'digital' })}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                            (settings.clockWidgetType || 'digital') === 'digital'
                              ? 'bg-purple-600 text-white shadow'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                          id="settings-clock-type-digital"
                        >
                          {isJa ? 'デジタル時計' : 'Digital'}
                        </button>
                        <button
                          onClick={() => handleUpdate({ clockWidgetType: 'analog' })}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                            settings.clockWidgetType === 'analog'
                              ? 'bg-purple-600 text-white shadow'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                          id="settings-clock-type-analog"
                        >
                          {isJa ? '針時計 (アナログ)' : 'Analog'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Sticky Notes Widget */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/10 border border-white/5">
                    <div>
                      <p className="text-xs font-semibold">{isJa ? '📝 クイックメモ ウィジェット' : '📝 Quick Notes Widget'}</p>
                      <p className="text-[10px] opacity-60">{isJa ? 'スタートメニュー上で書き込めるメモ' : 'Interactive sticky note tile'}</p>
                    </div>
                    <button
                      onClick={() => handleUpdate({ showQuickNotesWidget: !(settings.showQuickNotesWidget ?? true) })}
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                        (settings.showQuickNotesWidget ?? true)
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-700 text-zinc-300'
                      }`}
                      id="settings-toggle-notes"
                    >
                      {(settings.showQuickNotesWidget ?? true) ? (isJa ? '表示' : 'Show') : (isJa ? '非表示' : 'Hide')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop Widgets Configuration Card */}
              <div className={`p-4 rounded-xl border space-y-4 ${settings.isDarkTheme ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-slate-200'}`}>
                <div>
                  <p className="font-bold text-xs flex items-center justify-between">
                    <span>{isJa ? 'デスクトップ画面 ウィジェット配置設定' : 'Desktop Widgets Settings'}</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded">
                      {isJa ? 'デスクトップ' : 'Desktop'}
                    </span>
                  </p>
                  <p className="text-[11px] opacity-60 mt-0.5">
                    {isJa ? 'デスクトップ画面上に直接浮遊表示するウィジェットをオン/オフにします。ドラッグで自由な位置に移動可能です。' : 'Toggle widgets floating directly on desktop. Draggable anywhere on screen.'}
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  {/* Desktop Weather Widget */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/10 border border-white/5">
                    <div>
                      <p className="text-xs font-semibold">{isJa ? '🌤️ デスクトップ 天気ウィジェット' : '🌤️ Desktop Weather Widget'}</p>
                      <p className="text-[10px] opacity-60">{isJa ? '壁紙上に都市の天気を常に表示' : 'Show live weather directly on desktop'}</p>
                    </div>
                    <button
                      onClick={() => handleUpdate({ showDesktopWeatherWidget: !(settings.showDesktopWeatherWidget ?? false) })}
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                        (settings.showDesktopWeatherWidget ?? false)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-700 text-zinc-300'
                      }`}
                      id="settings-toggle-desktop-weather"
                    >
                      {(settings.showDesktopWeatherWidget ?? false) ? (isJa ? '表示中' : 'Active') : (isJa ? '非表示' : 'Disabled')}
                    </button>
                  </div>

                  {/* Desktop Clock Widget */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/10 border border-white/5">
                    <div>
                      <p className="text-xs font-semibold">{isJa ? '🕒 デスクトップ 時計・日付ウィジェット' : '🕒 Desktop Clock Widget'}</p>
                      <p className="text-[10px] opacity-60">{isJa ? '壁紙上に大きなデジタル時計と日付を表示' : 'Show digital clock & date on desktop'}</p>
                    </div>
                    <button
                      onClick={() => handleUpdate({ showDesktopClockWidget: !(settings.showDesktopClockWidget ?? false) })}
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                        (settings.showDesktopClockWidget ?? false)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-700 text-zinc-300'
                      }`}
                      id="settings-toggle-desktop-clock"
                    >
                      {(settings.showDesktopClockWidget ?? false) ? (isJa ? '表示中' : 'Active') : (isJa ? '非表示' : 'Disabled')}
                    </button>
                  </div>

                  {/* Desktop Quick Notes Widget */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/10 border border-white/5">
                    <div>
                      <p className="text-xs font-semibold">{isJa ? '📝 デスクトップ クイックメモ' : '📝 Desktop Sticky Notes'}</p>
                      <p className="text-[10px] opacity-60">{isJa ? '壁紙上でいつでも編集できるメモ帳' : 'Show editable sticky note on desktop'}</p>
                    </div>
                    <button
                      onClick={() => handleUpdate({ showDesktopNotesWidget: !(settings.showDesktopNotesWidget ?? false) })}
                      className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                        (settings.showDesktopNotesWidget ?? false)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-700 text-zinc-300'
                      }`}
                      id="settings-toggle-desktop-notes"
                    >
                      {(settings.showDesktopNotesWidget ?? false) ? (isJa ? '表示中' : 'Active') : (isJa ? '非表示' : 'Disabled')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Q Key Toggle Taskbar Visibility */}
              <div className={`p-4 rounded-xl border ${settings.isDarkTheme ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs">
                      {isJa ? 'Qキーでタスクバーを表示/非表示 (Q Key Hide Toggle)' : 'Toggle Taskbar with Q Key'}
                    </p>
                    <p className="text-[11px] opacity-60 mt-0.5">
                      {isJa ? 'キーボードの「Q」キーを押してタスクバーの折りたたみを切り替えます。' : 'Press "Q" key on keyboard to hide or restore the taskbar.'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUpdate({ isToggleTaskbarWithQ: !settings.isToggleTaskbarWithQ })}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      settings.isToggleTaskbarWithQ
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                    }`}
                    id="settings-btn-toggle-q"
                  >
                    {settings.isToggleTaskbarWithQ ? (isJa ? '有効' : 'Enabled') : (isJa ? '無効' : 'Disabled')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── CATEGORY 3: TIME & LANGUAGE (時刻と言語) ─── */}
          {activeCategory === 'time' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-3">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-500" />
                  <span>{isJa ? '時刻と言語の設定' : 'Time & Language Settings'}</span>
                </h2>
                <p className="text-xs opacity-60 mt-1">
                  {isJa ? 'システムの主要言語、タイムゾーン、地域表示の変更を行います。' : 'Set system display language, timezone clock offset, and local region.'}
                </p>
              </div>

              {/* System Language Selector */}
              <div className={`p-4 rounded-xl border space-y-2 ${settings.isDarkTheme ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-slate-200'}`}>
                <div>
                  <p className="font-bold text-xs">{isJa ? 'システム言語の変更 (Language)' : 'System Language'}</p>
                  <p className="text-[11px] opacity-60 mt-0.5">
                    {isJa ? 'システム全体のアラート、メニュー、スタート画面の言語を統一します。' : 'Unifies system-wide menus, labels, and dialog prompts.'}
                  </p>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => handleUpdate({ language: 'ja' })}
                    className={`flex-1 p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      settings.language === 'ja'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : settings.isDarkTheme ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                    id="settings-lang-ja"
                  >
                    <span>🇯🇵 日本語 (Japanese)</span>
                  </button>

                  <button
                    onClick={() => handleUpdate({ language: 'en' })}
                    className={`flex-1 p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      settings.language === 'en'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : settings.isDarkTheme ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                    id="settings-lang-en"
                  >
                    <span>🇺🇸 English (US)</span>
                  </button>
                </div>
              </div>

              {/* Timezone Selector */}
              <div className={`p-4 rounded-xl border space-y-2 ${settings.isDarkTheme ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-slate-200'}`}>
                <div>
                  <p className="font-bold text-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span>{isJa ? 'タイムゾーンの変更' : 'Change Timezone'}</span>
                  </p>
                  <p className="text-[11px] opacity-60 mt-0.5">
                    {isJa ? 'タスクバー時計に適用する標準時を選択します。' : 'Select timezone applied to real-time taskbar clock.'}
                  </p>
                </div>

                <select
                  value={settings.timezone || 'Asia/Tokyo'}
                  onChange={(e) => handleUpdate({ timezone: e.target.value })}
                  className={`w-full p-2.5 rounded-lg border text-xs font-medium outline-none transition-colors ${
                    settings.isDarkTheme
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-emerald-500'
                  }`}
                  id="settings-select-timezone"
                >
                  <option value="Asia/Tokyo">(UTC+09:00) 大阪、札幌、東京 (Asia/Tokyo)</option>
                  <option value="UTC">(UTC+00:00) 協定世界時 (UTC)</option>
                  <option value="America/New_York">(UTC-05:00) 東部標準時 (米国/カナダ) (America/New_York)</option>
                  <option value="America/Los_Angeles">(UTC-08:00) 太平洋標準時 (米国/カナダ) (America/Los_Angeles)</option>
                  <option value="Europe/London">(UTC+00:00) ロンドン、ダブリン (Europe/London)</option>
                  <option value="Europe/Paris">(UTC+01:00) パリ、ベルリン、ローマ (Europe/Paris)</option>
                  <option value="Asia/Shanghai">(UTC+08:00) 北京、上海、香港 (Asia/Shanghai)</option>
                  <option value="Asia/Seoul">(UTC+09:00) ソウル (Asia/Seoul)</option>
                </select>
              </div>

              {/* Region Selector */}
              <div className={`p-4 rounded-xl border space-y-2 ${settings.isDarkTheme ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-slate-200'}`}>
                <div>
                  <p className="font-bold text-xs">{isJa ? '地域設定の変更' : 'Change Region'}</p>
                  <p className="text-[11px] opacity-60 mt-0.5">
                    {isJa ? '日付や数値フォーマットのローカライズ形式を設定します。' : 'Sets regional format for dates and currency.'}
                  </p>
                </div>

                <select
                  value={settings.region || 'Japan'}
                  onChange={(e) => handleUpdate({ region: e.target.value })}
                  className={`w-full p-2.5 rounded-lg border text-xs font-medium outline-none transition-colors ${
                    settings.isDarkTheme
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-emerald-500'
                  }`}
                  id="settings-select-region"
                >
                  <option value="Japan">日本 (Japan)</option>
                  <option value="United States">アメリカ合衆国 (United States)</option>
                  <option value="United Kingdom">イギリス (United Kingdom)</option>
                  <option value="China">中国 (China)</option>
                  <option value="Germany">ドイツ (Germany)</option>
                  <option value="France">フランス (France)</option>
                </select>
              </div>
            </div>
          )}

          {/* ─── CATEGORY 4: ACCOUNTS & SECURITY (アカウントとセキュリティ) ─── */}
          {activeCategory === 'accounts' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-3">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-violet-500" />
                  <span>{isJa ? 'アカウントとセキュリティ' : 'Accounts & Security'}</span>
                </h2>
                <p className="text-xs opacity-60 mt-1">
                  {isJa ? 'ユーザー名の変更、ログインパスワードの使用有無とパスワード設定を行います。' : 'Manage account name, enable password protection and credentials.'}
                </p>
              </div>

              {savedSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{savedSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveAccount} className="space-y-4">
                {/* User Name Change */}
                <div className={`p-4 rounded-xl border space-y-2 ${settings.isDarkTheme ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-slate-200'}`}>
                  <label className="block font-bold text-xs flex items-center gap-1.5">
                    <User className="w-4 h-4 text-violet-500" />
                    <span>{isJa ? 'ユーザー名の変更' : 'Change Username'}</span>
                  </label>
                  <p className="text-[11px] opacity-60">
                    {isJa ? 'スタートメニューやロック画面に表示されるアカウント名です。' : 'DisplayName visible in start menu and lock screen.'}
                  </p>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder={isJa ? '新しいユーザー名' : 'Enter username'}
                    className={`w-full p-2.5 rounded-lg border text-xs font-medium outline-none transition-colors ${
                      settings.isDarkTheme
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-violet-500'
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-violet-500'
                    }`}
                    id="settings-input-username"
                  />
                </div>

                {/* Password Enable / Disable Toggle */}
                <div className={`p-4 rounded-xl border ${settings.isDarkTheme ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-violet-500" />
                        <span>{isJa ? 'パスワード認証を使用する' : 'Enable Password Protection'}</span>
                      </p>
                      <p className="text-[11px] opacity-60 mt-0.5">
                        {isJa ? '起動時およびロック解除時にパスワード入力を要求します。' : 'Require password prompt on startup and lock screen.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdate({ usePassword: !settings.usePassword })}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        settings.usePassword
                          ? 'bg-violet-600 text-white hover:bg-violet-700'
                          : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                      }`}
                      id="settings-toggle-password"
                    >
                      {settings.usePassword ? (isJa ? '使用する (有効)' : 'Enabled') : (isJa ? '使用しない (無効)' : 'Disabled')}
                    </button>
                  </div>
                </div>

                {/* Password Setup Inputs (if usePassword is active or being set up) */}
                {settings.usePassword && (
                  <div className={`p-4 rounded-xl border space-y-3 animate-in fade-in ${settings.isDarkTheme ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-slate-200'}`}>
                    <p className="font-bold text-xs flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-violet-500" />
                      <span>{isJa ? 'パスワードの設定・変更' : 'Set Account Password'}</span>
                    </p>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[11px] opacity-70 mb-1">{isJa ? 'パスワード:' : 'Password:'}</label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder={isJa ? 'パスワードを入力' : 'Enter password'}
                          className={`w-full p-2.5 rounded-lg border text-xs outline-none transition-colors ${
                            settings.isDarkTheme
                              ? 'bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-violet-500'
                              : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-violet-500'
                          }`}
                          id="settings-input-password"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] opacity-70 mb-1">{isJa ? 'パスワードの確認:' : 'Confirm Password:'}</label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPasswordInput}
                          onChange={(e) => setConfirmPasswordInput(e.target.value)}
                          placeholder={isJa ? 'パスワードを再入力' : 'Re-enter password'}
                          className={`w-full p-2.5 rounded-lg border text-xs outline-none transition-colors ${
                            settings.isDarkTheme
                              ? 'bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-violet-500'
                              : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-violet-500'
                          }`}
                          id="settings-input-confirm-password"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="show-pass-check"
                          checked={showPassword}
                          onChange={(e) => setShowPassword(e.target.checked)}
                          className="rounded text-violet-600 focus:ring-violet-500 cursor-pointer"
                        />
                        <label htmlFor="show-pass-check" className="text-xs opacity-80 cursor-pointer">
                          {isJa ? 'パスワードを表示する' : 'Show Password Characters'}
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
                  id="settings-btn-save-account"
                >
                  {isJa ? 'アカウント変更を保存' : 'Save Account Settings'}
                </button>
              </form>
            </div>
          )}

          {/* ─── CATEGORY 5: SYSTEM & RECOVERY (システムと復元) ─── */}
          {activeCategory === 'system' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="border-b pb-3">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-amber-500" />
                  <span>{isJa ? 'システムと復元' : 'System & Recovery'}</span>
                </h2>
                <p className="text-xs opacity-60 mt-1">
                  {isJa ? 'OSの再起動やストレージの完全初期化を行います。' : 'System reboot and factory format utilities.'}
                </p>
              </div>

              {/* Reboot OS */}
              <div className={`p-4 rounded-xl border space-y-2 ${settings.isDarkTheme ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-slate-200'}`}>
                <p className="font-bold text-xs flex items-center gap-1.5">
                  <RotateCw className="w-4 h-4 text-emerald-500" />
                  <span>{isJa ? 'Abord OS の再起動' : 'Restart Abord OS'}</span>
                </p>
                <p className="text-[11px] opacity-60">
                  {isJa ? '起動アニメーション画面を経由してシステムを再起動します（データは保持されます）。' : 'Reboots system via startup chime screen while preserving saved files.'}
                </p>
                <button
                  onClick={() => {
                    if (onRestartSystem) onRestartSystem();
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                  id="settings-btn-reboot"
                >
                  {isJa ? '今すぐ再起動' : 'Restart Now'}
                </button>
              </div>

              {/* Re-run OOBE Initial Setup */}
              {onReRunOOBE && (
                <div className={`p-4 rounded-xl border space-y-2 ${settings.isDarkTheme ? 'bg-zinc-800/50 border-zinc-700' : 'bg-white border-slate-200'}`}>
                  <p className="font-bold text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>{isJa ? '初期設定ウィザード (OOBE) を再起動' : 'Re-run Initial Setup Wizard'}</span>
                  </p>
                  <p className="text-[11px] opacity-60">
                    {isJa ? '初回起動時の「welcome to Abord2027.2 web os」設定画面を再度開き、保存形式などを再設定します。' : 'Re-open the initial setup screen to reconfigure file formats and user options.'}
                  </p>
                  <button
                    onClick={onReRunOOBE}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                    id="settings-btn-rerun-oobe"
                  >
                    {isJa ? '初期設定画面を開く' : 'Launch Setup Wizard'}
                  </button>
                </div>
              )}

              {/* Reset & Format */}
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-2">
                <p className="font-bold text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" />
                  <span>{isJa ? 'Abord OS の完全初期化 (フォーマット)' : 'Format & Reset Abord OS'}</span>
                </p>
                <p className="text-[11px] opacity-70 leading-relaxed">
                  {isJa
                    ? 'LocalStorage内のすべての保存データ（ファイルエクスプローラーの文章、壁紙設定、デスクトップ配置など）を削除し初期状態に戻します。'
                    : 'Permanently erases all saved documents, custom desktop layouts, and reverts settings to factory defaults.'}
                </p>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        isJa
                          ? '警告: Abord OSの全ローカルデータを削除し初期化します。よろしいですか？'
                          : 'Warning: This will format your entire Abord OS storage. Proceed?'
                      )
                    ) {
                      onResetSystem();
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                  id="settings-btn-factory-reset"
                >
                  {isJa ? 'ストレージを完全フォーマット' : 'Format Abord OS Storage'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
