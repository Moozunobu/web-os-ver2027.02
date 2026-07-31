export interface OSVersionConfig {
  id: string;
  name: string;
  url: string;
  aliases?: string[];
}

/**
 * Web OS バージョン一覧の設定
 * 新しい OS バージョンを追加したい場合は、この配列にオブジェクトを追加するだけで自動的にコマンドや選択リストに反映されます。
 */
export const OS_VERSIONS: OSVersionConfig[] = [
  {
    id: 'os_version7.5',
    name: 'os_version7.5',
    url: 'https://moozunobu.github.io/web-os-ver7.5/',
    aliases: ['7.5', 'version7.5', 'ver7.5'],
  },
  {
    id: 'os_version7.2',
    name: 'os_version7.2',
    url: 'https://moozunobu.github.io/noob-web-os-ver7.2/',
    aliases: ['7.2', 'version7.2', 'ver7.2'],
  },
];

/**
 * 入力文字列（番号、ID、エイリアス等）から該当する OS 設定を検索するユーティリティ
 */
export function findOSVersion(input: string): OSVersionConfig | undefined {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return undefined;

  // 1. 番号指定 (1-indexed)
  const num = parseInt(normalized, 10);
  if (!isNaN(num) && num >= 1 && num <= OS_VERSIONS.length) {
    return OS_VERSIONS[num - 1];
  }

  // 2. ID, Name, URL, Aliases との完全/部分一致
  return OS_VERSIONS.find(os => {
    if (os.id.toLowerCase() === normalized) return true;
    if (os.name.toLowerCase() === normalized) return true;
    if (os.aliases?.some(alias => alias.toLowerCase() === normalized)) return true;
    return false;
  });
}
