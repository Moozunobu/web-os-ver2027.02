export interface StoreAppInfo {
  id: string; // AppID
  titleJa: string;
  titleEn: string;
  icon: string;
  category: 'productivity' | 'utilities' | 'creativity' | 'games' | 'devtools' | 'social';
  categoryLabelJa: string;
  developer: string;
  size: string;
  descriptionJa: string;
  descriptionEn: string;
  featuresJa: string[];
  featuresEn: string[];
  bannerGradient: string;
  badge?: string;
}

export const SYSTEM_STORE_APPS: StoreAppInfo[] = [
  {
    id: 'notepad',
    titleJa: 'メモ帳 (Notepad)',
    titleEn: 'Notepad Text Editor',
    icon: 'notepad',
    category: 'utilities',
    categoryLabelJa: 'ユーティリティ',
    developer: 'Abord Systems',
    size: '1.2 MB',
    descriptionJa: 'シンプルで高速なテキストエディタ。テキストファイル、マークダウンメモの作成・編集・自動保存に対応。',
    descriptionEn: 'Lightweight and fast text editor for markdown and plain text notes with auto-save support.',
    featuresJa: ['自動保存機能', 'Markdown形式対応', '文字数カウント', 'ダークモード対応'],
    featuresEn: ['Auto-save', 'Markdown preview', 'Character counter', 'Dark mode support'],
    bannerGradient: 'from-amber-600/30 via-amber-900/20 to-zinc-950',
    badge: '人気',
  },
  {
    id: 'calculator',
    titleJa: '電卓 (Calculator)',
    titleEn: 'Scientific Calculator',
    icon: 'calculator',
    category: 'utilities',
    categoryLabelJa: 'ユーティリティ',
    developer: 'Abord Systems',
    size: '0.8 MB',
    descriptionJa: '日常の四則演算から複雑な数式計算までスムーズに行えるモダンな関数電卓アプリ。',
    descriptionEn: 'Modern calculator supporting standard mathematical and scientific operations.',
    featuresJa: ['四則演算 & 履歴表示', 'キーボード入力対応', '計算履歴の保存'],
    featuresEn: ['Standard arithmetic', 'Keyboard shortcuts', 'History log'],
    bannerGradient: 'from-blue-600/30 via-cyan-900/20 to-zinc-950',
  },
  {
    id: 'paint',
    titleJa: 'ペイント (Paint Tool)',
    titleEn: 'Paint Drawing Studio',
    icon: 'paint',
    category: 'creativity',
    categoryLabelJa: 'クリエイティブ',
    developer: 'Abord Creative Lab',
    size: '3.4 MB',
    descriptionJa: '各種ブラシ、カラーパレット、図形描画ツールを備えた本格ペイント・イラスト制作ツール。',
    descriptionEn: 'Versatile drawing tool equipped with customizable brushes, color picker, and shapes.',
    featuresJa: ['カスタムブラシ & 線幅調整', 'カラーパレット & スポイト', 'PNG画像書き出し'],
    featuresEn: ['Custom brushes', 'Color palette', 'Export PNG'],
    bannerGradient: 'from-amber-600/30 via-orange-900/20 to-zinc-950',
    badge: 'おすすめ',
  },
  {
    id: 'word',
    titleJa: 'Word ドキュメント (Word)',
    titleEn: 'Word Document Editor',
    icon: 'word',
    category: 'productivity',
    categoryLabelJa: '生産性',
    developer: 'Abord Office Suite',
    size: '8.2 MB',
    descriptionJa: 'リッチテキスト装飾、スタイル変更、ドキュメントの作成・編集・管理が可能なワードプロセッサ。',
    descriptionEn: 'Full-featured word processor supporting rich text formatting and document exports.',
    featuresJa: ['フォント・カラー・見出しスタイル', '画像の挿入 & レイアウト', 'docx / txt 相互変換'],
    featuresEn: ['Rich text styling', 'Image inline placement', 'Export document'],
    bannerGradient: 'from-blue-700/30 via-indigo-900/20 to-zinc-950',
    badge: '必須',
  },
  {
    id: 'excel',
    titleJa: 'Excel スプレッドシート (Excel)',
    titleEn: 'Excel Spreadsheet',
    icon: 'excel',
    category: 'productivity',
    categoryLabelJa: '生産性',
    developer: 'Abord Office Suite',
    size: '9.1 MB',
    descriptionJa: 'グリッドセル編集、SUM/AVERAGE関数、CSVインポート・エクスポート対応の表計算アプリ。',
    descriptionEn: 'Powerful spreadsheet software supporting formulas, cell formatting, and CSV support.',
    featuresJa: ['数式計算 (SUM, AVG, COUNT)', 'セル着色 & スタイル設定', 'CSV/XLSX インポート'],
    featuresEn: ['Math formulas', 'Cell styling', 'CSV import/export'],
    bannerGradient: 'from-emerald-700/30 via-teal-900/20 to-zinc-950',
    badge: '必須',
  },
  {
    id: 'powerpoint',
    titleJa: 'PowerPoint プレゼンテーション (PowerPoint)',
    titleEn: 'PowerPoint Slide Deck',
    icon: 'powerpoint',
    category: 'productivity',
    categoryLabelJa: '生産性',
    developer: 'Abord Office Suite',
    size: '7.8 MB',
    descriptionJa: 'スライドの作成、デザインテンプレート、スライドショー再生機能を備えたプレゼンツール。',
    descriptionEn: 'Create engaging presentation slide decks with themes and presentation preview mode.',
    featuresJa: ['スライド追加 & 順序変更', 'テキスト・画像配置', 'フルスクリーンスライドショー'],
    featuresEn: ['Slide reordering', 'Media placement', 'Fullscreen presentation'],
    bannerGradient: 'from-orange-700/30 via-red-900/20 to-zinc-950',
  },
  {
    id: 'minecraft',
    titleJa: 'nooncraft (Minecraft Clone)',
    titleEn: 'nooncraft 3D Block Builder',
    icon: 'minecraft',
    category: 'games',
    categoryLabelJa: 'ゲーム',
    developer: 'Craft Studio',
    size: '14.5 MB',
    descriptionJa: 'ブラウザ上で滑らかに動作する3Dブロッククラフトゲーム。自由な世界構築と探検が楽しめます。',
    descriptionEn: 'Smooth 3D voxel sandbox game. Build, dig, and explore your custom voxel world.',
    featuresJa: ['3Dリアルタイムレンダリング', '多様なブロック種類', 'ワールド保存機能'],
    featuresEn: ['3D voxel engine', 'Multiple block types', 'World save support'],
    bannerGradient: 'from-green-700/30 via-emerald-900/20 to-zinc-950',
    badge: '大ヒット',
  },
  {
    id: 'tetris',
    titleJa: 'ネオ テトリス (Neo Tetris)',
    titleEn: 'Neo Tetris Arcade',
    icon: 'tetris',
    category: 'games',
    categoryLabelJa: 'ゲーム',
    developer: 'Arcade Retro Games',
    size: '2.1 MB',
    descriptionJa: 'ネオンエフェクトとサクサク動く物理判定を備えた定番ブロックパズルゲーム。ハイスコアに挑戦！',
    descriptionEn: 'Neon-styled classic block puzzle with smooth controls and high-score ranking.',
    featuresJa: ['ホールド & ネクスト表示', 'ハードドロップ & Tスピン判定', 'ローカルハイスコア保存'],
    featuresEn: ['Hold & Next preview', 'Hard drop mechanics', 'Highscore tracking'],
    bannerGradient: 'from-fuchsia-700/30 via-purple-900/20 to-zinc-950',
    badge: '定番',
  },
  {
    id: 'dotsandboxes',
    titleJa: 'ドット＆ボックス (Dots & Boxes)',
    titleEn: 'Dots & Boxes Board Game',
    icon: 'dotsandboxes',
    category: 'games',
    categoryLabelJa: 'ゲーム',
    developer: 'Mind Games Studio',
    size: '1.5 MB',
    descriptionJa: '点と点を結んで正方形を作り陣地を奪い合う伝統的な思考対戦ボードゲーム。',
    descriptionEn: 'Classic pen-and-paper strategy game. Connect dots to claim boxes against smart AI.',
    featuresJa: ['CPU対戦 & 2人対戦モード', '盤面サイズ切替', '詳細戦績スコア'],
    featuresEn: ['CPU vs Player mode', 'Custom grid size', 'Match stats'],
    bannerGradient: 'from-cyan-700/30 via-blue-900/20 to-zinc-950',
  },
  {
    id: 'blokus',
    titleJa: 'ブロックス (Blokus)',
    titleEn: 'Blokus Strategy Board Game',
    icon: 'blokus',
    category: 'games',
    categoryLabelJa: 'ゲーム',
    developer: 'Mind Games Studio',
    size: '2.8 MB',
    descriptionJa: '自分の色のピースの角と角を繋げて広げていく全世界で大人気のテトリミノ配列陣取りゲーム。',
    descriptionEn: 'Popular territorial strategy game. Place your pieces touching corners only!',
    featuresJa: ['1～4人CPU対戦', '有効マス自動ハイライト', 'リアルタイムスコア集計'],
    featuresEn: ['1 to 4 players / AI', 'Valid move highlights', 'Realtime score board'],
    bannerGradient: 'from-amber-600/30 via-orange-900/20 to-zinc-950',
  },
  {
    id: 'wetalks',
    titleJa: 'WeTalks チャット (WeTalks)',
    titleEn: 'WeTalks Chat Messenger',
    icon: 'wetalks',
    category: 'social',
    categoryLabelJa: 'ソーシャル',
    developer: 'Abord Connect',
    size: '4.2 MB',
    descriptionJa: 'OS内の仮想ユーザーやAIとリアルタイムにメッセージ交換ができるメッセージング&通知アプリ。',
    descriptionEn: 'In-OS messaging and chat app supporting real-time notifications and AI bots.',
    featuresJa: ['通知センター連動', 'スタンプ・画像送受信', 'メッセージ履歴自動保存'],
    featuresEn: ['Toast notifications', 'Sticker & Image sharing', 'Persistent chat history'],
    bannerGradient: 'from-green-700/30 via-emerald-900/20 to-zinc-950',
  },
  {
    id: 'sprout',
    titleJa: 'Sprout Studio (開発環境)',
    titleEn: 'Sprout Studio (IDE & Interpreter)',
    icon: 'sprout',
    category: 'devtools',
    categoryLabelJa: '開発ツール',
    developer: 'Sprout Dev Team',
    size: '5.6 MB',
    descriptionJa: '専用軽量プログラミング言語 Sprout (.sprout) のコード作成・リアルタイム実行・デバッグ環境。',
    descriptionEn: 'Integrated development environment for writing and executing custom .sprout scripts.',
    featuresJa: ['シンタックスハイライト', 'リアルタイムコンソール出力', 'サンプルコード搭載'],
    featuresEn: ['Syntax highlighting', 'Console output execution', 'Sample code library'],
    bannerGradient: 'from-emerald-700/30 via-green-900/20 to-zinc-950',
    badge: '開発者向け',
  },
  {
    id: 'terminal',
    titleJa: 'コマンド プロンプト (Terminal)',
    titleEn: 'Command Prompt Shell',
    icon: 'terminal',
    category: 'devtools',
    categoryLabelJa: '開発ツール',
    developer: 'Abord Systems',
    size: '1.0 MB',
    descriptionJa: 'ファイル操作、システム診断、スクリプト実行ができるAbord OS標準CLI環境。',
    descriptionEn: 'Command line terminal for directory navigation, script execution, and system diagnostics.',
    featuresJa: ['Unix / Windows 風コマンド対応', 'カラー出力 & タブ補完', 'スクリプト実行'],
    featuresEn: ['Unix & Windows commands', 'Color output', 'Script execution'],
    bannerGradient: 'from-zinc-700/30 via-slate-900/20 to-zinc-950',
  },
  {
    id: 'aboad',
    titleJa: 'Aboad (Web アプリ)',
    titleEn: 'Aboad Web App',
    icon: 'aboad',
    category: 'utilities',
    categoryLabelJa: 'ユーティリティ',
    developer: 'Moozunobu',
    size: '1.5 MB',
    descriptionJa: 'https://moozunobu.github.io/Abord-browser-ver2/ を表示する外部連携ウィンドウアプリ。',
    descriptionEn: 'External link web app displaying https://moozunobu.github.io/Abord-browser-ver2/ in an OS window.',
    featuresJa: ['インラインWeb表示', 'リロード & 外部タブ表示', '全画面トグル'],
    featuresEn: ['Inline web view', 'Reload & open in new tab', 'Fullscreen toggle'],
    bannerGradient: 'from-purple-700/30 via-indigo-900/20 to-zinc-950',
    badge: 'NEW',
  },
];

export const getInstalledSystemAppIds = (): string[] => {
  try {
    const stored = localStorage.getItem('webos_installed_system_apps');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error(e);
  }
  return [];
};

export const setInstalledSystemAppIds = (appIds: string[]) => {
  try {
    localStorage.setItem('webos_installed_system_apps', JSON.stringify(appIds));
    window.dispatchEvent(new Event('webos_installed_apps_changed'));
  } catch (e) {
    console.error(e);
  }
};
