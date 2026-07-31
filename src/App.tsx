/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppID, WindowInstance, SettingsState, WALLPAPERS, VirtualFile, DesktopItem } from './types';
import { Window } from './components/Window';
import { Taskbar } from './components/Taskbar';
import { StartMenu } from './components/StartMenu';
import { DesktopIcon } from './components/DesktopIcon';
import { DesktopWidgets } from './components/DesktopWidgets';
import { FolderViewWindow } from './components/FolderViewWindow';
import { findAvailableGridSpot, resolveOverlappingItems } from './utils/grid';
import { FolderPlus, Grid, Settings as SettingsIcon, CloudSun, Clock as ClockIcon, StickyNote as StickyNoteIcon } from 'lucide-react';

// App Components
import { BrowserApp } from './components/apps/BrowserApp';
import { NotepadApp } from './components/apps/NotepadApp';
import { CalculatorApp } from './components/apps/CalculatorApp';
import { PaintApp } from './components/apps/PaintApp';
import { FileManagerApp } from './components/apps/FileManagerApp';
import { TerminalApp } from './components/apps/TerminalApp';
import { ExcelApp } from './components/apps/ExcelApp';
import { SettingsApp } from './components/apps/SettingsApp';
import { WordApp } from './components/apps/WordApp';
import { PowerPointApp } from './components/apps/PowerPointApp';
import { RecycleBinApp } from './components/apps/RecycleBinApp';
import { MinecraftApp } from './components/apps/MinecraftApp';
import { VideoEditorApp } from './components/VideoEditorApp';
import { DotsAndBoxesApp } from './components/apps/DotsAndBoxesApp';
import { BlokusApp } from './components/apps/BlokusApp';
import { TetrisApp } from './components/apps/TetrisApp';
import NmapApp from './components/apps/NmapApp';
import FlightSimulatorApp from './components/apps/FlightSimulatorApp';
import { ChameleonGameApp } from './components/apps/ChameleonGameApp';
import { NoobStoreApp } from './components/apps/NoobStoreApp';
import { SproutApp } from './components/apps/SproutApp';
import { AboadApp } from './components/apps/AboadApp';
import { CHAT_APP_HTML } from './components/browserConstants';
import { BootScreen } from './components/BootScreen';
import { LockScreen } from './components/LockScreen';
import { OOBESetup } from './components/OOBESetup';
import { motion, AnimatePresence } from 'motion/react';

const getLocalizedAppTitle = (appId: AppID | string, language: 'ja' | 'en' = 'ja', defaultTitle?: string): string => {
  const isJa = language === 'ja';
  switch (appId) {
    case 'recycle': return isJa ? 'ゴミ箱' : 'Recycle Bin';
    case 'settings': return isJa ? '設定' : 'Settings';
    case 'files': return isJa ? 'ファイル エクスプローラー' : 'File Explorer';
    case 'browser': return isJa ? 'Firefox Web ブラウザ' : 'Firefox Web Browser';
    case 'notepad': return isJa ? 'メモ帳' : 'Notepad';
    case 'calculator': return isJa ? '電卓' : 'Calculator';
    case 'paint': return isJa ? 'ペイント' : 'Paint Tool';
    case 'terminal': return isJa ? 'コマンド プロンプト' : 'Command Prompt';
    case 'excel': return isJa ? 'Excel スプレッドシート' : 'Excel Sheets';
    case 'word': return isJa ? 'Word ドキュメント' : 'Word Document Editor';
    case 'powerpoint': return isJa ? 'PowerPoint プレゼンテーション' : 'PowerPoint Slide Deck';
    case 'minecraft': return isJa ? 'nooncraft' : 'nooncraft';
    case 'videoeditor': return isJa ? 'nooncut ビデオエディター' : 'nooncut Video Editor';
    case 'dotsandboxes': return isJa ? 'ドット＆ボックス' : 'Dots & Boxes';
    case 'blokus': return isJa ? 'ブロックス' : 'Blokus';
    case 'wetalks': return isJa ? 'WeTalks チャット' : 'WeTalks Chat';
    case 'nmap': return isJa ? 'Nmap 演習ターミナル' : 'Nmap Practice Terminal';
    case 'flightsim': return isJa ? '3D フライトシミュレーター' : '3D Flight Simulator';
    case 'chameleon': return isJa ? 'カメレオン かくれんぼ' : 'Chameleon Hide-and-Seek';
    case 'noobstore': return isJa ? 'Abord Store' : 'Abord Store';
    case 'tetris': return isJa ? 'ネオ テトリス' : 'Neo Tetris';
    case 'sprout': return isJa ? 'Sprout Studio (開発環境)' : 'Sprout Studio (IDE)';
    case 'aboad': return 'Aboad';
    default: return defaultTitle || appId;
  }
};

const getDesktopTitle = (item: DesktopItem, isJa: boolean): string => {
  if (item.id === 'recycle') return isJa ? 'ゴミ箱' : 'Recycle Bin';
  if (item.id === 'settings') return isJa ? '設定' : 'Settings';
  if (item.id === 'files') return isJa ? 'ファイル エクスプローラー' : 'File Explorer';
  return item.title;
};

