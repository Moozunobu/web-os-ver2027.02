## 設定ファイルの集約 (`/src/config/osVersions.ts`)

新しい OS バージョンや URL を追加・変更したい場合は、`/src/config/osVersions.ts` 内の `OS_VERSIONS` 配列にオブジェクトを1行追加するだけで完了します。

```typescript
export const OS_VERSIONS: OSVersionConfig[] = [
  {
    id: 'os_version7.5',
    name: 'os_version7.5',
    url: '[https://moozunobu.github.io/web-os-ver7.5/](https://moozunobu.github.io/web-os-ver7.5/)',
    aliases: ['7.5', 'version7.5', 'ver7.5'],
  },
  {
    id: 'os_version7.2',
    name: 'os_version7.2',
    url: '[https://moozunobu.github.io/noob-web-os-ver7.2/](https://moozunobu.github.io/noob-web-os-ver7.2/)',
    aliases: ['7.2', 'version7.2', 'ver7.2'],
  },
  // 💡 新しいバージョンを追加したい場合は、ここに1行追加するだけで自動的にコマンドや選択リストに反映されます。
];
