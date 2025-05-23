# 片山建設工業 DXシステム

## プロジェクト概要

片山建設工業のDXシステムは、勤怠管理と営業日報SFAの2つの主要機能を持つWebアプリケーションです。このシステムにより、現場から事務所までの業務効率を向上させることを目的としています。

## システム仕様（共通基盤）

### フロントエンド
- React + Vite
- UI：Tailwind CSS + Headless UI
- 認証：Clerk

### バックエンド
- Supabase (PostgreSQL + Storage + Edge Functions)
  - 月100万Rowまで無料

### ホスティング
- Cloudflare Pages - Functions（SSR）
  - ドメイン: portal.片山sample.site

### 権限
- 管理者／一般ユーザー／閲覧のみ

### 共通機能
- ダッシュボード (今日の打刻・日報件数)
- CSVエクスポート
- 多言語ラベル (ja/en)

## 主要モジュール

### 1. 勤怠管理クラウド

#### 打刻
- モバイルPWA → 「出勤／退勤」ボタン
- 打刻時刻, GPS, 端末ID
- オフライン時はIndexedDBに保持

#### 勤怠一覧
- 月次カレンダー
- 労働時間, 残業, 欠勤
- 管理者は編集可

#### 休暇申請
- フォーム（種別, 期間, 理由）
- 承認ワークフロー 1段階

#### 設定
- マスタ管理（所定労働時間, 有給残数）
- 会社一括更新

### 2. 営業日報SFA

#### 日報入力
- スマホフォーム：顧客名・訪問内容・写真3枚
- 画像はStorageにWebP形式で保存

#### 一覧＆検索
- 日付・顧客・キーワード
- 無限スクロール

#### 月次レポート
- 集計：訪問回数／受注率
- CSVダウンロード

#### 顧客マスター
- CRUD操作
- 勤怠と共通ユーザDB

## データベース設計

```
// ER図は後日追加予定
```

## 開発スケジュール

| 週 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 要件最終確認 | ■ |   |   |   |   |   |
| UIモック | ■ | ■ |   |   |   |   |
| 勤怠API & DB |   | ■ | ■ | ■ |   |   |
| SFA API & DB |   | ■ | ■ | ■ |   |   |
| 結合テスト |   |   |   | ■ | ■ |   |
| マニュアル作成 |   |   |   |   | ■ | ■ |
| 納品・検収 |   |   |   |   |   | ■ |

## 開発環境セットアップ

```bash
# プロジェクトのセットアップ
npm create vite@latest . -- --template react-ts

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```