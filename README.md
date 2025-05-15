# 片山建設工業 DXシステム

## プロジェクト概要

片山建設工業のDXシステムは、勤怠管理と営業日報SFAの2つの主要機能を持つWebアプリケーションです。このシステムにより、現場から事務所までの業務効率を向上させることを目的としています。

## セットアップ手順

### 1. 前提条件

- Node.js (v18以上)
- npm (v9以上)

### 2. 依存関係のインストール

PowerShellやコマンドプロンプトで以下のコマンドを実行します：

```bash
# プロジェクトディレクトリに移動
cd D:\katayama-dx\katayama-dx-app

# 依存関係をインストール
npm install
```

### 3. 現在の問題点と解決方法

現在のプロジェクトには以下の問題があります：

#### 3.1. 未実装ページへの参照

`App.tsx`では実装されていない以下のページをインポートしています：
- ReportNew.tsx
- Reports.tsx 
- ReportMonthly.tsx
- AdminMaster.tsx
- AdminSettings.tsx

**解決方法**: App.tsxファイルを修正して、これらのページコンポーネントを一時的に仮実装に置き換えました。

#### 3.2. Tailwind CSS設定の問題

PostCSSの設定に問題があり、TailwindCSSのプラグインが正しく設定されていません。

**解決方法**: `postcss.config.js`ファイルを以下のように更新しました：

```js
export default {
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 4. ローカル開発サーバーの起動

以下のコマンドを実行してローカル開発サーバーを起動します：

```bash
# ターミナルで実行中のNodeプロセスをすべて終了（必要に応じて）
taskkill /F /IM node.exe
# または PowerShellの場合
# Stop-Process -name "node" -force

# 開発サーバーを起動
npm run dev
```

アプリケーションは以下のURLで利用可能になります：
- http://localhost:5173

## 主要機能

現在実装されている機能：
- ダッシュボード
- 打刻機能
- 勤怠一覧
- 休暇申請

開発中の機能：
- 営業日報
- 管理者機能

## Supabase設定

Supabaseを使用するには、`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```
VITE_SUPABASE_URL=あなたのSupabase URLをここに入力してください
VITE_SUPABASE_ANON_KEY=あなたのSupabase Anon Keyをここに入力してください
```

詳細な設定手順については `SUPABASE_SETUP.md` を参照してください。

## トラブルシューティング

### アプリが起動しない場合

1. 実行するディレクトリが正しいか確認してください（D:\katayama-dx\katayama-dx-app）
2. すべてのNode.jsプロセスを終了させてから再度試してください
3. package.jsonが存在することを確認してください
4. `npm install`を実行して依存関係を再インストールしてください

### 「モジュールが見つからない」エラーが表示される場合

1. `npm install`を実行して依存関係を再インストールしてください
2. node_modulesフォルダを削除して`npm install`を実行してください