export default function App() {
  // 1. Core noob os State Defaults
  const getInitialWindows = (): WindowInstance[] => {
    return [
      {
        id: 'aboad',
        title: 'Aboad',
        icon: 'aboad',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 120,
        y: 60,
        width: 860,
        height: 580,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 420,
        minHeight: 320,
      },
      {
        id: 'browser',
        title: 'Firefox Web Browser',
        icon: 'browser',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 100,
        y: 50,
        width: 780,
        height: 500,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 420,
        minHeight: 320,
      },
      {
        id: 'notepad',
        title: 'Notepad',
        icon: 'notepad',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 140,
        y: 80,
        width: 580,
        height: 440,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 350,
        minHeight: 250,
      },
      {
        id: 'calculator',
        title: 'Calculator',
        icon: 'calculator',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 220,
        y: 100,
        width: 300,
        height: 440,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 260,
        minHeight: 380,
      },
      {
        id: 'paint',
        title: 'Paint Tool',
        icon: 'paint',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 160,
        y: 60,
        width: 700,
        height: 490,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 500,
        minHeight: 380,
      },
      {
        id: 'files',
        title: 'File Explorer',
        icon: 'files',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 180,
        y: 110,
        width: 720,
        height: 460,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 450,
        minHeight: 300,
      },
      {
        id: 'terminal',
        title: 'Command Prompt',
        icon: 'terminal',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 200,
        y: 130,
        width: 620,
        height: 400,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 400,
        minHeight: 250,
      },
      {
        id: 'excel',
        title: 'Excel Sheets',
        icon: 'excel',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 120,
        y: 120,
        width: 760,
        height: 480,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 500,
        minHeight: 300,
      },
      {
        id: 'settings',
        title: 'Settings',
        icon: 'settings',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 240,
        y: 90,
        width: 580,
        height: 450,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 400,
        minHeight: 300,
      },
      {
        id: 'word',
        title: 'Word Document Editor',
        icon: 'word',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 150,
        y: 70,
        width: 740,
        height: 520,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 400,
        minHeight: 300,
      },
      {
        id: 'powerpoint',
        title: 'PowerPoint Slide Deck',
        icon: 'powerpoint',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 170,
        y: 100,
        width: 760,
        height: 520,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 500,
        minHeight: 380,
      },
      {
        id: 'recycle',
        title: 'Recycle Bin',
        icon: 'recycle',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 190,
        y: 120,
        width: 600,
        height: 440,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 400,
        minHeight: 300,
      },
      {
        id: 'minecraft',
        title: 'nooncraft (Minecraft Clone)',
        icon: 'minecraft',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 80,
        y: 40,
        width: 820,
        height: 560,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 450,
        minHeight: 350,
      },
      {
        id: 'videoeditor',
        title: 'nooncut Video Editor',
        icon: 'videoeditor',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 60,
        y: 40,
        width: 960,
        height: 600,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 700,
        minHeight: 500,
      },
      {
        id: 'dotsandboxes',
        title: 'Dots & Boxes',
        icon: 'dotsandboxes',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 140,
        y: 80,
        width: 480,
        height: 580,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 440,
        minHeight: 560,
      },
      {
        id: 'blokus',
        title: 'Blokus',
        icon: 'blokus',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 160,
        y: 60,
        width: 820,
        height: 650,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 640,
        minHeight: 580,
      },
      {
        id: 'wetalks',
        title: 'We talks Chat',
        icon: 'wetalks',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 180,
        y: 80,
        width: 460,
        height: 650,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 360,
        minHeight: 500,
      },
      {
        id: 'nmap',
        title: 'Nmap Practice Terminal',
        icon: 'nmap',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 90,
        y: 50,
        width: 900,
        height: 580,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 600,
        minHeight: 400,
      },
      {
        id: 'flightsim',
        title: '3D Flight Simulator',
        icon: 'flightsim',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 60,
        y: 40,
        width: 1000,
        height: 640,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 800,
        minHeight: 500,
      },
      {
        id: 'chameleon',
        title: 'Chameleon Hide-and-Seek',
        icon: 'chameleon',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 80,
        y: 60,
        width: 900,
        height: 600,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 700,
        minHeight: 500,
      },
      {
        id: 'noobstore',
        title: 'Abord Store',
        icon: 'noobstore',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 140,
        y: 60,
        width: 850,
        height: 580,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 640,
        minHeight: 480,
      },
      {
        id: 'tetris',
        title: 'Neo Tetris',
        icon: 'tetris',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 150,
        y: 50,
        width: 800,
        height: 600,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 400,
        minHeight: 500,
      },
      {
        id: 'sprout',
        title: 'Sprout Studio (IDE & Interpreter)',
        icon: 'sprout',
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
        x: 120,
        y: 60,
        width: 850,
        height: 620,
        prevX: 0,
        prevY: 0,
        prevWidth: 0,
        prevHeight: 0,
        zIndex: 10,
        minWidth: 500,
        minHeight: 400,
      },
    ];
  };

  const HIDDEN_APP_IDS = new Set([
    'browser',
    'notepad',
    'calculator',
    'paint',
    'word',
    'powerpoint',
    'minecraft',
    'videoeditor',
    'dotsandboxes',
    'blokus',
    'wetalks',
    'tetris',
    'sprout',
    'chameleon',
    'flightsim',
    'nmap',
    'terminal',
    'excel',
    'aboad'
  ]);

  const [openWindows, setOpenWindows] = useState<WindowInstance[]>(getInitialWindows);
  const [pinnedAppIds, setPinnedAppIds] = useState<AppID[]>(() => {
    try {
      const saved = localStorage.getItem('webos_pinned_apps');
      if (saved) {
        const parsed = JSON.parse(saved) as AppID[];
        return parsed.length > 0 ? parsed : ['files', 'settings', 'noobstore'];
      }
      return ['files', 'settings', 'noobstore'];
    } catch {
      return ['files', 'settings', 'noobstore'];
    }
  });

  const handleTogglePin = (appId: AppID) => {
    setPinnedAppIds((prev) => {
      const isPinned = prev.includes(appId);
      const next = isPinned ? prev.filter((id) => id !== appId) : [...prev, appId];
      try {
        localStorage.setItem('webos_pinned_apps', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  };

  const [activeWindowId, setActiveWindowId] = useState<AppID | null>(null);
  const [isStartOpen, setIsStartOpen] = useState(false);

  // Desktop Items (with Drag & Drop, deletion, recycle bin status)
  const getDefaultDesktopItems = (): DesktopItem[] => {
    return [
      { id: 'recycle', appId: 'recycle', title: 'Recycle Bin', icon: 'recycle', type: 'recycle', x: 24, y: 24 },
      { id: 'settings', appId: 'settings', title: 'Settings', icon: 'settings', type: 'app', x: 24, y: 124 },
      { id: 'files', appId: 'files', title: 'File Explorer', icon: 'files', type: 'app', x: 24, y: 224 },
      { id: 'noobstore', appId: 'noobstore', title: 'Aboard Store', icon: 'noobstore', type: 'app', x: 24, y: 324 },
    ];
  };

  const [desktopItems, setDesktopItems] = useState<DesktopItem[]>([]);
  const [activeFolder, setActiveFolder] = useState<DesktopItem | null>(null);
  const [fileManagerFolderTarget, setFileManagerFolderTarget] = useState<string | null>(null);
  const [desktopContextMenu, setDesktopContextMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('webos_app_origin', window.location.origin);
    } catch(e) {}

    const loadItems = () => {
      try {
        let installedSysApps: string[] = [];
        try {
          const sysSaved = localStorage.getItem('webos_installed_system_apps');
          if (sysSaved) installedSysApps = JSON.parse(sysSaved);
        } catch (e) {}

        const stored = localStorage.getItem('webos_desktop_items_v2');
        if (stored) {
          let parsed = JSON.parse(stored) as DesktopItem[];
          let changed = false;

          const originalLen = parsed.length;
          parsed = parsed.filter((item) => {
            const appId = item.appId || item.id;
            if (HIDDEN_APP_IDS.has(appId) && !installedSysApps.includes(appId)) return false;
            if (item.id === 'welcome-shortcut' || item.fileName === 'welcome.txt') return false;
            return true;
          });

          if (parsed.length !== originalLen) {
            changed = true;
          }

          // Ensure standard items exist
          const hasRecycle = parsed.some((item) => item.id === 'recycle');
          const hasSettings = parsed.some((item) => item.id === 'settings');
          const hasFiles = parsed.some((item) => item.id === 'files');
          const hasStore = parsed.some((item) => item.id === 'noobstore' || item.appId === 'noobstore');

          if (!hasRecycle) {
            parsed.push({ id: 'recycle', appId: 'recycle', title: 'Recycle Bin', icon: 'recycle', type: 'recycle', x: 24, y: 24 });
            changed = true;
          }
          if (!hasSettings) {
            parsed.push({ id: 'settings', appId: 'settings', title: 'Settings', icon: 'settings', type: 'app', x: 24, y: 124 });
            changed = true;
          }
          if (!hasFiles) {
            parsed.push({ id: 'files', appId: 'files', title: 'File Explorer', icon: 'files', type: 'app', x: 24, y: 224 });
            changed = true;
          }
          if (!hasStore) {
            parsed.push({ id: 'noobstore', appId: 'noobstore', title: 'Aboard Store', icon: 'noobstore', type: 'app', x: 24, y: 324 });
            changed = true;
          }

          parsed = parsed.map((item) => {
            if (item.id === 'recycle') return { ...item, x: 24, y: 24 };
            if (item.id === 'settings') return { ...item, x: 24, y: 124 };
            if (item.id === 'files') return { ...item, x: 24, y: 224 };
            return item;
          });

          // Automatically resolve overlapping icons on desktop
          const { items: resolved, changed: overlapChanged } = resolveOverlappingItems(parsed);
          parsed = resolved;
          if (overlapChanged) changed = true;

          const orderMap: Record<string, number> = { recycle: 0, settings: 1, files: 2 };
          parsed.sort((a, b) => (orderMap[a.id] ?? 99) - (orderMap[b.id] ?? 99));

          localStorage.setItem('webos_desktop_items_v2', JSON.stringify(parsed));
          setDesktopItems(parsed);
        } else {
          const defaults = getDefaultDesktopItems();
          localStorage.setItem('webos_desktop_items_v2', JSON.stringify(defaults));
          setDesktopItems(defaults);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const handleLaunchCustom = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.appId) {
        handleLaunchApp(customEvent.detail.appId);
      }
    };

    loadItems();
    const handleDesktopChange = () => {
      setTimeout(loadItems, 0);
    };
    window.addEventListener('webos_desktop_items_changed', handleDesktopChange);
    window.addEventListener('webos_launch_custom_app', handleLaunchCustom);
    return () => {
      window.removeEventListener('webos_desktop_items_changed', handleDesktopChange);
      window.removeEventListener('webos_launch_custom_app', handleLaunchCustom);
    };
  }, []);

  const handleDragStop = (id: string, newX: number, newY: number) => {
    setDesktopItems((prev) => {
      const itemToMove = prev.find((i) => i.id === id);
      // Check if dropped onto an existing folder icon
      const targetFolder = prev.find(
        (folder) =>
          folder.type === 'folder' &&
          folder.id !== id &&
          !folder.isDeleted &&
          !folder.folderId &&
          Math.abs(folder.x - newX) < 55 &&
          Math.abs(folder.y - newY) < 55
      );

      let updated: DesktopItem[];
      if (targetFolder && itemToMove && itemToMove.type !== 'folder') {
        // Move item inside folder
        updated = prev.map((item) =>
          item.id === id ? { ...item, folderId: targetFolder.id } : item
        );
      } else {
        updated = prev.map((item) =>
          item.id === id ? { ...item, x: newX, y: newY } : item
        );
      }

      try {
        localStorage.setItem('webos_desktop_items_v2', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    window.dispatchEvent(new Event('webos_desktop_items_changed'));
  };

  const handleMoveToFolder = (itemId: string, folderId: string) => {
    setDesktopItems((prev) => {
      const updated = prev.map((item) =>
        item.id === itemId ? { ...item, folderId } : item
      );
      try {
        localStorage.setItem('webos_desktop_items_v2', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    window.dispatchEvent(new Event('webos_desktop_items_changed'));
  };

  const handleCreateFolder = () => {
    const spot = findAvailableGridSpot(desktopItems);
    const newFolder: DesktopItem = {
      id: 'folder-' + Date.now(),
      title: settings.language === 'ja' ? '新しいフォルダ' : 'New Folder',
      icon: 'folder',
      type: 'folder',
      x: spot.x,
      y: spot.y,
    };

    setDesktopItems((prev) => {
      const updated = [...prev, newFolder];
      try {
        localStorage.setItem('webos_desktop_items_v2', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    window.dispatchEvent(new Event('webos_desktop_items_changed'));
  };

  const handleRenameItem = (id: string, newTitle: string) => {
    setDesktopItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, title: newTitle } : item
      );
      try {
        localStorage.setItem('webos_desktop_items_v2', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    window.dispatchEvent(new Event('webos_desktop_items_changed'));
  };

  const handleDeleteItem = (id: string) => {
    setDesktopItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isDeleted: true } : item
      );
      try {
        localStorage.setItem('webos_desktop_items_v2', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    window.dispatchEvent(new Event('webos_desktop_items_changed'));
  };

  const handleOpenItem = (item: DesktopItem) => {
    if (item.type === 'folder') {
      setFileManagerFolderTarget(item.id);
      handleLaunchApp('files');
    } else if (item.type === 'recycle') {
      handleLaunchApp('recycle');
    } else if (item.type === 'app' && item.appId) {
      handleLaunchApp(item.appId);
    } else if (item.type === 'file') {
      if (item.fileName === 'welcome.txt') {
        handleOpenFileInNotepad(
          'welcome.txt',
          'Welcome to Abord OS!\n\nDouble click on Notepad, Paint, or any desktop icons to get started.\n\nAll your work is automatically saved to LocalStorage so you can close this browser tab and return anytime.'
        );
      } else {
        try {
          const stored = localStorage.getItem('webos_files');
          if (stored) {
            const files: VirtualFile[] = JSON.parse(stored);
            const found = files.find(f => f.name === item.title || f.name === item.fileName);
            if (found) {
              handleOpenFileInNotepad(found.name, found.content);
              return;
            }
          }
        } catch (e) {
          console.error(e);
        }
        handleOpenFileInNotepad(item.title, '');
      }
    }
  };

  const isTrashFull = desktopItems.some(item => item.isDeleted === true);

  // 2. Settings State & Persistence
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = localStorage.getItem('webos_settings_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          wallpaper: parsed.wallpaper || WALLPAPERS[0].url,
          isDarkTheme: parsed.isDarkTheme ?? true,
          isToggleTaskbarWithQ: parsed.isToggleTaskbarWithQ ?? true,
          taskbarAlignment: parsed.taskbarAlignment || 'left',
          taskbarBaseColor: parsed.taskbarBaseColor || 'dark',
          taskbarOpacity: parsed.taskbarOpacity !== undefined ? parsed.taskbarOpacity : 85,
          language: parsed.language || 'ja',
          timezone: parsed.timezone || 'Asia/Tokyo',
          region: parsed.region || 'Japan',
          username: parsed.username || 'User',
          usePassword: parsed.usePassword ?? false,
          password: parsed.password || '',
          wallpaperImageHeight: parsed.wallpaperImageHeight || 'low',
          showWeatherWidget: parsed.showWeatherWidget ?? true,
          showClockWidget: parsed.showClockWidget ?? true,
          showQuickNotesWidget: parsed.showQuickNotesWidget ?? true,
          weatherCity: parsed.weatherCity || 'Tokyo',
          clockWidgetType: parsed.clockWidgetType || 'digital',
          showDesktopWeatherWidget: parsed.showDesktopWeatherWidget ?? false,
          showDesktopClockWidget: parsed.showDesktopClockWidget ?? false,
          showDesktopNotesWidget: parsed.showDesktopNotesWidget ?? false,
          desktopWidgetPositions: parsed.desktopWidgetPositions,
        };
      }
      // Migrate legacy keys if present
      let wall = localStorage.getItem('webos_wallpaper') || WALLPAPERS[0].url;
      const theme = localStorage.getItem('webos_theme_dark');
      const qToggle = localStorage.getItem('webos_q_taskbar_toggle') !== 'false';
      return {
        wallpaper: wall,
        isDarkTheme: theme === 'true',
        isToggleTaskbarWithQ: qToggle,
        taskbarAlignment: 'left',
        taskbarBaseColor: 'dark',
        taskbarOpacity: 85,
        language: 'ja',
        timezone: 'Asia/Tokyo',
        region: 'Japan',
        username: 'User',
        usePassword: false,
        password: '',
        wallpaperImageHeight: 'low',
        showWeatherWidget: true,
        showClockWidget: true,
        showQuickNotesWidget: true,
        weatherCity: 'Tokyo',
        clockWidgetType: 'digital',
        showDesktopWeatherWidget: false,
        showDesktopClockWidget: false,
        showDesktopNotesWidget: false,
      };
    } catch {
      return {
        wallpaper: WALLPAPERS[0].url,
        isDarkTheme: true,
        isToggleTaskbarWithQ: true,
        taskbarAlignment: 'left',
        taskbarBaseColor: 'dark',
        taskbarOpacity: 85,
        language: 'ja',
        timezone: 'Asia/Tokyo',
        region: 'Japan',
        username: 'User',
        usePassword: false,
        password: '',
        wallpaperImageHeight: 'low',
        showWeatherWidget: true,
        showClockWidget: true,
        showQuickNotesWidget: true,
        weatherCity: 'Tokyo',
        clockWidgetType: 'digital',
        showDesktopWeatherWidget: false,
        showDesktopClockWidget: false,
        showDesktopNotesWidget: false,
      };
    }
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isOOBECompleted, setIsOOBECompleted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('webos_oobe_completed') === 'true';
    } catch {
      return false;
    }
  });

  const handleCompleteOOBE = (configuredSettings: SettingsState) => {
    handleUpdateSettings(configuredSettings);
    try {
      localStorage.setItem('webos_oobe_completed', 'true');
    } catch (e) {
      console.error(e);
    }
    setIsOOBECompleted(true);
    setIsBooting(true);
  };

  const handleUpdateSettings = (newSettings: SettingsState) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('webos_settings_v3', JSON.stringify(newSettings));
      localStorage.setItem('webos_wallpaper', newSettings.wallpaper);
      localStorage.setItem('webos_theme_dark', newSettings.isDarkTheme ? 'true' : 'false');
      localStorage.setItem('webos_q_taskbar_toggle', newSettings.isToggleTaskbarWithQ ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Notification Center State & Logic ───
  interface WebOSNotification {
    id: string;
    sender: string;
    text: string;
    timestamp: Date;
    isClosing?: boolean;
    appToLaunch?: string;
    payloadContent?: string;
    payloadTitle?: string;
  }

  const [notifications, setNotifications] = useState<WebOSNotification[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<WebOSNotification[]>([]);
  const [isActionCenterOpen, setIsActionCenterOpen] = useState(false);
  const [isTaskbarHidden, setIsTaskbarHidden] = useState(false);

  const playNotificationSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.08, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      
      playNote(783.99, now, 0.4); // G5
      playNote(1046.50, now + 0.08, 0.6); // C6
    } catch (e) {
      console.warn("AudioContext error:", e);
    }
  };

  const handleCloseNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isClosing: true } : n))
    );
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 300);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setNotificationHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllHistory = () => {
    setNotificationHistory([]);
  };

  const triggerWebOSNotification = (sender: string, text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotif: WebOSNotification = {
      id,
      sender,
      text,
      timestamp: new Date(),
    };
    
    setNotifications((prev) => [...prev, newNotif]);
    setNotificationHistory((prev) => [newNotif, ...prev]);
    playNotificationSound();
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      handleCloseNotification(id);
    }, 5000);
  };

  // Global key listener for toggling taskbar with Q key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!settings.isToggleTaskbarWithQ) return;
      if (e.key.toLowerCase() === 'q') {
        const activeEl = document.activeElement;
        if (activeEl) {
          const tagName = activeEl.tagName.toLowerCase();
          const isContentEditable = activeEl.getAttribute('contenteditable') === 'true';
          if (
            tagName === 'input' ||
            tagName === 'textarea' ||
            tagName === 'select' ||
            isContentEditable
          ) {
            return;
          }
        }
        setIsTaskbarHidden((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.isToggleTaskbarWithQ]);

  useEffect(() => {
    const handleIframeMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'WETALKS_NEW_MESSAGE') {
        triggerWebOSNotification(e.data.payload.sender, e.data.payload.text);
      }
    };
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [settings.isToggleTaskbarWithQ]);

  // State to inject files loaded from explorer into notepad app directly
  const [notepadFilePayload, setNotepadFilePayload] = useState<{ name: string; content: string } | null>(null);
  const [wordFilePayload, setWordFilePayload] = useState<{ name: string; content: string } | null>(null);
  const [sproutFilePayload, setSproutFilePayload] = useState<{ name: string; content: string } | null>(null);

  // Startup, Reboot, and Shutdown states
  const [isBooting, setIsBooting] = useState<boolean>(false);
  const [isReboot, setIsReboot] = useState<boolean>(false);
  const [isShutDown, setIsShutDown] = useState<boolean>(false);

  const handleSoftReboot = () => {
    setIsReboot(true);
    setIsBooting(true);
    // Close all open windows
    setOpenWindows((prev) =>
      prev.map((win) => ({
        ...win,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
      }))
    );
  };

  const handleShutdown = () => {
    setIsShutDown(true);
    // Close all open windows
    setOpenWindows((prev) =>
      prev.map((win) => ({
        ...win,
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
      }))
    );
  };

  // Listen for administrator broadcasts
  useEffect(() => {
    const handleAdminBroadcast = (e: Event) => {
      const customEvent = e as CustomEvent<{ sender: string; title: string; text: string }>;
      if (customEvent.detail) {
        const { sender, title, text } = customEvent.detail;
        
        // Trigger notification with Word app metadata
        const id = Math.random().toString(36).substring(2, 9);
        const newNotif: WebOSNotification = {
          id,
          sender: sender || '管理者 (Admin)',
          text: `管理者から重要連絡：「${title}」があります。ここをクリックしてWordで開いて確認してください。`,
          timestamp: new Date(),
          appToLaunch: 'word',
          payloadContent: text,
          payloadTitle: title,
        };
        
        setNotifications((prev) => [...prev, newNotif]);
        setNotificationHistory((prev) => [newNotif, ...prev]);
        playNotificationSound();
        
        // Auto-close after 15 seconds to ensure visibility
        setTimeout(() => {
          handleCloseNotification(id);
        }, 15000);
      }
    };
    window.addEventListener('WEBOS_BROADCAST_NOTIFICATION', handleAdminBroadcast);
    return () => window.removeEventListener('WEBOS_BROADCAST_NOTIFICATION', handleAdminBroadcast);
  }, []);

  // Poll online administrator broadcasts from shared server database
  useEffect(() => {
    const getSeenIDs = (): string[] => {
      try {
        const raw = localStorage.getItem('webos_seen_broadcasts');
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    };

    const saveSeenIDs = (ids: string[]) => {
      try {
        localStorage.setItem('webos_seen_broadcasts', JSON.stringify(ids));
      } catch (e) {
        console.error(e);
      }
    };

    const getSafeAbsoluteUrl = (path: string): string => {
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      const cleanPath = path.startsWith('/') ? path : '/' + path;
      try {
        if (window.location && window.location.origin && window.location.origin !== 'null') {
          return window.location.origin + cleanPath;
        }
      } catch (e) {}
      try {
        if (window.location && window.location.href && window.location.href.startsWith('http')) {
          const parsed = new URL(window.location.href);
          return parsed.protocol + '//' + parsed.host + cleanPath;
        }
      } catch (e) {}
      return cleanPath;
    };

    let isFirstRun = true;

    const pollBroadcasts = async () => {
      try {
        const url = getSafeAbsoluteUrl('/api/admin/broadcasts');
        const res = await fetch(url);
        if (!res.ok) return;
        const broadcasts = await res.json();
        
        const seenIds = getSeenIDs();
        const updatedSeen = [...seenIds];
        let hasNew = false;

        broadcasts.forEach((bc: any) => {
          if (!seenIds.includes(bc.id)) {
            updatedSeen.push(bc.id);
            hasNew = true;

            // Only trigger popup notification if this is a subsequent poll, NOT the first load of the page
            if (!isFirstRun) {
              const notifId = bc.id;
              const newNotif: WebOSNotification = {
                id: notifId,
                sender: bc.sender || '管理者 (Admin)',
                text: `管理者から重要連絡：「${bc.title}」があります。ここをクリックしてWordで開いて確認してください。`,
                timestamp: new Date(),
                appToLaunch: 'word',
                payloadContent: bc.text,
                payloadTitle: bc.title,
              };

              setNotifications((prev) => [...prev, newNotif]);
              setNotificationHistory((prev) => [newNotif, ...prev]);
              playNotificationSound();

              // Auto-close after 15 seconds to ensure visibility
              setTimeout(() => {
                handleCloseNotification(notifId);
              }, 15000);
            }
          }
        });

        if (hasNew) {
          saveSeenIDs(updatedSeen);
        }
        isFirstRun = false;
      } catch (err) {
        console.error('Error polling broadcasts:', err);
      }
    };

    // Run first check immediately
    pollBroadcasts();

    // Check for updates every 3 seconds
    const interval = setInterval(pollBroadcasts, 3000);
    return () => clearInterval(interval);
  }, []);

  // Synchronize wallpaper changes on custom event updates
  useEffect(() => {
    const handleWpChange = () => {
      try {
        const wall = localStorage.getItem('webos_wallpaper');
        if (wall) {
          setSettings((prev) => ({ ...prev, wallpaper: wall }));
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('webos_wallpaper_changed', handleWpChange);
    return () => window.removeEventListener('webos_wallpaper_changed', handleWpChange);
  }, []);

  // 3. Focus Manager: Increment Z-Index
  const handleFocusWindow = (id: string) => {
    setActiveWindowId(id as AppID);
    setOpenWindows((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.zIndex), 10);
      return prev.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1, isMinimized: false } : w));
    });
  };

  // 4. Update Window positions
  const handleUpdateWindow = (id: string, updates: Partial<WindowInstance>) => {
    setOpenWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
  };

  // 5. Open/Launch Application
  const handleLaunchApp = (appId: AppID) => {
    setOpenWindows((prev) => {
      const exists = prev.some((w) => w.id === appId);
      if (!exists) {
        let title = getLocalizedAppTitle(appId, settings.language, appId);
        let iconName = appId;
        if (appId.startsWith('custom-app-')) {
          title = 'Web App';
          iconName = 'custom-app-🌐';
          try {
            const stored = localStorage.getItem('noobstore_installed_apps');
            if (stored) {
              const installed = JSON.parse(stored);
              const found = installed.find((a: any) => a.id === appId);
              if (found) {
                title = found.title;
                iconName = 'custom-app-' + found.iconChar;
              }
            }
          } catch (e) {
            console.error(e);
          }
        }

        const maxZ = Math.max(...prev.map((w) => w.zIndex), 10);
        const activeCount = prev.filter((w) => w.isOpen).length;
        const staggerX = (activeCount * 28) % 150;
        const staggerY = (activeCount * 28) % 150;

        const newWin: WindowInstance = {
          id: appId,
          title: title,
          icon: iconName,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          x: 100 + staggerX,
          y: 50 + staggerY,
          width: 860,
          height: 580,
          prevX: 0,
          prevY: 0,
          prevWidth: 0,
          prevHeight: 0,
          zIndex: maxZ + 1,
          minWidth: 400,
          minHeight: 300,
        };
        return [...prev, newWin];
      }

      // Calculate stagger offset
      const activeCount = prev.filter((w) => w.isOpen).length;
      const staggerX = (activeCount * 28) % 150;
      const staggerY = (activeCount * 28) % 150;

      return prev.map((w) => {
        if (w.id === appId) {
          return {
            ...w,
            isOpen: true,
            isMinimized: false,
            x: w.isOpen ? w.x : 100 + staggerX,
            y: w.isOpen ? w.y : 50 + staggerY,
          };
        }
        return w;
      });
    });
    handleFocusWindow(appId);
    setIsStartOpen(false);
  };

  // 6. Close Window
  const handleCloseWindow = (id: string) => {
    setOpenWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isOpen: false, isMinimized: false } : w))
    );
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  // 7. Click Taskbar Icons (Toggle minimize/restore)
  const handleTaskbarIconClick = (appId: AppID) => {
    const win = openWindows.find((w) => w.id === appId);
    if (!win) return;

    if (!win.isOpen) {
      handleLaunchApp(appId);
    } else if (win.isMinimized) {
      handleFocusWindow(appId);
    } else if (activeWindowId === appId) {
      // Toggle minimize if already focused
      handleUpdateWindow(appId, { isMinimized: true });
      setActiveWindowId(null);
    } else {
      handleFocusWindow(appId);
    }
  };

  // 8. Open text files from explorer directly into Notepad
  const handleOpenFileInSprout = (name: string, content: string) => {
    setSproutFilePayload({ name, content });
    handleLaunchApp('sprout');
  };

  const handleOpenFileInNotepad = (name: string, content: string) => {
    if (name.endsWith('.sp')) {
      handleOpenFileInSprout(name, content);
    } else {
      setNotepadFilePayload({ name, content });
      handleLaunchApp('notepad');
    }
  };

  // 9. Reset and format entire WebOS localStorage values
  const handleResetSystem = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const getCustomAppUrl = (appId: string): string => {
    try {
      const stored = localStorage.getItem('noobstore_installed_apps');
      if (stored) {
        const installed = JSON.parse(stored);
        const found = installed.find((a: any) => a.id === appId);
        if (found) return found.url;
      }
    } catch (e) {
      console.error(e);
    }
    return 'about:blank';
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#010103] select-none font-sans"
      id="desktop-canvas-container"
    >
      <motion.div
        initial={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
        animate={!isBooting ? { opacity: 1, scale: 1, filter: "blur(0px)" } : { opacity: 0, scale: 1.05, filter: "blur(10px)" }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 overflow-hidden"
        id="desktop-interactive-layer"
      >
        {/* Animated Wallpaper Layer with Smooth Crossfade */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={settings.wallpaper}
            initial={{ opacity: 0, scale: 1.04, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${settings.wallpaper})`,
            }}
          />
        </AnimatePresence>

        {/* Dark tint overlay */}
        <div className="absolute inset-0 bg-black/15 pointer-events-none z-0" />

        {/* Dynamic Desktop Icons (Draggable, Context Menu, Rename/Delete) */}
        <div 
          className={`absolute inset-0 pointer-events-none select-none z-10 transition-all duration-300 ease-in-out ${isTaskbarHidden ? 'pb-0' : 'pb-12'}`} 
          id="desktop-icons-area"
          onContextMenu={(e) => {
            e.preventDefault();
            setDesktopContextMenu({ x: e.clientX, y: e.clientY });
          }}
          onClick={() => {
            if (desktopContextMenu) setDesktopContextMenu(null);
          }}
        >
          {/* Desktop Floating Widgets Layer */}
          <DesktopWidgets
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            language={settings.language}
          />

          <div className="relative w-full h-full pointer-events-auto">
            {desktopItems
              .filter((item) => !item.isDeleted && !item.folderId)
              .map((item) => {
                const availableFolders = desktopItems
                  .filter((f) => f.type === 'folder' && !f.isDeleted && !f.folderId && f.id !== item.id)
                  .map((f) => ({ id: f.id, title: f.title }));

                return (
                  <DesktopIcon
                    key={item.id}
                    id={item.id}
                    title={getDesktopTitle(item, settings.language === 'ja')}
                    icon={item.type === 'recycle' ? (isTrashFull ? 'recycle-full' : 'recycle') : item.icon}
                    type={item.type}
                    x={item.x}
                    y={item.y}
                    onOpen={() => handleOpenItem(item)}
                    onDragStop={handleDragStop}
                    onRename={handleRenameItem}
                    onDelete={handleDeleteItem}
                    isPinned={pinnedAppIds.includes(item.id as AppID)}
                    onTogglePin={(id) => handleTogglePin(id as AppID)}
                    language={settings.language}
                    folders={availableFolders}
                    onMoveToFolder={handleMoveToFolder}
                  />
                );
              })}
          </div>
        </div>

        {/* Desktop Background Context Menu */}
        {desktopContextMenu && (
          <div
            style={{
              position: 'fixed',
              left: `${desktopContextMenu.x}px`,
              top: `${desktopContextMenu.y}px`,
              zIndex: 99999,
            }}
            className="bg-slate-900/95 backdrop-blur-md text-slate-100 rounded-xl shadow-2xl border border-slate-700 py-2 min-w-[210px] text-xs font-semibold animate-in fade-in zoom-in-95 duration-100 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setDesktopContextMenu(null);
                handleCreateFolder();
              }}
              className="w-full text-left px-4 py-2 hover:bg-slate-800 flex items-center gap-2.5 transition-colors text-white"
            >
              <FolderPlus className="w-4 h-4 text-amber-400" />
              <span>{settings.language === 'ja' ? '新規フォルダを作成' : 'Create New Folder'}</span>
            </button>

            <button
              onClick={() => {
                setDesktopContextMenu(null);
                const { items: rearranged } = resolveOverlappingItems(desktopItems);
                setDesktopItems(rearranged);
                localStorage.setItem('webos_desktop_items_v2', JSON.stringify(rearranged));
              }}
              className="w-full text-left px-4 py-2 hover:bg-slate-800 flex items-center gap-2.5 transition-colors text-slate-200"
            >
              <Grid className="w-4 h-4 text-blue-400" />
              <span>{settings.language === 'ja' ? 'アイコン位置を整理' : 'Arrange Desktop Icons'}</span>
            </button>

            <div className="h-[1px] bg-slate-800 my-1" />

            {/* Quick Desktop Widget Toggle Buttons */}
            <button
              onClick={() => {
                handleUpdateSettings({ ...settings, showDesktopWeatherWidget: !settings.showDesktopWeatherWidget });
                setDesktopContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 hover:bg-slate-800 flex items-center justify-between transition-colors text-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <CloudSun className="w-4 h-4 text-sky-400" />
                <span>{settings.language === 'ja' ? '天気ウィジェット' : 'Weather Widget'}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${settings.showDesktopWeatherWidget ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                {settings.showDesktopWeatherWidget ? (settings.language === 'ja' ? '表示中' : 'ON') : (settings.language === 'ja' ? '非表示' : 'OFF')}
              </span>
            </button>

            <button
              onClick={() => {
                handleUpdateSettings({ ...settings, showDesktopClockWidget: !settings.showDesktopClockWidget });
                setDesktopContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 hover:bg-slate-800 flex items-center justify-between transition-colors text-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <ClockIcon className="w-4 h-4 text-purple-400" />
                <span>{settings.language === 'ja' ? '時計ウィジェット' : 'Clock Widget'}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${settings.showDesktopClockWidget ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                {settings.showDesktopClockWidget ? (settings.language === 'ja' ? '表示中' : 'ON') : (settings.language === 'ja' ? '非表示' : 'OFF')}
              </span>
            </button>

            <button
              onClick={() => {
                handleUpdateSettings({ ...settings, showDesktopNotesWidget: !settings.showDesktopNotesWidget });
                setDesktopContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 hover:bg-slate-800 flex items-center justify-between transition-colors text-slate-200"
            >
              <div className="flex items-center gap-2.5">
                <StickyNoteIcon className="w-4 h-4 text-amber-400" />
                <span>{settings.language === 'ja' ? 'クイックメモ' : 'Sticky Notes'}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${settings.showDesktopNotesWidget ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                {settings.showDesktopNotesWidget ? (settings.language === 'ja' ? '表示中' : 'ON') : (settings.language === 'ja' ? '非表示' : 'OFF')}
              </span>
            </button>

            <div className="h-[1px] bg-slate-800 my-1" />

            <button
              onClick={() => {
                setDesktopContextMenu(null);
                handleLaunchApp('settings');
              }}
              className="w-full text-left px-4 py-2 hover:bg-slate-800 flex items-center gap-2.5 transition-colors text-slate-200"
            >
              <SettingsIcon className="w-4 h-4 text-slate-400" />
              <span>{settings.language === 'ja' ? 'システム設定' : 'System Settings'}</span>
            </button>
          </div>
        )}

        {/* Folder View Modal */}
        {activeFolder && (
          <FolderViewWindow
            folder={activeFolder}
            allItems={desktopItems}
            onUpdateItems={(newItems) => {
              setDesktopItems(newItems);
              try {
                localStorage.setItem('webos_desktop_items_v2', JSON.stringify(newItems));
              } catch (e) {
                console.error(e);
              }
              window.dispatchEvent(new Event('webos_desktop_items_changed'));
            }}
            onLaunchApp={(appId) => {
              handleLaunchApp(appId as AppID);
            }}
            onClose={() => setActiveFolder(null)}
            language={settings.language}
          />
        )}

      {/* Floating Windows Stack */}
      <div 
        className={`absolute inset-0 overflow-hidden pointer-events-none transition-all duration-300 ease-in-out ${isTaskbarHidden ? 'pb-0' : 'pb-12'}`} 
        id="desktop-windows-canvas"
      >
        <div className="w-full h-full relative pointer-events-auto">
          {openWindows.map((win) => {
            if (!win.isOpen) return null;

            const localizedWin = {
              ...win,
              title: getLocalizedAppTitle(win.id, settings.language, win.title),
            };

            return (
              <Window
                key={win.id}
                windowState={localizedWin}
                onUpdate={handleUpdateWindow}
                onFocus={handleFocusWindow}
                onClose={handleCloseWindow}
                isTaskbarHidden={isTaskbarHidden}
                isToggleTaskbarWithQ={settings.isToggleTaskbarWithQ}
                language={settings.language}
              >
                {/* Lazy/Dynamic render corresponding applications */}
                {win.id === 'browser' && (
                  <BrowserApp onOpenNotepadWithFile={handleOpenFileInNotepad} />
                )}
                {win.id === 'notepad' && (
                  <NotepadApp
                    initialFileContent={notepadFilePayload?.content}
                    initialFileName={notepadFilePayload?.name}
                    onFileSaved={() => setNotepadFilePayload(null)}
                  />
                )}
                {win.id === 'calculator' && <CalculatorApp />}
                {win.id === 'paint' && <PaintApp />}
                {win.id === 'files' && (
                  <FileManagerApp 
                    onOpenFileInNotepad={handleOpenFileInNotepad}
                    targetFolderId={fileManagerFolderTarget}
                    onClearTargetFolder={() => setFileManagerFolderTarget(null)}
                    onLaunchApp={(appId) => handleLaunchApp(appId as AppID)}
                    language={settings.language}
                  />
                )}
                {win.id === 'terminal' && <TerminalApp />}
                {win.id === 'excel' && <ExcelApp />}
                {win.id === 'settings' && (
                  <SettingsApp
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                    onResetSystem={handleResetSystem}
                    onRestartSystem={handleSoftReboot}
                    onReRunOOBE={() => setIsOOBECompleted(false)}
                  />
                )}
                {win.id === 'word' && (
                  <WordApp
                    initialFileContent={wordFilePayload?.content}
                    initialFileName={wordFilePayload?.name}
                    onFileSaved={() => setWordFilePayload(null)}
                  />
                )}
                {win.id === 'powerpoint' && <PowerPointApp />}
                {win.id === 'recycle' && <RecycleBinApp />}
                {win.id === 'minecraft' && <MinecraftApp />}
                {win.id === 'videoeditor' && <VideoEditorApp />}
                {win.id === 'dotsandboxes' && <DotsAndBoxesApp />}
                {win.id === 'blokus' && <BlokusApp />}
                {win.id === 'nmap' && (
                  <NmapApp onClose={() => handleCloseWindow('nmap')} />
                )}
                {win.id === 'flightsim' && (
                  <FlightSimulatorApp onClose={() => handleCloseWindow('flightsim')} />
                )}
                {win.id === 'chameleon' && (
                  <ChameleonGameApp />
                )}
                {win.id === 'wetalks' && (
                  <iframe
                    srcDoc={CHAT_APP_HTML}
                    title="We talks Chat"
                    className="w-full h-full border-none bg-zinc-950"
                  />
                )}
                {win.id === 'noobstore' && <NoobStoreApp />}
                {win.id === 'tetris' && <TetrisApp />}
                {win.id === 'sprout' && (
                  <SproutApp
                    initialFileContent={sproutFilePayload?.content}
                    initialFileName={sproutFilePayload?.name}
                    onFileSaved={() => setSproutFilePayload(null)}
                  />
                )}
                {win.id === 'aboad' && <AboadApp />}
                {win.id.startsWith('custom-app-') && (
                  <iframe
                    src={getCustomAppUrl(win.id)}
                    title={win.title}
                    className="w-full h-full border-none bg-white"
                    referrerPolicy="no-referrer"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  />
                )}
              </Window>
            );
          })}
        </div>
      </div>

      {/* Centered Taskbar Panel */}
      <Taskbar
        openWindows={openWindows}
        activeWindowId={activeWindowId}
        onStartClick={() => setIsStartOpen(!isStartOpen)}
        isStartOpen={isStartOpen}
        onTaskbarIconClick={handleTaskbarIconClick}
        isDarkTheme={settings.isDarkTheme}
        pinnedAppIds={pinnedAppIds}
        onTogglePin={handleTogglePin}
        isTaskbarHidden={isTaskbarHidden}
        isActionCenterOpen={isActionCenterOpen}
        onToggleActionCenter={() => setIsActionCenterOpen(!isActionCenterOpen)}
        notificationCount={notificationHistory.length}
        taskbarAlignment={settings.taskbarAlignment}
        taskbarBaseColor={settings.taskbarBaseColor}
        taskbarOpacity={settings.taskbarOpacity}
        language={settings.language}
        timezone={settings.timezone}
      />

      {/* Windows 10 Action Center Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[360px] shadow-2xl transition-all duration-300 ease-in-out z-[55] flex flex-col border-l select-none ${
          settings.isDarkTheme
            ? 'glass-dark border-white/5 text-gray-200 bg-zinc-950/95'
            : 'glass border-gray-200/50 text-gray-800 bg-white/95'
        } ${
          isActionCenterOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        id="windows10-action-center"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 dark:border-white/10 light:border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{settings.language === 'ja' ? '通知とアクション' : 'Notifications & Actions'}</span>
            {notificationHistory.length > 0 && (
              <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {notificationHistory.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {notificationHistory.length > 0 && (
              <button
                onClick={handleClearAllHistory}
                className="text-xs text-blue-500 hover:underline hover:text-blue-400 font-semibold"
                id="action-center-clear-all"
              >
                {settings.language === 'ja' ? 'すべてクリア' : 'Clear All'}
              </button>
            )}
            <button
              onClick={() => setIsActionCenterOpen(false)}
              className="text-xs font-bold opacity-60 hover:opacity-100 p-1 font-mono"
              id="action-center-close"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Action Center Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar">
          {/* Section: Notifications */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold tracking-wider uppercase opacity-50 mb-1">{settings.language === 'ja' ? '通知' : 'Notifications'}</span>
            {notificationHistory.length === 0 ? (
              <div className="text-center py-8 text-xs opacity-50 italic">
                {settings.language === 'ja' ? '新しい通知はありません' : 'No new notifications'}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {notificationHistory.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      setIsActionCenterOpen(false);
                      if (notif.appToLaunch === 'word') {
                        setWordFilePayload({
                          name: notif.payloadTitle || 'Admin Message.docx',
                          content: notif.payloadContent || notif.text,
                        });
                        handleLaunchApp('word');
                        handleFocusWindow('word');
                      } else {
                        handleLaunchApp(notif.appToLaunch || 'wetalks');
                        handleFocusWindow(notif.appToLaunch || 'wetalks');
                      }
                    }}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.01] ${
                      settings.isDarkTheme
                        ? 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-200'
                        : 'bg-black/5 border-black/5 hover:bg-black/10 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold flex items-center gap-1">
                        {notif.appToLaunch === 'word' ? '📝 Word' : '💬 We talks'} ({notif.sender})
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHistoryItem(notif.id);
                        }}
                        className="text-[11px] font-bold opacity-50 hover:opacity-100 p-0.5 font-mono"
                      >
                        &times;
                      </button>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-80 break-words line-clamp-3">
                      {notif.text}
                    </p>
                    <span className="text-[9px] opacity-40 block text-right mt-1.5">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-white/10 w-full shrink-0 my-1" />

          {/* Section: Calendar */}
          <div className="flex flex-col gap-2 shrink-0">
            <span className="text-[11px] font-bold tracking-wider uppercase opacity-50 mb-1">{settings.language === 'ja' ? 'カレンダー' : 'Calendar'}</span>
            <ActionCenterCalendar isDarkTheme={settings.isDarkTheme} language={settings.language} />
          </div>
        </div>
      </div>

      {/* Action Center overlay backdrop */}
      {isActionCenterOpen && (
        <div
          onClick={() => setIsActionCenterOpen(false)}
          className="fixed inset-0 bg-transparent z-[50]"
        />
      )}

      {/* Start Menu Overlay */}
      <StartMenu
        isOpen={isStartOpen}
        onClose={() => setIsStartOpen(false)}
        isDarkTheme={settings.isDarkTheme}
        onLaunchApp={handleLaunchApp}
        onResetSystem={handleResetSystem}
        onRestartSystem={handleSoftReboot}
        onShutdownSystem={() => setIsLocked(true)}
        username={settings.username}
        language={settings.language}
        taskbarAlignment={settings.taskbarAlignment}
        taskbarBaseColor={settings.taskbarBaseColor}
        taskbarOpacity={settings.taskbarOpacity}
        showWeatherWidget={settings.showWeatherWidget}
        showClockWidget={settings.showClockWidget}
        showQuickNotesWidget={settings.showQuickNotesWidget}
        weatherCity={settings.weatherCity}
        clockWidgetType={settings.clockWidgetType}
      />

      {/* Lock Screen Overlay */}
      <AnimatePresence>
        {isLocked && (
          <LockScreen
            username={settings.username}
            password={settings.password}
            wallpaper={settings.wallpaper}
            language={settings.language}
            timezone={settings.timezone}
            onUnlock={() => setIsLocked(false)}
          />
        )}
      </AnimatePresence>

      {/* Fluent Toast Notification Center */}
      <div 
        className="fixed bottom-16 right-4 z-[9999] flex flex-col gap-2 max-w-sm pointer-events-none"
        id="webos-toast-container"
      >
        {notifications.map((notif) => {
          const isClosing = notif.isClosing;
          return (
            <div
              key={notif.id}
              className={`w-80 backdrop-blur-md border rounded-xl shadow-2xl p-4 flex flex-col gap-2 transition-all duration-300 ease-out pointer-events-auto transform ${
                settings.isDarkTheme
                  ? 'bg-zinc-900/85 text-zinc-100 border-zinc-800/80'
                  : 'bg-white/85 text-gray-800 border-gray-200/80'
              } ${
                isClosing
                  ? 'translate-x-[110%] opacity-0 scale-95'
                  : 'translate-x-0 opacity-100 scale-100'
              }`}
              id={`toast-${notif.id}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between w-full border-b border-gray-100/10 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">
                    {notif.appToLaunch === 'word' ? '📝' : '💬'}
                  </span>
                  <span className="text-[11px] font-bold tracking-tight uppercase opacity-75">
                    {notif.appToLaunch === 'word' ? 'Microsoft Word' : 'We talks'}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCloseNotification(notif.id);
                  }}
                  className="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity p-0.5 font-mono"
                  title="Close Notification"
                  id={`toast-close-btn-${notif.id}`}
                >
                  &times;
                </button>
              </div>

              {/* Body */}
              <div 
                onClick={() => {
                  handleCloseNotification(notif.id);
                  if (notif.appToLaunch === 'word') {
                    setWordFilePayload({
                      name: notif.payloadTitle || 'Admin Message.docx',
                      content: notif.payloadContent || notif.text,
                    });
                    handleLaunchApp('word');
                    handleFocusWindow('word');
                  } else {
                    handleLaunchApp(notif.appToLaunch || 'wetalks');
                    handleFocusWindow(notif.appToLaunch || 'wetalks');
                  }
                }}
                className="flex flex-col gap-0.5 cursor-pointer hover:opacity-90"
              >
                <span className="text-xs font-bold truncate">
                  {notif.appToLaunch === 'word' ? '管理者からの重要連絡' : `New message from ${notif.sender}`}
                </span>
                <p className="text-[11px] opacity-80 line-clamp-2 italic leading-relaxed">
                  {notif.appToLaunch === 'word' ? `「${notif.payloadTitle}」が届きました。` : `"${notif.text}"`}
                </p>
              </div>

              {/* Action Button */}
              <div className="flex justify-end mt-1">
                <button
                  onClick={() => {
                    handleCloseNotification(notif.id);
                    if (notif.appToLaunch === 'word') {
                      setWordFilePayload({
                        name: notif.payloadTitle || 'Admin Message.docx',
                        content: notif.payloadContent || notif.text,
                      });
                      handleLaunchApp('word');
                      handleFocusWindow('word');
                    } else {
                      handleLaunchApp(notif.appToLaunch || 'wetalks');
                      handleFocusWindow(notif.appToLaunch || 'wetalks');
                    }
                  }}
                  className="text-[10px] font-bold text-blue-500 dark:text-blue-400 hover:underline flex items-center gap-1"
                  id={`toast-action-btn-${notif.id}`}
                >
                  {notif.appToLaunch === 'word' ? 'Wordで確認する \u2192' : 'Open Chat \u2192'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>

    {/* Boot Screen Overlay */}
    <AnimatePresence mode="wait">
      {isBooting && (
        <BootScreen
          isReboot={isReboot}
          onComplete={() => {
            setIsBooting(false);
            setIsReboot(false);
          }}
        />
      )}
    </AnimatePresence>

    {/* OOBE Initial Setup Overlay */}
    <AnimatePresence>
      {!isOOBECompleted && !isBooting && !isShutDown && (
        <OOBESetup
          initialSettings={settings}
          onComplete={handleCompleteOOBE}
        />
      )}
    </AnimatePresence>

    {/* Simulated Shutdown Screen Overlay */}
    {isShutDown && (
      <div 
        onClick={() => {
          setIsShutDown(false);
          setIsReboot(false);
          setIsBooting(true); // Trigger startup on power on
        }}
        className="fixed inset-0 bg-[#020203] z-[9999999] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
        id="webos-shutdown-screen"
      >
        {/* Subtle star particle fields */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_50%)] pointer-events-none" />

        <div className="flex flex-col items-center gap-6 animate-pulse" style={{ animationDuration: '4s' }}>
          {/* Glowing Power Button */}
          <div className="w-20 h-20 rounded-full border-2 border-zinc-850 flex items-center justify-center hover:border-zinc-500 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.01)] hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] bg-zinc-950">
            <svg 
              className="w-8 h-8 text-zinc-600 hover:text-blue-500 transition-colors"
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
              <line x1="12" y1="2" x2="12" y2="12" />
            </svg>
          </div>
          
          <div className="text-center flex flex-col gap-1.5 font-sans">
            <p className="text-sm font-light tracking-[0.2em] text-zinc-400 uppercase">
              System Powered Off
            </p>
            <p className="text-[11px] text-zinc-600 tracking-wide font-sans">
              画面をクリックするか、電源ボタンを押して起動してください
            </p>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}

// ==========================================
// Windows 10 Action Center Calendar Component
// ==========================================
interface ActionCenterCalendarProps {
  isDarkTheme: boolean;
  language?: 'ja' | 'en';
}

const ActionCenterCalendar: React.FC<ActionCenterCalendarProps> = ({ isDarkTheme, language = 'ja' }) => {
  const isJa = language === 'ja';
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = isJa
    ? ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevTotalDays = new Date(year, month, 0).getDate();

  const days = [];

  // Previous Month Padding Days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      day: prevTotalDays - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevTotalDays - i)
    });
  }

  // Current Month Days
  const today = new Date();
  for (let i = 1; i <= totalDays; i++) {
    const isToday =
      today.getDate() === i &&
      today.getMonth() === month &&
      today.getFullYear() === year;
    days.push({
      day: i,
      isCurrentMonth: true,
      isToday,
      date: new Date(year, month, i)
    });
  }

  // Next Month Padding Days
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i)
    });
  }

  const weekDays = isJa
    ? ['日', '月', '火', '水', '木', '金', '土']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className={`p-3.5 rounded-xl border flex flex-col gap-2.5 transition-colors ${
      isDarkTheme 
        ? 'bg-black/30 border-white/5 text-gray-200' 
        : 'bg-white/50 border-gray-200/50 text-gray-800 shadow-sm'
    }`}>
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold tracking-tight">
          {isJa ? `${year}年 ${monthNames[month]}` : `${monthNames[month]} ${year}`}
        </span>
        <div className="flex gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1 px-1.5 text-[10px] font-bold rounded hover:bg-white/10 dark:hover:bg-black/10 transition-colors text-inherit"
          >
            &larr;
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 px-1.5 text-[10px] font-bold rounded hover:bg-white/10 dark:hover:bg-black/10 transition-colors text-inherit"
          >
            &rarr;
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-[10px] font-bold opacity-60">
        {weekDays.map((wd, idx) => (
          <div key={idx} className={idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : ''}>
            {wd}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
        {days.map((item, idx) => (
          <div
            key={idx}
            className={`p-1 rounded flex items-center justify-center font-semibold h-6.5 w-full transition-all ${
              item.isToday
                ? 'bg-blue-600 text-white font-bold shadow-md ring-1 ring-blue-400'
                : item.isCurrentMonth
                ? 'opacity-100 hover:bg-white/10 dark:hover:bg-white/5 cursor-pointer'
                : 'opacity-30 hover:bg-white/10 dark:hover:bg-white/5 cursor-pointer text-gray-400 dark:text-gray-500'
            }`}
          >
            {item.day}
          </div>
        ))}
      </div>
    </div>
  );
};
