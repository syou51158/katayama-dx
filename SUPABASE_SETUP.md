# Supabase セットアップガイド

## 必要な情報

Supabaseのセットアップが完了したら、以下の情報が必要です：

1. **Supabase URL** - Supabaseプロジェクトのホスト名
2. **Supabase Anon Key** - 匿名認証用の公開APIキー

## 環境変数の設定方法

1. プロジェクトルートにある `.env.local` ファイルを開きます
2. 以下の変数を設定します：

```
VITE_SUPABASE_URL=あなたのSupabase URLをここに入力してください
VITE_SUPABASE_ANON_KEY=あなたのSupabase Anon Keyをここに入力してください
```

## Supabase情報の取得方法

1. [Supabaseダッシュボード](https://app.supabase.io)にログインします
2. プロジェクトを選択します
3. 左側のメニューから「Project Settings」を選択します
4. 「API」タブを選択します
5. 「Project URL」と「Project API keys」セクションから必要な情報をコピーします
   - Project URL: `VITE_SUPABASE_URL`に設定
   - anon/public: `VITE_SUPABASE_ANON_KEY`に設定

## データベーススキーマの適用

Supabaseプロジェクトにデータベーススキーマを適用するには：

1. Supabaseダッシュボードの「SQL Editor」を開きます
2. `supabase/migrations/20240101000000_initial_schema.sql` ファイルの内容をコピーします
3. SQLエディタに貼り付けて実行します

## 接続確認

環境変数を設定した後、以下のコマンドでアプリケーションを起動し、Supabaseへの接続を確認できます：

```bash
npm run dev
```

ブラウザのコンソールにSupabase接続エラーが表示されなければ、接続は成功しています。

## 次のステップ

1. ユーザー認証の実装
2. 勤怠管理機能の開発
3. 営業日報SFA機能の開発

## トラブルシューティング

- 接続エラーが発生する場合は、環境変数が正しく設定されているか確認してください
- Supabaseプロジェクトの設定で、適切なセキュリティルールが設定されているか確認してください
- RLS（Row Level Security）ポリシーが正しく設定されているか確認してください