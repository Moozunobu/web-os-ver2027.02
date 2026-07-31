import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Trash2, 
  Globe, 
  Flame, 
  Check, 
  Play, 
  AppWindow, 
  RefreshCw, 
  AlertTriangle, 
  ChevronRight, 
  Info,
  Package,
  Layers,
  Gamepad2,
  Wrench,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Loader2
} from 'lucide-react';
import { AppIcon } from '../AppIcon';
import { SYSTEM_STORE_APPS, StoreAppInfo, getInstalledSystemAppIds, setInstalledSystemAppIds } from '../../data/storeApps';
import { findAvailableGridSpot } from '../../utils/grid';

interface InstalledCustomApp {
  id: string;
  title: string;
  url: string;
  iconChar: string;
  installedAt: string;
}

const CURATED_CUSTOM_APPS = [
  {
    id: 'curated-tetris',
    title: 'Tetris Web Classic',
    url: 'https://raw.githack.com/jakesgordon/javascript-tetris/master/index.html',
    desc: 'Pure HTML5/JS classic Tetris puzzle block game.',
    iconChar: '🎮',
    category: 'Game',
    developer: 'Jake Gordon'
  },
  {
    id: 'curated-pixel',
    title: 'Pixel Art Paint',
    url: 'https://raw.githack.com/mitchgavan/react-pixel-art/master/index.html',
    desc: 'Fun retro 8-bit style canvas drawing paint app.',
    iconChar: '🎨',
    category: 'Creative',
    developer: 'Mitch Gavan'
  },
  {
    id: 'curated-flappy',
    title: 'Floppy Bird',
    url: 'https://raw.githack.com/nebez/floppybird/master/index.html',
    desc: 'The addictive flapping bird challenge with audio and physics.',
    iconChar: '🐦',
    category: 'Game',
    developer: 'Nebez Briefkani'
  },
  {
    id: 'curated-flexbox',
    title: 'Flexbox Froggy',
    url: 'https://flexboxfroggy.com/',
    desc: 'Learn CSS layout alignments by coding for cute frogs.',
    iconChar: '🐸',
    category: 'Education',
    developer: 'Codepip'
  },
  {
    id: 'curated-emoji',
    title: 'Emoji Finder Studio',
    url: 'https://emojifinder.com/',
    desc: 'Search, copy, and explore the entire Unicode emoji catalog.',
    iconChar: '🔍',
    category: 'Utilities',
    developer: 'EmojiFinder'
  }
];

