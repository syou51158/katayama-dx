-- 日報テーブルに新しいフィールドを追加
ALTER TABLE construction_reports
ADD COLUMN IF NOT EXISTS weather_type TEXT CHECK (weather_type IN ('sunny', 'cloudy', 'rainy', 'snowy', 'foggy', 'windy', 'stormy', 'other')),
ADD COLUMN IF NOT EXISTS humidity NUMERIC,
ADD COLUMN IF NOT EXISTS wind_speed NUMERIC,
ADD COLUMN IF NOT EXISTS wind_direction TEXT,
ADD COLUMN IF NOT EXISTS previous_progress_percentage NUMERIC,
ADD COLUMN IF NOT EXISTS issue_status TEXT CHECK (issue_status IN ('none', 'pending', 'resolved')) DEFAULT 'none';

-- 写真カテゴリ用の列挙型を作成
CREATE TYPE photo_category AS ENUM ('before', 'after', 'progress', 'issue', 'safety', 'material', 'equipment', 'other');

-- 拡張された写真管理用のテーブルを作成
CREATE TABLE IF NOT EXISTS report_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES construction_reports(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  category photo_category NOT NULL DEFAULT 'other',
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスを追加して検索を高速化
CREATE INDEX IF NOT EXISTS idx_report_photos_report_id ON report_photos(report_id);
CREATE INDEX IF NOT EXISTS idx_construction_reports_weather_type ON construction_reports(weather_type);
CREATE INDEX IF NOT EXISTS idx_construction_reports_issue_status ON construction_reports(issue_status);

-- RLSポリシーの設定（拡張写真テーブル）
ALTER TABLE report_photos ENABLE ROW LEVEL SECURITY;

-- ユーザーが自分の日報の写真を管理できるようにする
CREATE POLICY "Users can manage their own report photos"
ON report_photos
USING (
  report_id IN (
    SELECT id FROM construction_reports
    WHERE user_id = auth.uid()
  )
);

-- 認証済みユーザーは全ての写真を閲覧できる
CREATE POLICY "Authenticated users can view all report photos" 
ON report_photos
FOR SELECT
USING (auth.role() = 'authenticated');

-- 管理者は全ての写真を管理できる
CREATE POLICY "Admins can manage all report photos" 
ON report_photos
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
);

-- 既存の日報データを更新して、新しいフィールドを設定
UPDATE construction_reports
SET issue_status = 
  CASE 
    WHEN issues IS NULL OR issues = '' THEN 'none'
    ELSE 'pending'
  END
WHERE issue_status IS NULL;

-- 検索効率向上のための追加インデックス
CREATE INDEX IF NOT EXISTS idx_construction_reports_progress_percentage ON construction_reports(progress_percentage);
CREATE INDEX IF NOT EXISTS idx_construction_reports_report_date ON construction_reports(report_date);

-- 日報機能のRLSポリシーエンハンスメント

-- construction_sitesテーブルに対するINSERT/UPDATE操作を許可するRLSポリシー
CREATE POLICY "ユーザーは工事現場を追加可能" ON construction_sites
  FOR INSERT WITH CHECK (true);

CREATE POLICY "ユーザーは自分が管理する工事現場を編集可能" ON construction_sites
  FOR UPDATE USING (
    manager_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- 既存ポリシーの補完として、管理者は全てのデータにアクセス可能に
CREATE POLICY "管理者は全工事現場データを管理可能" ON construction_sites
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- 顧客テーブルに対するRLSポリシー
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 顧客データの閲覧は全ユーザー可能
CREATE POLICY "ユーザーは顧客データを閲覧可能" ON customers
  FOR SELECT USING (true);

-- 顧客データの追加・編集はすべてのユーザーが可能
CREATE POLICY "ユーザーは顧客データを追加可能" ON customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "ユーザーは顧客データを編集可能" ON customers
  FOR UPDATE USING (true); 