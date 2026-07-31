import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Power, Settings, User, RotateCw, HelpCircle, Menu, 
  Folder, FileText, ShoppingBag, MessageSquare, Gamepad2, 
  Terminal, Palette, Sun, CloudSun, CloudRain, Cloud, Clock, 
  StickyNote, GripVertical, RotateCcw
} from 'lucide-react';
import { AppIcon } from './AppIcon';
import { AnalogClock } from './AnalogClock';
import { AppID } from '../types';
import { SYSTEM_STORE_APPS, getInstalledSystemAppIds } from '../data/storeApps';
import { WEATHER_DATA } from '../data/weather';
import { getTaskbarBgStyle } from './Taskbar';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
  onLaunchApp: (id: AppID) => void;
  onResetSystem: () => void;
  onRestartSystem?: () => void;
  onShutdownSystem?: () => void;
  username?: string;
  language?: 'ja' | 'en';
  taskbarAlignment?: 'left' | 'center';
  taskbarBaseColor?: string;
  taskbarOpacity?: number;
  showWeatherWidget?: boolean;
  showClockWidget?: boolean;
  showQuickNotesWidget?: boolean;
  weatherCity?: string;
  clockWidgetType?: 'digital' | 'analog';
}



const DEFAULT_TILE_ORDER = [
  'widget-weather',
  'widget-clock',
  'widget-notes',
  'noobstore',
  'files',
  'settings',
  'notepad',
  'excel',
  'wetalks',
  'terminal',
  'paint',
  'word',
  'minecraft',
];

