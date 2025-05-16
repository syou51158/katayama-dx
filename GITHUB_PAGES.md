# GitHub Pagesへのデプロイ手順

このプロジェクトは、GitHub Pagesを使用して公開できるように設定されています。

## 前提条件

- GitHubアカウントを持っていること
- リポジトリの作成権限があること

## デプロイ手順

1. **GitHubリポジトリの作成**

   GitHubで新しいリポジトリを作成します。
   
   例: `username/katayama-dx-app`

2. **リポジトリにコードをプッシュ**

   ```bash
   # リモートリポジトリを追加
   git remote add origin https://github.com/username/katayama-dx-app.git
   
   # 変更をコミット
   git add .
   git commit -m "Initial commit"
   
   # mainブランチにプッシュ
   git push -u origin main
   ```

3. **GitHub Pagesの設定**

   1. リポジトリの「Settings」タブを開く
   2. 左側のメニューから「Pages」を選択
   3. 「Build and deployment」セクションで以下を設定:
      - Source: GitHub Actions
   4. 自動的に実行されるワークフローが完了するのを待つ

4. **デプロイの確認**

   デプロイが完了すると、GitHub Pagesの設定ページにURLが表示されます。
   
   例: `https://username.github.io/katayama-dx-app/`

## 注意事項

- このアプリケーションはHashRouterを使用しており、URLに`#`が含まれます（例: `/#/login`）
- 環境変数（Supabase接続情報など）はvite.config.tsにデフォルト値として設定されています
- 実運用環境では、環境変数を適切に設定することを推奨します

## デプロイのトラブルシューティング

1. **404エラーが表示される場合**
   - GitHub Actions のワークフローが正常に完了したか確認する
   - リポジトリの設定でGitHub Pagesが正しく設定されているか確認する

2. **アプリケーションが正しく動作しない場合**
   - ブラウザの開発者ツールでエラーを確認する
   - Supabaseの接続情報が正しく設定されているか確認する
   - GitHub Actions のログを確認する

## カスタマイズ

リポジトリ名が`katayama-dx-app`以外の場合は、以下の変更が必要です:

1. `vite.config.ts`ファイルを編集:
   ```javascript
   const repoName = env.VITE_REPO_NAME || 'あなたのリポジトリ名';
   ```

2. 環境変数を設定する場合は、リポジトリの「Settings」→「Secrets and variables」→「Actions」から環境変数を追加 