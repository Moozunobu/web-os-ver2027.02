export type AppID =
  | 'browser'
  | 'notepad'
  | 'calculator'
  | 'paint'
  | 'files'
  | 'terminal'
  | 'excel'
  | 'settings'
  | 'word'
  | 'powerpoint'
  | 'recycle'
  | 'minecraft'
  | 'videoeditor'
  | 'dotsandboxes'
  | 'blokus'
  | 'wetalks'
  | 'nmap'
  | 'flightsim'
  | 'chameleon'
  | 'noobstore'
  | 'sprout'
  | 'aboad'
  | string;

export interface WindowInstance {
  id: AppID;
  title: string;
  icon: string; // Icon name or SVG identifier
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  prevX: number;
  prevY: number;
  prevWidth: number;
  prevHeight: number;
  zIndex: number;
  minWidth?: number;
  minHeight?: number;
}

export interface VirtualFile {
  name: string;
  path: string; // e.g. "Desktop", "Documents", "Pictures"
  content: string;
  type: 'txt' | 'sheet' | 'image';
  createdAt: string;
}

export interface SettingsState {
  wallpaper: string;
  isDarkTheme: boolean; // Toggles light/dark taskbar & start menu
  isToggleTaskbarWithQ: boolean; // Toggle taskbar visibility with Q key
  taskbarAlignment: 'left' | 'center'; // Taskbar layout alignment
  taskbarBaseColor?: 'dark' | 'navy' | 'slate' | 'purple' | 'red' | 'emerald' | 'clear' | string; // Base color for taskbar & start menu
  taskbarOpacity?: number; // Translucency/Opacity (0 to 100)
  language: 'ja' | 'en'; // System language setting
  timezone: string; // Timezone string (e.g. Asia/Tokyo, UTC, America/New_York)
  region: string; // Region setting (e.g. Japan, United States)
  username: string; // System user account name
  usePassword: boolean; // Enable or disable login password
  password: string; // System account password
  wallpaperImageHeight?: 'low' | 'medium' | 'high'; // Height setting for image/wallpaper preview cards
  defaultDocFormat?: 'txt' | 'docx' | 'md'; // Preferred document saving format
  defaultSheetFormat?: 'csv' | 'xlsx'; // Preferred spreadsheet format
  autoSaveFiles?: boolean; // Enable automatic background file saving
  showWeatherWidget?: boolean; // Show weather widget on Abord 10 Start Menu
  showClockWidget?: boolean; // Show clock & calendar widget
  showQuickNotesWidget?: boolean; // Show quick sticky note widget
  weatherCity?: string; // City for weather widget (Tokyo, Osaka, Nagoya, Fukuoka, Sapporo, New York, London, Paris)
  clockWidgetType?: 'digital' | 'analog'; // Type of clock widget display ('digital' or 'analog')
  showDesktopWeatherWidget?: boolean; // Show weather widget on Desktop
  showDesktopClockWidget?: boolean; // Show clock & calendar widget on Desktop
  showDesktopNotesWidget?: boolean; // Show sticky notes widget on Desktop
  desktopWidgetPositions?: Record<string, { x: number; y: number }>; // Saved desktop coordinates for widgets
}

export interface DesktopIconDef {
  id: AppID;
  title: string;
  icon: string;
  type: 'app' | 'file';
  fileName?: string; // If this opens a specific file
}

export interface DesktopItem {
  id: string;
  appId?: AppID;
  title: string;
  icon: string;
  type: 'app' | 'file' | 'recycle' | 'folder';
  x: number;
  y: number;
  fileName?: string;
  folderId?: string;
  isDeleted?: boolean;
}

export const WALLPAPERS = [
  {
    id: 'bloom',
    name: 'Abord Hero (デフォルト)',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
  },
  {
    id: 'dark-aura',
    name: 'ダーク オーラ (Dark Aura)',
    url: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=1200&q=80',
  },
  {
    id: 'sunset-glow',
    name: 'サンセット グロウ (Sunset Glow)',
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80',
  },
  {
    id: 'mountain-view',
    name: 'アルプス山脈 (Mountain Alps)',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
  },
  {
    id: 'tokyo-night',
    name: '東京の夜景 (Tokyo Nightscape)',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=80',
  },
  {
    id: 'minimal-gradient',
    name: 'ミニマルグラデーション (Minimal Soft)',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80',
  },
];