export const StartMenu: React.FC<StartMenuProps> = ({
  isOpen,
  onClose,
  isDarkTheme,
  onLaunchApp,
  onResetSystem,
  onRestartSystem,
  onShutdownSystem,
  username = 'User',
  language = 'ja',
  taskbarAlignment = 'left',
  taskbarBaseColor = 'dark',
  taskbarOpacity = 85,
  showWeatherWidget = true,
  showClockWidget = true,
  showQuickNotesWidget = true,
  weatherCity = 'Tokyo',
  clockWidgetType = 'digital',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [installedSystemApps, setInstalledSystemApps] = useState<string[]>([]);
  const [customWebApps, setCustomWebApps] = useState<Array<{ id: string; title: string; iconChar?: string }>>([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isPowerMenuOpen, setIsPowerMenuOpen] = useState(false);

  // Live time for clock widget
  const [now, setNow] = useState(new Date());

  // Quick memo state
  const [quickNote, setQuickNote] = useState(() => {
    try {
      return localStorage.getItem('abord_start_quick_note') || (language === 'ja' ? '・重要タスクをメモ\n・新機能をチェック' : '• Important task notes\n• Check new updates');
    } catch {
      return '• Quick note';
    }
  });

  // Reorderable tiles state
  const [tileOrder, setTileOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('abord_start_tile_order_v2');
      return saved ? JSON.parse(saved) : DEFAULT_TILE_ORDER;
    } catch {
      return DEFAULT_TILE_ORDER;
    }
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const isJa = language === 'ja';
  const isLeftAlign = taskbarAlignment === 'left'; // Left aligned = Abord 10 Style Start Menu!

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const loadInstalledApps = () => {
    setInstalledSystemApps(getInstalledSystemAppIds());
    try {
      const stored = localStorage.getItem('noobstore_installed_apps');
      if (stored) {
        setCustomWebApps(JSON.parse(stored));
      } else {
        setCustomWebApps([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadInstalledApps();
    const handleAppChange = () => {
      setTimeout(loadInstalledApps, 0);
    };
    window.addEventListener('webos_installed_apps_changed', handleAppChange);
    window.addEventListener('webos_desktop_items_changed', handleAppChange);
    return () => {
      window.removeEventListener('webos_installed_apps_changed', handleAppChange);
      window.removeEventListener('webos_desktop_items_changed', handleAppChange);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadInstalledApps();
      setIsSidebarExpanded(false);
      setIsPowerMenuOpen(false);
    }
  }, [isOpen]);

  const handleNoteChange = (text: string) => {
    setQuickNote(text);
    try {
      localStorage.setItem('abord_start_quick_note', text);
    } catch (e) {
      console.error(e);
    }
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newOrder = [...tileOrder];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);
    setTileOrder(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);
    try {
      localStorage.setItem('abord_start_tile_order_v2', JSON.stringify(newOrder));
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetTileOrder = () => {
    setTileOrder(DEFAULT_TILE_ORDER);
    try {
      localStorage.setItem('abord_start_tile_order_v2', JSON.stringify(DEFAULT_TILE_ORDER));
    } catch (e) {
      console.error(e);
    }
  };

  // Core system apps
  const coreApps: Array<{ id: AppID; title: string; icon: string; desc: string }> = [
    { id: 'files', title: isJa ? 'ファイル エクスプローラー' : 'File Explorer', icon: 'files', desc: isJa ? 'フォルダとファイルの閲覧' : 'Browse folders and files' },
    { id: 'settings', title: isJa ? '設定' : 'Settings', icon: 'settings', desc: isJa ? 'システムとデザインの設定' : 'Manage wallpaper and theme configs' },
    { id: 'noobstore', title: 'Abord Store', icon: 'noobstore', desc: isJa ? 'アプリの発見とインストール' : 'Discover and install apps' },
    { id: 'terminal', title: 'Terminal', icon: 'terminal', desc: isJa ? 'コマンドプロンプト' : 'Command Prompt' },
    { id: 'recycle', title: isJa ? 'ゴミ箱' : 'Recycle Bin', icon: 'recycle', desc: isJa ? '削除されたアイテム' : 'Recycle deleted items' },
  ];

  // System apps installed via Abord Store
  const installedStoreApps = SYSTEM_STORE_APPS.filter((app) =>
    installedSystemApps.includes(app.id)
  ).map((app) => ({
    id: app.id as AppID,
    title: isJa ? app.titleJa : app.titleEn,
    icon: app.icon,
    desc: isJa ? app.descriptionJa : app.descriptionEn,
  }));

  // Custom web apps installed via URL
  const installedCustomApps = customWebApps.map((app) => ({
    id: app.id as AppID,
    title: app.title,
    icon: 'browser',
    desc: 'Custom Web Application',
  }));

  const isAppInstalled = (appId: string) => {
    if (['files', 'settings', 'noobstore', 'terminal', 'recycle'].includes(appId)) return true;
    return installedSystemApps.includes(appId) || customWebApps.some((a) => a.id === appId);
  };

  const allAppsMap = new Map<string, { id: AppID; title: string; icon: string; desc: string }>();
  [...coreApps, ...installedStoreApps, ...installedCustomApps].forEach((item) => {
    if (!allAppsMap.has(item.id)) {
      allAppsMap.set(item.id, item);
    }
  });

  const appsList = Array.from(allAppsMap.values());
  const filteredApps = appsList.filter((app) =>
    app.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAppClick = (appId: AppID) => {
    onLaunchApp(appId);
    onClose();
  };

  const sortedApps = [...filteredApps].sort((a, b) => a.title.localeCompare(b.title));
  const customStartBgStyle = getTaskbarBgStyle(taskbarBaseColor, taskbarOpacity, isDarkTheme);

  const cityData = WEATHER_DATA[weatherCity || 'Tokyo'] || WEATHER_DATA.Tokyo;
  const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = now.toLocaleDateString(isJa ? 'ja-JP' : 'en-US', { month: 'short', day: 'numeric', weekday: 'short' });

  // Build current active visible tile items according to settings & installed apps
  const activeTileIds = tileOrder.filter((id) => {
    if (id === 'widget-weather') return showWeatherWidget;
    if (id === 'widget-clock') return showClockWidget;
    if (id === 'widget-notes') return showQuickNotesWidget;
    return isAppInstalled(id);
  });

  // Also include any installed store/custom apps that are not in tileOrder array
  const extraAppIds = installedStoreApps
    .map((a) => a.id)
    .filter((id) => !tileOrder.includes(id));
  const visibleTileIds = [...activeTileIds, ...extraAppIds];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            onClick={onClose}
            className="fixed inset-0 z-[9998]"
            id="start-menu-backdrop"
          />

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* ABORD 10 STYLE START MENU (Left Aligned) */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {isLeftAlign ? (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-12 left-0 z-[9999] w-[700px] max-w-[100vw] h-[560px] max-h-[calc(100vh-50px)] rounded-tr-xl border-t border-r shadow-2xl overflow-hidden flex select-none text-gray-100 border-white/10"
              style={customStartBgStyle}
              id="win10-start-menu"
            >
              {/* 1. FAR-LEFT NAVIGATION STRIP */}
              <div
                className={`relative bg-black/25 border-r border-white/5 flex flex-col justify-between p-1 z-20 transition-all duration-200 ${
                  isSidebarExpanded ? 'w-48 shadow-xl bg-black/50 backdrop-blur-md' : 'w-12'
                }`}
                onMouseEnter={() => setIsSidebarExpanded(true)}
                onMouseLeave={() => {
                  setIsSidebarExpanded(false);
                  setIsPowerMenuOpen(false);
                }}
              >
                {/* Top Hamburger Expand Icon */}
                <div className="space-y-1">
                  <button
                    onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    className="w-full h-10 flex items-center gap-3 px-3.5 rounded-md hover:bg-white/10 transition-colors text-gray-300"
                    title={isJa ? 'スタート' : 'Start'}
                  >
                    <Menu className="w-4 h-4 shrink-0" />
                    {isSidebarExpanded && <span className="text-xs font-bold uppercase tracking-wider text-white">START</span>}
                  </button>
                </div>

                {/* Bottom Navigation Buttons */}
                <div className="space-y-1 relative">
                  {/* User Profile */}
                  <div
                    className="w-full h-10 flex items-center gap-3 px-3.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer text-gray-300"
                    title={username}
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {username.charAt(0).toUpperCase()}
                    </div>
                    {isSidebarExpanded && <span className="text-xs font-semibold truncate text-white">{username}</span>}
                  </div>

                  {/* Settings Link */}
                  <button
                    onClick={() => handleAppClick('settings')}
                    className="w-full h-10 flex items-center gap-3 px-3.5 rounded-md hover:bg-white/10 transition-colors text-gray-300"
                    title={isJa ? '設定' : 'Settings'}
                  >
                    <Settings className="w-4 h-4 shrink-0" />
                    {isSidebarExpanded && <span className="text-xs font-semibold text-white">{isJa ? '設定' : 'Settings'}</span>}
                  </button>

                  {/* Power Button */}
                  <div className="relative">
                    <button
                      onClick={() => setIsPowerMenuOpen(!isPowerMenuOpen)}
                      className="w-full h-10 flex items-center gap-3 px-3.5 rounded-md hover:bg-white/10 transition-colors text-gray-300"
                      title={isJa ? '電源' : 'Power'}
                    >
                      <Power className="w-4 h-4 shrink-0 text-rose-400" />
                      {isSidebarExpanded && <span className="text-xs font-semibold text-white">{isJa ? '電源' : 'Power'}</span>}
                    </button>

                    {/* Power Popover Menu */}
                    {isPowerMenuOpen && (
                      <div className="absolute left-12 bottom-0 w-44 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl p-1.5 space-y-1 z-30">
                        <button
                          onClick={() => {
                            onClose();
                            if (onRestartSystem) onRestartSystem();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-200 hover:bg-white/10 rounded-md transition-colors"
                        >
                          <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isJa ? '再起動' : 'Restart'}</span>
                        </button>

                        <button
                          onClick={() => {
                            onClose();
                            if (onShutdownSystem) onShutdownSystem();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/20 rounded-md transition-colors"
                        >
                          <Power className="w-3.5 h-3.5 text-rose-400" />
                          <span>{isJa ? 'サインアウト' : 'Sign out'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. MIDDLE COLUMN: ALL APPS LIST & SEARCH */}
              <div className="w-[220px] bg-black/15 border-r border-white/5 flex flex-col shrink-0">
                {/* Top Search Bar */}
                <div className="p-3 border-b border-white/5">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-white focus-within:bg-black/40 focus-within:border-blue-500">
                    <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <input
                      type="text"
                      placeholder={isJa ? '検索...' : 'Search apps...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-xs text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* All Apps List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  <p className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {searchQuery ? (isJa ? '検索結果' : 'Search Results') : (isJa ? 'すべてのアプリ' : 'All Apps')}
                  </p>

                  {sortedApps.length === 0 ? (
                    <p className="p-4 text-center text-xs text-gray-400 opacity-60">
                      {isJa ? '見つかりませんでした' : 'No apps found'}
                    </p>
                  ) : (
                    sortedApps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => handleAppClick(app.id)}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer text-gray-200"
                        title={app.desc}
                      >
                        <AppIcon id={app.icon} size={20} className="shrink-0" />
                        <span className="text-xs font-medium truncate w-full">
                          {app.title}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 3. RIGHT AREA: DYNAMIC & REORDERABLE LIVE TILES GRID */}
              <div className="flex-1 overflow-y-auto p-3.5 bg-black/10 space-y-3 custom-scrollbar">
                {/* Header Controls */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>{isJa ? 'ピン留めとウィジェット' : 'Pinned & Widgets'}</span>
                    <span className="text-[9px] font-normal text-blue-300 border border-blue-400/30 px-1.5 py-0.5 rounded bg-blue-500/10">
                      {isJa ? 'ドラッグで自由に配置可能' : 'Freely Draggable'}
                    </span>
                  </h3>
                  <button
                    onClick={handleResetTileOrder}
                    className="text-[10px] text-gray-400 hover:text-white transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10"
                    title={isJa ? 'タイルの初期位置にリセット' : 'Reset Tile Layout'}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isJa ? 'リセット' : 'Reset'}</span>
                  </button>
                </div>

                {/* Tiles Grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  {visibleTileIds.map((tileId, idx) => {
                    const isDragged = draggedIndex === idx;
                    const isDragOver = dragOverIndex === idx;

                    // 🌤️ Weather Widget Tile
                    if (tileId === 'widget-weather') {
                      return (
                        <div
                          key="widget-weather"
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                          className={`col-span-2 h-24 bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-900 p-3 rounded-lg shadow-lg relative overflow-hidden group cursor-grab active:cursor-grabbing border ${
                            isDragOver ? 'ring-2 ring-blue-300 border-white scale-[1.01]' : 'border-white/10 hover:border-white/30'
                          } ${isDragged ? 'opacity-30' : 'opacity-100'}`}
                          id="tile-widget-weather"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-3.5 h-3.5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-black text-white drop-shadow-xs">{cityData ? cityData.temp : '22°C'}</span>
                                  <span className="text-[10px] text-sky-100 font-bold px-1.5 py-0.5 rounded bg-white/15 backdrop-blur-xs">
                                    {weatherCity || 'Tokyo'}
                                  </span>
                                </div>
                                <p className="text-[10px] text-sky-200/90 font-medium">
                                  {isJa ? cityData?.conditionJa : cityData?.conditionEn}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {cityData?.iconType === 'sun' && <Sun className="w-6 h-6 text-amber-300" />}
                              {cityData?.iconType === 'cloud-sun' && <CloudSun className="w-6 h-6 text-sky-200" />}
                              {cityData?.iconType === 'rain' && <CloudRain className="w-6 h-6 text-sky-300" />}
                              {cityData?.iconType === 'cloud' && <Cloud className="w-6 h-6 text-gray-300" />}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-sky-100/90 border-t border-white/15 pt-1 font-mono">
                            <span>最高/最低: {cityData?.highLow}</span>
                            <span>湿度: {cityData?.humidity}</span>
                            <span>風速: {cityData?.wind}</span>
                          </div>
                        </div>
                      );
                    }

                    // 🕒 Clock Widget Tile
                    if (tileId === 'widget-clock') {
                      const isAnalog = clockWidgetType === 'analog';
                      return (
                        <div
                          key="widget-clock"
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                          className={`col-span-1 h-24 bg-gradient-to-br from-indigo-700 via-purple-800 to-slate-900 p-2.5 rounded-lg shadow-lg relative overflow-hidden group cursor-grab active:cursor-grabbing border flex flex-col justify-between ${
                            isDragOver ? 'ring-2 ring-purple-300 border-white scale-[1.01]' : 'border-white/10 hover:border-white/30'
                          } ${isDragged ? 'opacity-30' : 'opacity-100'}`}
                          id="tile-widget-clock"
                        >
                          <div className="flex items-center justify-between">
                            <Clock className="w-4 h-4 text-purple-200" />
                            <GripVertical className="w-3.5 h-3.5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {isAnalog ? (
                            <div className="flex items-center justify-between gap-2 my-auto">
                              <AnalogClock date={now} size={46} />
                              <div className="text-right flex-1 min-w-0">
                                <p className="text-[11px] font-extrabold text-white font-mono tracking-tight leading-tight">{formattedTime}</p>
                                <p className="text-[9px] text-purple-200/80 font-medium truncate">{formattedDate}</p>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm font-extrabold text-white font-mono tracking-tight">{formattedTime}</p>
                              <p className="text-[10px] text-purple-200/80 font-medium truncate">{formattedDate}</p>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // 📝 Quick Sticky Note Tile
                    if (tileId === 'widget-notes') {
                      return (
                        <div
                          key="widget-notes"
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                          className={`col-span-2 h-24 bg-gradient-to-br from-amber-600 to-orange-700 p-2.5 rounded-lg shadow-lg relative overflow-hidden group border flex flex-col justify-between ${
                            isDragOver ? 'ring-2 ring-amber-300 border-white scale-[1.01]' : 'border-white/10 hover:border-white/30'
                          } ${isDragged ? 'opacity-30' : 'opacity-100'}`}
                          id="tile-widget-notes"
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold text-amber-100">
                            <div className="flex items-center gap-1">
                              <StickyNote className="w-3.5 h-3.5 text-amber-200" />
                              <span>{isJa ? 'クイックメモ' : 'Sticky Note'}</span>
                            </div>
                            <GripVertical className="w-3.5 h-3.5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" />
                          </div>
                          <textarea
                            value={quickNote}
                            onChange={(e) => handleNoteChange(e.target.value)}
                            placeholder={isJa ? 'メモを入力...' : 'Write quick notes...'}
                            className="w-full h-12 bg-black/20 text-white placeholder-amber-200/50 text-[11px] p-1.5 rounded resize-none border-none outline-none focus:bg-black/35 custom-scrollbar font-sans"
                          />
                        </div>
                      );
                    }

                    // Abord Store Tile (Wide 2-col)
                    if (tileId === 'noobstore') {
                      return (
                        <div
                          key="noobstore"
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                          onClick={() => handleAppClick('noobstore')}
                          className={`col-span-2 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.01] active:scale-95 shadow-md flex flex-col justify-between group relative overflow-hidden border ${
                            isDragOver ? 'ring-2 ring-blue-300 border-white' : 'border-white/10'
                          } ${isDragged ? 'opacity-30' : 'opacity-100'}`}
                          id="tile-noobstore"
                        >
                          <div className="flex items-center justify-between">
                            <ShoppingBag className="w-5 h-5 text-white/90" />
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded font-bold uppercase">Store</span>
                              <GripVertical className="w-3.5 h-3.5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Abord Store</p>
                            <p className="text-[10px] text-blue-100/80">{isJa ? 'アプリの発見とインストール' : 'Discover new web apps'}</p>
                          </div>
                        </div>
                      );
                    }

                    // File Explorer Tile
                    if (tileId === 'files') {
                      return (
                        <div
                          key="files"
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                          onClick={() => handleAppClick('files')}
                          className={`h-20 bg-amber-600 hover:bg-amber-500 p-2.5 rounded-lg cursor-pointer transition-all hover:scale-[1.01] active:scale-95 shadow-md flex flex-col justify-between group border ${
                            isDragOver ? 'ring-2 ring-amber-300 border-white' : 'border-white/10'
                          } ${isDragged ? 'opacity-30' : 'opacity-100'}`}
                          id="tile-files"
                        >
                          <div className="flex items-center justify-between">
                            <Folder className="w-5 h-5 text-amber-100" />
                            <GripVertical className="w-3.5 h-3.5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                          </div>
                          <p className="text-[11px] font-bold text-white truncate">{isJa ? 'ファイル' : 'Explorer'}</p>
                        </div>
                      );
                    }

                    // Settings Tile
                    if (tileId === 'settings') {
                      return (
                        <div
                          key="settings"
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                          onClick={() => handleAppClick('settings')}
                          className={`h-20 bg-zinc-700 hover:bg-zinc-600 p-2.5 rounded-lg cursor-pointer transition-all hover:scale-[1.01] active:scale-95 shadow-md flex flex-col justify-between group border ${
                            isDragOver ? 'ring-2 ring-gray-300 border-white' : 'border-white/10'
                          } ${isDragged ? 'opacity-30' : 'opacity-100'}`}
                          id="tile-settings"
                        >
                          <div className="flex items-center justify-between">
                            <Settings className="w-5 h-5 text-gray-200" />
                            <GripVertical className="w-3.5 h-3.5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                          </div>
                          <p className="text-[11px] font-bold text-white truncate">{isJa ? '設定' : 'Settings'}</p>
                        </div>
                      );
                    }

                    // Notepad Tile
                    if (tileId === 'notepad') {
                      return (
                        <div
                          key="notepad"
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                          onClick={() => handleAppClick('notepad')}
                          className={`h-20 bg-blue-600 hover:bg-blue-500 p-2.5 rounded-lg cursor-pointer transition-all hover:scale-[1.01] active:scale-95 shadow-md flex flex-col justify-between group border ${
                            isDragOver ? 'ring-2 ring-blue-300 border-white' : 'border-white/10'
                          } ${isDragged ? 'opacity-30' : 'opacity-100'}`}
                          id="tile-notepad"
                        >
                          <div className="flex items-center justify-between">
                            <FileText className="w-5 h-5 text-blue-100" />
                            <GripVertical className="w-3.5 h-3.5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                          </div>
                          <p className="text-[11px] font-bold text-white truncate">Notepad</p>
                        </div>
                      );
                    }

                    // Excel Tile
                    if (tileId === 'excel') {
                      return (
                        <div
                          key="excel"
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                          onClick={() => handleAppClick('excel')}
                          className={`h-20 bg-emerald-600 hover:bg-emerald-500 p-2.5 rounded-lg cursor-pointer transition-all hover:scale-[1.01] active:scale-95 shadow-md flex flex-col justify-between group border ${
                            isDragOver ? 'ring-2 ring-emerald-300 border-white' : 'border-white/10'
                          } ${isDragged ? 'opacity-30' : 'opacity-100'}`}
                          id="tile-excel"
                        >
                          <div className="flex items-center justify-between">
                            <AppIcon id="excel" size={22} />
                            <GripVertical className="w-3.5 h-3.5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                          </div>
                          <p className="text-[11px] font-bold text-white truncate">Excel</p>
                        </div>
                      );
                    }

                    // WeTalks Messenger Tile (Wide 2-col)
                    if (tileId === 'wetalks') {
                      return (
                        <div
                          key="wetalks"
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                          onClick={() => handleAppClick('wetalks')}
                          className={`col-span-2 h-20 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.01] active:scale-95 shadow-md flex flex-col justify-between group border ${
                            isDragOver ? 'ring-2 ring-purple-300 border-white' : 'border-white/10'
                          } ${isDragged ? 'opacity-30' : 'opacity-100'}`}
                          id="tile-wetalks"
                        >
                          <div className="flex items-center justify-between">
                            <MessageSquare className="w-5 h-5 text-purple-200" />
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] bg-emerald-500/80 text-white px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">
                                LIVE
                              </span>
                              <GripVertical className="w-3.5 h-3.5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">WeTalks Messenger</p>
                            <p className="text-[10px] text-purple-200/80">{isJa ? 'リアルタイムチャット' : 'Connect and chat'}</p>
                          </div>
                        </div>
                      );
                    }

                    // Terminal Tile
                    if (tileId === 'terminal') {
                      return (
                        <div
                          key="terminal"
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                          onClick={() => handleAppClick('terminal')}
                          className={`h-20 bg-slate-800 hover:bg-slate-700 p-2.5 rounded-lg cursor-pointer transition-all hover:scale-[1.01] active:scale-95 shadow-md flex flex-col justify-between group border ${
                            isDragOver ? 'ring-2 ring-emerald-400 border-white' : 'border-slate-700'
                          } ${isDragged ? 'opacity-30' : 'opacity-100'}`}
                          id="tile-terminal"
                        >
                          <div className="flex items-center justify-between">
                            <Terminal className="w-5 h-5 text-emerald-400" />
                            <GripVertical className="w-3.5 h-3.5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                          </div>
                          <p className="text-[11px] font-bold text-white truncate">Terminal</p>
                        </div>
                      );
                    }

                    // Paint Tile
                    if (tileId === 'paint') {
                      return (
                        <div
                          key="paint"
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                          onClick={() => handleAppClick('paint')}
                          className={`h-20 bg-rose-600 hover:bg-rose-500 p-2.5 rounded-lg cursor-pointer transition-all hover:scale-[1.01] active:scale-95 shadow-md flex flex-col justify-between group border ${
                            isDragOver ? 'ring-2 ring-rose-300 border-white' : 'border-white/10'
                          } ${isDragged ? 'opacity-30' : 'opacity-100'}`}
                          id="tile-paint"
                        >
                          <div className="flex items-center justify-between">
                            <Palette className="w-5 h-5 text-rose-100" />
                            <GripVertical className="w-3.5 h-3.5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                          </div>
                          <p className="text-[11px] font-bold text-white truncate">Paint</p>
                        </div>
                      );
                    }

                    // Word Tile
                    if (tileId === 'word') {
                      return (
                        <div
                          key="word"
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                          onClick={() => handleAppClick('word')}
                          className={`h-20 bg-blue-700 hover:bg-blue-600 p-2.5 rounded-lg cursor-pointer transition-all hover:scale-[1.01] active:scale-95 shadow-md flex flex-col justify-between group border ${
                            isDragOver ? 'ring-2 ring-blue-300 border-white' : 'border-white/10'
                          } ${isDragged ? 'opacity-30' : 'opacity-100'}`}
                          id="tile-word"
                        >
                          <div className="flex items-center justify-between">
                            <AppIcon id="word" size={22} />
                            <GripVertical className="w-3.5 h-3.5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                          </div>
                          <p className="text-[11px] font-bold text-white truncate">Word</p>
                        </div>
                      );
                    }

                    // Minecraft Tile
                    if (tileId === 'minecraft') {
                      return (
                        <div
                          key="minecraft"
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                          onClick={() => handleAppClick('minecraft')}
                          className={`h-20 bg-teal-700 hover:bg-teal-600 p-2.5 rounded-lg cursor-pointer transition-all hover:scale-[1.01] active:scale-95 shadow-md flex flex-col justify-between group border ${
                            isDragOver ? 'ring-2 ring-teal-300 border-white' : 'border-white/10'
                          } ${isDragged ? 'opacity-30' : 'opacity-100'}`}
                          id="tile-minecraft"
                        >
                          <div className="flex items-center justify-between">
                            <Gamepad2 className="w-5 h-5 text-teal-100" />
                            <GripVertical className="w-3.5 h-3.5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                          </div>
                          <p className="text-[11px] font-bold text-white truncate">nooncraft</p>
                        </div>
                      );
                    }

                    // Fallback for custom installed apps
                    const customApp = appsList.find((a) => a.id === tileId);
                    if (customApp) {
                      return (
                        <div
                          key={customApp.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDrop={(e) => handleDrop(e, idx)}
                          onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
                          onClick={() => handleAppClick(customApp.id)}
                          className={`h-20 bg-indigo-700/80 hover:bg-indigo-600 p-2.5 rounded-lg cursor-pointer transition-all hover:scale-[1.01] active:scale-95 shadow-md flex flex-col justify-between group border ${
                            isDragOver ? 'ring-2 ring-indigo-300 border-white' : 'border-white/10'
                          } ${isDragged ? 'opacity-30' : 'opacity-100'}`}
                          id={`tile-${customApp.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <AppIcon id={customApp.icon} size={22} />
                            <GripVertical className="w-3.5 h-3.5 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                          </div>
                          <p className="text-[11px] font-bold text-white truncate">{customApp.title}</p>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            /* ═══════════════════════════════════════════════════════════════════ */
            /* ABORD 11 FLOATING STYLE START MENU (Center Aligned) */
            /* ═══════════════════════════════════════════════════════════════════ */
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className={`fixed bottom-14 left-1/2 -translate-x-1/2 w-[520px] max-w-[95vw] h-[580px] z-[9999] rounded-2xl shadow-2xl overflow-hidden flex flex-col border select-none ${
                isDarkTheme
                  ? 'acrylic-card-dark text-[#f3f4f6]'
                  : 'acrylic-card text-gray-800'
              }`}
              id="start-menu-panel"
            >
              {/* Search Input bar */}
              <div className="p-6 pb-4">
                <div
                  className={`flex items-center rounded-full px-4.5 py-2.5 border transition-all ${
                    isDarkTheme
                      ? 'bg-black/30 border-white/10 focus-within:bg-black/55 focus-within:ring-2 focus-within:ring-blue-500/80 focus-within:border-blue-500'
                      : 'bg-white border-gray-200/80 hover:shadow-sm focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'
                  }`}
                >
                  <Search className="w-4 h-4 text-gray-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    placeholder={isJa ? 'アプリや設定を検索...' : 'Type to search apps, files, or settings...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-xs font-sans text-inherit"
                    id="start-menu-search"
                  />
                </div>
              </div>

              {/* Apps Pinned Grid */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold tracking-wider uppercase opacity-85">
                    {searchQuery ? (isJa ? '検索結果' : 'Search Results') : (isJa ? 'ピン留め済み' : 'Pinned Applications')}
                  </span>
                  {!searchQuery && (
                    <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 px-2.5 py-0.5 rounded-full font-bold">
                      {isJa ? 'すべてのアプリ' : 'All Apps'}
                    </span>
                  )}
                </div>

                {filteredApps.length === 0 ? (
                  <div className="text-center py-24 text-gray-400 text-xs">
                    <HelpCircle className="w-10 h-10 stroke-[1.25] mx-auto mb-2 opacity-50" />
                    {isJa ? `"${searchQuery}" に一致するアプリはありません` : `No virtual applications found for "${searchQuery}"`}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-y-6 gap-x-2">
                    {filteredApps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => handleAppClick(app.id)}
                        className={`flex flex-col items-center text-center p-3.5 rounded-xl cursor-pointer transition-all duration-150 border border-transparent ${
                          isDarkTheme
                            ? 'hover:bg-white/5 hover:border-white/5 active:scale-95'
                            : 'hover:bg-gray-100/80 hover:border-gray-200/50 active:scale-95 shadow-2xs hover:shadow-sm'
                        }`}
                        id={`start-app-shortcut-${app.id}`}
                      >
                        <AppIcon id={app.icon} size={40} className="mb-2" />
                        <span className="text-xs font-semibold leading-tight truncate w-full px-1">
                          {app.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Start Menu Bottom Footer Bar */}
              <div
                className={`p-5 px-6 border-t flex items-center justify-between text-xs select-none ${
                  isDarkTheme ? 'bg-black/40 border-white/5' : 'bg-gray-50/50 border-gray-200/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-inner shadow-black/10">
                    <User className="w-4.5 h-4.5 text-white/90" />
                  </div>
                  <div className="text-left leading-tight">
                    <p className="font-bold">{username}</p>
                    <p className="text-[10px] text-gray-400">{isJa ? 'ローカル アカウント' : 'Local Account'}</p>
                  </div>
                </div>

                {/* Power Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onClose();
                      if (onRestartSystem) onRestartSystem();
                    }}
                    className={`p-2 rounded-lg transition-colors relative group ${
                      isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-gray-200'
                    }`}
                    title={isJa ? '再起動 (Restart)' : 'Restart'}
                    id="start-power-restart"
                  >
                    <RotateCw className="w-4 h-4 text-emerald-500 hover:rotate-180 transition-transform duration-300" />
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      if (onShutdownSystem) {
                        onShutdownSystem();
                      } else {
                        alert(isJa ? 'サインアウトしました' : 'Signed out');
                      }
                    }}
                    className={`p-2 rounded-lg transition-colors relative group ${
                      isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-gray-200'
                    }`}
                    title={isJa ? 'ロック / サインアウト' : 'Lock / Sign out'}
                    id="start-power-lock"
                  >
                    <Power className="w-4 h-4 text-blue-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};
