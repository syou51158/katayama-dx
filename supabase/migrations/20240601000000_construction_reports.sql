-- 建設会社向け日報機能の拡張

-- 工事現場テーブル
CREATE TABLE IF NOT EXISTS construction_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  client_id UUID REFERENCES customers(id),
  start_date DATE NOT NULL,
  expected_end_date DATE,
  actual_end_date DATE,
  status TEXT NOT NULL CHECK (status IN ('planning', 'in_progress', 'completed', 'on_hold', 'cancelled')) DEFAULT 'planning',
  manager_id UUID REFERENCES users(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 建設日報テーブル
CREATE TABLE IF NOT EXISTS construction_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES construction_sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  weather TEXT,
  temperature NUMERIC(4,1),
  work_start_time TIME,
  work_end_time TIME,
  manpower INTEGER,
  progress_percentage NUMERIC(5,2),
  work_description TEXT NOT NULL,
  issues TEXT,
  next_day_plan TEXT,
  safety_checks JSONB,
  images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 資材使用記録テーブル
CREATE TABLE IF NOT EXISTS material_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES construction_reports(id) ON DELETE CASCADE,
  material_name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 機材使用記録テーブル
CREATE TABLE IF NOT EXISTS equipment_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES construction_reports(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  usage_hours NUMERIC(5,2),
  operator TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 作業員記録テーブル
CREATE TABLE IF NOT EXISTS worker_attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES construction_reports(id) ON DELETE CASCADE,
  worker_name TEXT NOT NULL,
  role TEXT,
  hours_worked NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLSポリシーの設定
ALTER TABLE construction_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_attendances ENABLE ROW LEVEL SECURITY;

-- 基本的なRLSポリシー
-- 全ユーザーは工事現場データを閲覧可能
CREATE POLICY "ユーザーは工事現場データを閲覧可能" ON construction_sites
  FOR SELECT USING (true);

-- ユーザーは自分の日報と所属現場の日報を閲覧可能
CREATE POLICY "ユーザーは自分の日報と所属現場の日報を閲覧可能" ON construction_reports
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM construction_sites
      WHERE construction_sites.id = construction_reports.site_id
      AND construction_sites.manager_id = auth.uid()
    )
  );

-- 管理者は全データを閲覧・編集可能
CREATE POLICY "管理者は全日報データを閲覧可能" ON construction_reports
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- 関連テーブルのポリシー
CREATE POLICY "日報関連データアクセスポリシー" ON material_usages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM construction_reports
      WHERE construction_reports.id = material_usages.report_id
      AND (
        construction_reports.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM construction_sites
          WHERE construction_sites.id = construction_reports.site_id
          AND construction_sites.manager_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

CREATE POLICY "日報関連データアクセスポリシー" ON equipment_usages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM construction_reports
      WHERE construction_reports.id = equipment_usages.report_id
      AND (
        construction_reports.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM construction_sites
          WHERE construction_sites.id = construction_reports.site_id
          AND construction_sites.manager_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

CREATE POLICY "日報関連データアクセスポリシー" ON worker_attendances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM construction_reports
      WHERE construction_reports.id = worker_attendances.report_id
      AND (
        construction_reports.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM construction_sites
          WHERE construction_sites.id = construction_reports.site_id
          AND construction_sites.manager_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- インデックス作成
CREATE INDEX idx_construction_sites_manager_id ON construction_sites(manager_id);
CREATE INDEX idx_construction_sites_client_id ON construction_sites(client_id);
CREATE INDEX idx_construction_sites_status ON construction_sites(status);

CREATE INDEX idx_construction_reports_site_id ON construction_reports(site_id);
CREATE INDEX idx_construction_reports_user_id ON construction_reports(user_id);
CREATE INDEX idx_construction_reports_report_date ON construction_reports(report_date);

CREATE INDEX idx_material_usages_report_id ON material_usages(report_id);
CREATE INDEX idx_equipment_usages_report_id ON equipment_usages(report_id);
CREATE INDEX idx_worker_attendances_report_id ON worker_attendances(report_id); 