export const NoobStoreApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'apps' | 'games' | 'library' | 'custom'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [installedSystemApps, setInstalledSystemApps] = useState<string[]>([]);
  const [installedCustomApps, setInstalledCustomApps] = useState<InstalledCustomApp[]>([]);
  const [selectedApp, setSelectedApp] = useState<StoreAppInfo | null>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Download Progress State
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});

  // Custom App Importer State
  const [urlInput, setUrlInput] = useState('');
  const [searchedUrl, setSearchedUrl] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customIconChar, setCustomIconChar] = useState('🌐');

  // Load installed apps
  const reloadInstalledApps = () => {
    setInstalledSystemApps(getInstalledSystemAppIds());
    try {
      const stored = localStorage.getItem('noobstore_installed_apps');
      if (stored) {
        setInstalledCustomApps(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    reloadInstalledApps();
    window.addEventListener('webos_installed_apps_changed', reloadInstalledApps);
    window.addEventListener('webos_desktop_items_changed', reloadInstalledApps);
    return () => {
      window.removeEventListener('webos_installed_apps_changed', reloadInstalledApps);
      window.removeEventListener('webos_desktop_items_changed', reloadInstalledApps);
    };
  }, []);

  // Animated Download & Install
  const startDownloadApp = (app: StoreAppInfo) => {
    if (downloadProgress[app.id] !== undefined) return;

    setDownloadProgress((prev) => ({ ...prev, [app.id]: 5 }));

    let currentProgress = 5;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 20) + 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          handleInstallSystemApp(app);
          setDownloadProgress((prev) => {
            const next = { ...prev };
            delete next[app.id];
            return next;
          });
        }, 300);
      } else {
        setDownloadProgress((prev) => ({ ...prev, [app.id]: currentProgress }));
      }
    }, 250);
  };

  // System App Install Handler
  const handleInstallSystemApp = (app: StoreAppInfo) => {
    const current = getInstalledSystemAppIds();
    if (!current.includes(app.id)) {
      const updated = [...current, app.id];
      setInstalledSystemAppIds(updated);
      setInstalledSystemApps(updated);

      // Add shortcut to Desktop if not present
      try {
        const storedItems = localStorage.getItem('webos_desktop_items_v2');
        let desktopItems = storedItems ? JSON.parse(storedItems) : [];
        if (!desktopItems.some((item: any) => item.appId === app.id || item.id === app.id)) {
          const spot = findAvailableGridSpot(desktopItems);
          desktopItems.push({
            id: app.id,
            appId: app.id,
            title: app.titleJa,
            icon: app.icon,
            type: 'app',
            x: spot.x,
            y: spot.y,
          });
          localStorage.setItem('webos_desktop_items_v2', JSON.stringify(desktopItems));
          window.dispatchEvent(new Event('webos_desktop_items_changed'));
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // System App Uninstall Handler
  const handleUninstallSystemApp = (appId: string) => {
    const current = getInstalledSystemAppIds();
    const updated = current.filter((id) => id !== appId);
    setInstalledSystemAppIds(updated);
    setInstalledSystemApps(updated);

    // Remove shortcut from Desktop
    try {
      const storedItems = localStorage.getItem('webos_desktop_items_v2');
      if (storedItems) {
        let desktopItems = JSON.parse(storedItems);
        desktopItems = desktopItems.filter((item: any) => item.appId !== appId && item.id !== appId);
        localStorage.setItem('webos_desktop_items_v2', JSON.stringify(desktopItems));
        window.dispatchEvent(new Event('webos_desktop_items_changed'));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Launch App directly in OS
  const handleLaunchApp = (appId: string) => {
    window.dispatchEvent(new CustomEvent('webos_launch_custom_app', {
      detail: { appId }
    }));
  };

  // Custom Web App Install Handler
  const handleInstallCustomWeb = (title: string, url: string, iconChar: string) => {
    if (!title || !url) return;
    let latest: InstalledCustomApp[] = [];
    try {
      const stored = localStorage.getItem('noobstore_installed_apps');
      if (stored) latest = JSON.parse(stored);
    } catch (e) {}

    if (latest.some(a => a.url === url)) {
      alert('このURLのアプリは既にインストールされています。');
      return;
    }

    const newId = 'custom-app-' + Date.now();
    const newApp: InstalledCustomApp = {
      id: newId,
      title: title.trim(),
      url: url.trim(),
      iconChar,
      installedAt: new Date().toISOString(),
    };

    const updated = [...latest, newApp];
    localStorage.setItem('noobstore_installed_apps', JSON.stringify(updated));

    // Desktop shortcut
    try {
      const storedDesktop = localStorage.getItem('webos_desktop_items_v2');
      let items = storedDesktop ? JSON.parse(storedDesktop) : [];
      const spot = findAvailableGridSpot(items);
      items.push({
        id: newId,
        appId: newId,
        title: title.trim(),
        icon: 'browser',
        type: 'app',
        x: spot.x,
        y: spot.y,
      });
      localStorage.setItem('webos_desktop_items_v2', JSON.stringify(items));
      window.dispatchEvent(new Event('webos_desktop_items_changed'));
    } catch (e) {}

    window.dispatchEvent(new Event('webos_installed_apps_changed'));
    setInstalledCustomApps(updated);
    setUrlInput('');
    setSearchedUrl(null);
  };

  const handleUninstallCustomWeb = (id: string) => {
    const updated = installedCustomApps.filter(a => a.id !== id);
    localStorage.setItem('noobstore_installed_apps', JSON.stringify(updated));

    try {
      const storedDesktop = localStorage.getItem('webos_desktop_items_v2');
      if (storedDesktop) {
        let items = JSON.parse(storedDesktop);
        items = items.filter((item: any) => item.id !== id && item.appId !== id);
        localStorage.setItem('webos_desktop_items_v2', JSON.stringify(items));
        window.dispatchEvent(new Event('webos_desktop_items_changed'));
      }
    } catch (e) {}

    window.dispatchEvent(new Event('webos_installed_apps_changed'));
    setInstalledCustomApps(updated);
  };

  // Filter apps based on search and tab
  const featuredAppsList = SYSTEM_STORE_APPS.filter(a => ['minecraft', 'word', 'sprout', 'tetris', 'excel'].includes(a.id));

  const filteredApps = SYSTEM_STORE_APPS.filter(app => {
    const matchesSearch = app.titleJa.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.descriptionJa.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'apps') return ['productivity', 'utilities', 'creativity', 'devtools', 'social'].includes(app.category);
    if (activeTab === 'games') return app.category === 'games';
    return true;
  });

  const featuredApp = featuredAppsList[featuredIndex] || featuredAppsList[0];

  return (
    <div className="w-full h-full bg-[#0f1117] text-zinc-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Top Aboard Store Header Navigation */}
      <div className="h-14 bg-[#181a20]/90 border-b border-zinc-800/80 px-6 flex items-center justify-between shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-6">
          {/* Aboard Store Brand Header */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-1 shadow-md shadow-blue-900/30">
              <AppIcon id="noobstore" size={20} />
            </div>
            <span className="font-bold text-sm tracking-tight text-white font-sans">
              Aboard Store
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setActiveTab('home'); setSearchQuery(''); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === 'home'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              ホーム
            </button>
            <button
              onClick={() => { setActiveTab('apps'); setSearchQuery(''); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === 'apps'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              アプリ
            </button>
            <button
              onClick={() => { setActiveTab('games'); setSearchQuery(''); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === 'games'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              ゲーム
            </button>
            <button
              onClick={() => { setActiveTab('library'); setSearchQuery(''); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === 'library'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              ライブラリ ({installedSystemApps.length + installedCustomApps.length})
            </button>
            <button
              onClick={() => { setActiveTab('custom'); setSearchQuery(''); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === 'custom'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              カスタム Web
            </button>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="アプリやゲームを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-700/60 rounded-full pl-8 pr-4 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Search Filter Mode Active */}
        {searchQuery ? (
          <div>
            <h2 className="text-sm font-bold text-zinc-300 mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-400" />
              「{searchQuery}」の検索結果 ({filteredApps.length} 件)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  isInstalled={installedSystemApps.includes(app.id)}
                  downloadProgress={downloadProgress[app.id]}
                  onInstall={() => startDownloadApp(app)}
                  onUninstall={() => handleUninstallSystemApp(app.id)}
                  onLaunch={() => handleLaunchApp(app.id)}
                  onClick={() => setSelectedApp(app)}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* HOME TAB CONTENT */}
            {activeTab === 'home' && (
              <>
                {/* Hero Featured Carousel Banner */}
                {featuredApp && (
                  <div className={`relative w-full rounded-2xl overflow-hidden p-8 border border-zinc-700/50 bg-gradient-to-r ${featuredApp.bannerGradient} flex flex-col justify-between shadow-2xl min-h-[220px]`}>
                    <div className="flex items-start justify-between">
                      <div className="max-w-xl space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold tracking-widest uppercase bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                            注目のアプリケーション
                          </span>
                          <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            検証済み安全
                          </span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight">
                          {featuredApp.titleJa}
                        </h1>
                        <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                          {featuredApp.descriptionJa}
                        </p>
                      </div>

                      <div className="w-20 h-20 rounded-2xl bg-zinc-900/80 border border-white/10 p-3 shadow-xl shrink-0 flex items-center justify-center">
                        <AppIcon id={featuredApp.icon} size={56} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-4">
                        {installedSystemApps.includes(featuredApp.id) ? (
                          <button
                            onClick={() => handleLaunchApp(featuredApp.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-lg transition-all active:scale-95"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            開く
                          </button>
                        ) : downloadProgress[featuredApp.id] !== undefined ? (
                          <div className="relative overflow-hidden bg-blue-950 border border-blue-500/50 rounded-lg px-6 py-2.5 text-xs font-bold text-blue-200 flex items-center gap-2 shadow-lg min-w-[150px] justify-center">
                            <div 
                              className="absolute left-0 top-0 bottom-0 bg-blue-600/60 transition-all duration-300"
                              style={{ width: `${downloadProgress[featuredApp.id]}%` }}
                            />
                            <Loader2 className="w-4 h-4 animate-spin relative z-10 text-blue-300" />
                            <span className="relative z-10">ダウンロード中... {downloadProgress[featuredApp.id]}%</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => startDownloadApp(featuredApp)}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-lg transition-all active:scale-95"
                          >
                            <Download className="w-4 h-4" />
                            入手 (無料)
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedApp(featuredApp)}
                          className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all border border-zinc-700"
                        >
                          詳細を見る
                        </button>
                      </div>

                      {/* Carousel Indicator Dots */}
                      <div className="flex items-center gap-1.5">
                        {featuredAppsList.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setFeaturedIndex(idx)}
                            className={`h-2 rounded-full transition-all ${
                              idx === featuredIndex ? 'w-6 bg-blue-500' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Section: Popular Apps */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-400" />
                      人気のおすすめアプリ
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SYSTEM_STORE_APPS.slice(0, 6).map((app) => (
                      <AppCard
                        key={app.id}
                        app={app}
                        isInstalled={installedSystemApps.includes(app.id)}
                        downloadProgress={downloadProgress[app.id]}
                        onInstall={() => startDownloadApp(app)}
                        onUninstall={() => handleUninstallSystemApp(app.id)}
                        onLaunch={() => handleLaunchApp(app.id)}
                        onClick={() => setSelectedApp(app)}
                      />
                    ))}
                  </div>
                </div>

                {/* Section: Featured Games */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-purple-400" />
                      人気のゲームコレクション
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SYSTEM_STORE_APPS.filter(a => a.category === 'games').slice(0, 6).map((app) => (
                      <AppCard
                        key={app.id}
                        app={app}
                        isInstalled={installedSystemApps.includes(app.id)}
                        downloadProgress={downloadProgress[app.id]}
                        onInstall={() => startDownloadApp(app)}
                        onUninstall={() => handleUninstallSystemApp(app.id)}
                        onLaunch={() => handleLaunchApp(app.id)}
                        onClick={() => setSelectedApp(app)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* APPS TAB */}
            {activeTab === 'apps' && (
              <div className="space-y-4">
                <h2 className="text-lg font-extrabold text-zinc-100 tracking-tight">生産性・ツール アプリケーション</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SYSTEM_STORE_APPS.filter(a => a.category !== 'games').map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      isInstalled={installedSystemApps.includes(app.id)}
                      downloadProgress={downloadProgress[app.id]}
                      onInstall={() => startDownloadApp(app)}
                      onUninstall={() => handleUninstallSystemApp(app.id)}
                      onLaunch={() => handleLaunchApp(app.id)}
                      onClick={() => setSelectedApp(app)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* GAMES TAB */}
            {activeTab === 'games' && (
              <div className="space-y-4">
                <h2 className="text-lg font-extrabold text-zinc-100 tracking-tight">エンターテインメント & ゲーム</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SYSTEM_STORE_APPS.filter(a => a.category === 'games').map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      isInstalled={installedSystemApps.includes(app.id)}
                      downloadProgress={downloadProgress[app.id]}
                      onInstall={() => startDownloadApp(app)}
                      onUninstall={() => handleUninstallSystemApp(app.id)}
                      onLaunch={() => handleLaunchApp(app.id)}
                      onClick={() => setSelectedApp(app)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* LIBRARY (INSTALLED) TAB */}
            {activeTab === 'library' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-zinc-100">インストール済みライブラリ</h2>
                    <p className="text-xs text-zinc-400 mt-1">Abord OS に追加されたすべてのアプリ一覧です。</p>
                  </div>
                  <span className="text-xs font-semibold bg-zinc-800 px-3 py-1 rounded-full text-zinc-300">
                    計 {installedSystemApps.length + installedCustomApps.length} 個のアプリ
                  </span>
                </div>

                {installedSystemApps.length === 0 && installedCustomApps.length === 0 ? (
                  <div className="text-center py-20 text-zinc-500 space-y-3">
                    <Package className="w-12 h-12 mx-auto stroke-1 opacity-40" />
                    <p className="text-sm font-medium">インストール済みのアプリはありません。</p>
                    <button
                      onClick={() => setActiveTab('home')}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg"
                    >
                      ストアでアプリを探す
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* System Apps */}
                    {SYSTEM_STORE_APPS.filter(a => installedSystemApps.includes(a.id)).map((app) => (
                      <div
                        key={app.id}
                        className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700/80 rounded-xl p-4 flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-zinc-950 p-2 border border-zinc-800 flex items-center justify-center">
                            <AppIcon id={app.icon} size={32} />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-zinc-100">{app.titleJa}</h3>
                            <p className="text-xs text-zinc-400">{app.categoryLabelJa} • {app.developer}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleLaunchApp(app.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            起動
                          </button>
                          <button
                            onClick={() => handleUninstallSystemApp(app.id)}
                            className="bg-zinc-800 hover:bg-red-900/50 hover:text-red-300 text-zinc-400 text-xs font-medium px-3 py-2 rounded-lg transition-all border border-zinc-700/60"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Custom Web Apps */}
                    {installedCustomApps.map((app) => (
                      <div
                        key={app.id}
                        className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700/80 rounded-xl p-4 flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center text-xl border border-zinc-800">
                            {app.iconChar || '🌐'}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-zinc-100">{app.title}</h3>
                            <p className="text-xs text-zinc-400 truncate max-w-xs">{app.url}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleLaunchApp(app.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            起動
                          </button>
                          <button
                            onClick={() => handleUninstallCustomWeb(app.id)}
                            className="bg-zinc-800 hover:bg-red-900/50 hover:text-red-300 text-zinc-400 text-xs font-medium px-3 py-2 rounded-lg transition-all border border-zinc-700/60"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CUSTOM WEB APPS TAB */}
            {activeTab === 'custom' && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-100">カスタム Web アプリ インポーター</h2>
                  <p className="text-xs text-zinc-400 mt-1">任意の Web URL や GitHub HTML ページを Abord OS デスクトップアプリとして追加できます。</p>
                </div>

                {/* URL Input Form */}
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300">Web アプリの URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://example.com や GitHub の raw.githack URL..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => {
                          if (!urlInput.trim()) return;
                          let u = urlInput.trim();
                          if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
                          setSearchedUrl(u);
                          setCustomTitle('カスタムアプリ');
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2 rounded-xl"
                      >
                        読み込み
                      </button>
                    </div>
                  </div>

                  {searchedUrl && (
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-zinc-400 font-medium">アプリ名</label>
                          <input
                            type="text"
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-zinc-400 font-medium">アイコン絵文字</label>
                          <input
                            type="text"
                            value={customIconChar}
                            onChange={(e) => setCustomIconChar(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none mt-1"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleInstallCustomWeb(customTitle, searchedUrl, customIconChar)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg transition-all"
                      >
                        このアプリをデスクトップに追加
                      </button>
                    </div>
                  )}
                </div>

                {/* Curated Recommendations */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-200">おすすめの Web アプリ カタログ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {CURATED_CUSTOM_APPS.map((item) => {
                      const isInst = installedCustomApps.some(a => a.url === item.url);
                      return (
                        <div
                          key={item.id}
                          className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-lg border border-zinc-800">
                              {item.iconChar}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-white">{item.title}</h4>
                              <p className="text-[11px] text-zinc-400 leading-tight">{item.desc}</p>
                            </div>
                          </div>

                          {isInst ? (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold">
                              追加済み
                            </span>
                          ) : (
                            <button
                              onClick={() => handleInstallCustomWeb(item.title, item.url, item.iconChar)}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shrink-0"
                            >
                              追加
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* APP DETAILS MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181a20] border border-zinc-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]">
            {/* Modal Header Banner */}
            <div className={`p-6 bg-gradient-to-r ${selectedApp.bannerGradient} flex items-start justify-between border-b border-zinc-800`}>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-zinc-950/90 border border-white/10 p-2.5 shadow-xl flex items-center justify-center">
                  <AppIcon id={selectedApp.icon} size={56} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">{selectedApp.titleJa}</h2>
                  <p className="text-xs text-zinc-300 font-medium">{selectedApp.developer} • {selectedApp.categoryLabelJa}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-zinc-400 font-medium">{selectedApp.size}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {/* Action Bar */}
              <div className="flex items-center justify-between bg-zinc-900/90 p-4 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-zinc-200">Abord OS 安全検証済み</p>
                    <p className="text-[10px] text-zinc-400">悪意のあるコードは検出されませんでした。</p>
                  </div>
                </div>

                {installedSystemApps.includes(selectedApp.id) ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { handleLaunchApp(selectedApp.id); setSelectedApp(null); }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      開く
                    </button>
                    <button
                      onClick={() => handleUninstallSystemApp(selectedApp.id)}
                      className="bg-zinc-800 hover:bg-red-900/50 hover:text-red-300 text-zinc-300 font-semibold text-xs px-3.5 py-2.5 rounded-lg border border-zinc-700"
                    >
                      アンインストール
                    </button>
                  </div>
                ) : downloadProgress[selectedApp.id] !== undefined ? (
                  <div className="relative overflow-hidden bg-blue-950 border border-blue-500/50 rounded-lg px-6 py-2.5 text-xs font-bold text-blue-200 flex items-center gap-2 shadow-lg min-w-[150px] justify-center">
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-blue-600/60 transition-all duration-300"
                      style={{ width: `${downloadProgress[selectedApp.id]}%` }}
                    />
                    <Loader2 className="w-4 h-4 animate-spin relative z-10 text-blue-300" />
                    <span className="relative z-10">ダウンロード中... {downloadProgress[selectedApp.id]}%</span>
                  </div>
                ) : (
                  <button
                    onClick={() => startDownloadApp(selectedApp)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    入手 (無料)
                  </button>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">アプリの概要</h3>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60">
                  {selectedApp.descriptionJa}
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">主な機能</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedApp.featuresJa.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable App Card Component
const AppCard: React.FC<{
  app: StoreAppInfo;
  isInstalled: boolean;
  downloadProgress?: number;
  onInstall: () => void;
  onUninstall: () => void;
  onLaunch: () => void;
  onClick: () => void;
}> = ({ app, isInstalled, downloadProgress, onInstall, onUninstall, onLaunch, onClick }) => {
  return (
    <div className="bg-zinc-900/70 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700/80 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between group shadow-md hover:shadow-xl">
      <div className="flex items-start gap-3.5 cursor-pointer" onClick={onClick}>
        <div className="w-12 h-12 rounded-xl bg-zinc-950 p-2 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <AppIcon id={app.icon} size={32} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="font-bold text-xs text-zinc-100 truncate group-hover:text-blue-400 transition-colors">
              {app.titleJa}
            </h3>
            {app.badge && (
              <span className="text-[9px] font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/30 shrink-0">
                {app.badge}
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-400">{app.categoryLabelJa}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
        <span className="text-[10px] text-zinc-500 font-medium">{app.size}</span>
        {isInstalled ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onLaunch(); }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
            >
              <Play className="w-3 h-3 fill-current" />
              開く
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onUninstall(); }}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900/50 hover:text-red-300 text-zinc-400 text-xs transition-colors"
              title="アンインストール"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : downloadProgress !== undefined ? (
          <div className="relative overflow-hidden bg-blue-950 border border-blue-500/40 rounded-lg px-3 py-1.5 text-[10px] font-bold text-blue-200 flex items-center gap-1.5 min-w-[100px] justify-center">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-blue-600/60 transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            />
            <Loader2 className="w-3 h-3 animate-spin relative z-10 text-blue-300" />
            <span className="relative z-10">{downloadProgress}%</span>
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onInstall(); }}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-4 py-1.5 rounded-lg flex items-center gap-1 shadow-md transition-all active:scale-95"
          >
            <Download className="w-3 h-3" />
            入手
          </button>
        )}
      </div>
    </div>
  );
};
