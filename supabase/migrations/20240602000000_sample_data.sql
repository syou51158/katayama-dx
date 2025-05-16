-- 建設会社向け日報機能のサンプルデータ

-- サンプルデータの実装前にusersテーブルとcustomersテーブルが存在していることを確認
DO $$
BEGIN
  -- ユーザーデータの確認
  IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN
    -- サンプルユーザーの追加（もし存在しなければ）
    INSERT INTO users (id, email, name, role, created_at)
    VALUES 
      ('d7bed86e-b310-4896-b4ff-1c0861979859', 'yamada@example.com', '山田太郎', 'admin', NOW()),
      ('58e6b15c-3708-4b44-8df7-886a34904901', 'tanaka@example.com', '田中次郎', 'manager', NOW()),
      ('f14cea7b-b851-4054-bb10-a5f4671d379f', 'suzuki@example.com', '鈴木三郎', 'user', NOW());
  END IF;

  -- 顧客データの確認
  IF NOT EXISTS (SELECT 1 FROM customers LIMIT 1) THEN
    -- サンプル顧客の追加（もし存在しなければ）
    INSERT INTO customers (id, name, contact_person, phone, email, address, created_at)
    VALUES 
      ('17b5ab8c-f8a5-4e48-b92b-8a0ead482a2a', '株式会社東京建設', '佐藤一郎', '03-1234-5678', 'sato@tokyo-kensetsu.example.com', '東京都新宿区西新宿1-1-1', NOW()),
      ('28c6bc9d-0a96-5f58-c01c-9b1fbd682b3b', '大阪開発株式会社', '高橋二郎', '06-2345-6789', 'takahashi@osaka-dev.example.com', '大阪府大阪市北区梅田2-2-2', NOW()),
      ('39d7cd0e-1ba7-6069-d12d-0c20ce793c4c', '名古屋不動産株式会社', '伊藤三郎', '052-3456-7890', 'ito@nagoya-fudosan.example.com', '愛知県名古屋市中区栄3-3-3', NOW());
  END IF;
END $$;

-- 工事現場のサンプルデータ
INSERT INTO construction_sites (
  id, name, address, client_id, start_date, expected_end_date, 
  status, manager_id, description, created_at
)
VALUES
  (
    'f5a28984-c83f-4a80-9fa0-7d85a59b4300', 
    '新宿オフィスビル建設プロジェクト', 
    '東京都新宿区西新宿2-8-1', 
    '17b5ab8c-f8a5-4e48-b92b-8a0ead482a2a', 
    '2024-05-01', 
    '2024-12-31', 
    'in_progress', 
    'd7bed86e-b310-4896-b4ff-1c0861979859', 
    '地上20階、地下2階のオフィスビル建設プロジェクト。環境に配慮した最新設備を導入予定。',
    NOW()
  ),
  (
    'c7b39075-d94e-4b81-0ba1-8e96b5a0d211', 
    '大阪マンション建設工事', 
    '大阪府大阪市中央区本町1-5-6', 
    '28c6bc9d-0a96-5f58-c01c-9b1fbd682b3b', 
    '2024-03-15', 
    '2024-09-30', 
    'in_progress', 
    '58e6b15c-3708-4b44-8df7-886a34904901', 
    '全100戸の高級マンション建設。耐震性能と居住性を重視した設計。',
    NOW()
  ),
  (
    'd8c40166-e05f-5c92-1cb2-9f07c6b1e322', 
    '名古屋商業施設改修工事', 
    '愛知県名古屋市中区栄4-4-4', 
    '39d7cd0e-1ba7-6069-d12d-0c20ce793c4c', 
    '2024-04-10', 
    '2024-08-15', 
    'in_progress', 
    '58e6b15c-3708-4b44-8df7-886a34904901', 
    '既存商業施設の全面改修工事。省エネ設備への更新と内装の刷新。',
    NOW()
  ),
  (
    'e9d51277-f16g-6da3-2dc3-0h18d7c2f433', 
    '横浜倉庫建設プロジェクト', 
    '神奈川県横浜市鶴見区大黒ふ頭1-2-3', 
    '17b5ab8c-f8a5-4e48-b92b-8a0ead482a2a', 
    '2024-02-20', 
    '2024-07-31', 
    'in_progress', 
    'd7bed86e-b310-4896-b4ff-1c0861979859', 
    '大規模物流倉庫の建設。自動化システムを導入した最新鋭の設備を実装。',
    NOW()
  ),
  (
    'f0e62388-g27h-7eb4-3ed4-1i29e8d3g544', 
    '札幌ホテル建設工事', 
    '北海道札幌市中央区北5条西6丁目', 
    '28c6bc9d-0a96-5f58-c01c-9b1fbd682b3b', 
    '2024-06-01', 
    '2025-04-30', 
    'planning', 
    'f14cea7b-b851-4054-bb10-a5f4671d379f', 
    '観光客向け高級ホテルの新規建設。温泉設備と北海道の景観を活かした設計。',
    NOW()
  );

-- 建設日報のサンプルデータ
INSERT INTO construction_reports (
  id, site_id, user_id, report_date, weather, temperature, 
  work_start_time, work_end_time, manpower, progress_percentage, 
  work_description, issues, next_day_plan, safety_checks, images, created_at
)
VALUES
  (
    'a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d', 
    'f5a28984-c83f-4a80-9fa0-7d85a59b4300', 
    'd7bed86e-b310-4896-b4ff-1c0861979859', 
    '2024-06-01', 
    '晴れ', 
    25.5, 
    '08:00', 
    '17:30', 
    15, 
    12.5, 
    '基礎工事の続き。コンクリート打設を完了し、型枠の解体作業を開始した。予定通り進行中。',
    '特になし。',
    '型枠解体の続きと鉄筋組立の準備を行う。',
    '{"morning_meeting": true, "safety_equipment": true, "risk_assessment": true, "site_clean": true, "tools_inspection": true, "additional_notes": "熱中症対策として休憩時間を増やした"}',
    ARRAY[]::text[],
    NOW()
  ),
  (
    'b2c3d4e5-f6a7-5b6c-7d8e-9f0a1b2c3d4e', 
    'f5a28984-c83f-4a80-9fa0-7d85a59b4300', 
    '58e6b15c-3708-4b44-8df7-886a34904901', 
    '2024-06-02', 
    '曇り', 
    23.0, 
    '08:00', 
    '17:00', 
    12, 
    15.0, 
    '型枠解体を完了し、二階部分の鉄筋組立を開始。資材の搬入も並行して実施。',
    '午後から小雨があり、一部作業に遅れが生じた。',
    '鉄筋組立の続きと二階部分の型枠設置を開始する。',
    '{"morning_meeting": true, "safety_equipment": true, "risk_assessment": true, "site_clean": true, "tools_inspection": true, "additional_notes": "雨天時の滑り対策を強化"}',
    ARRAY[]::text[],
    NOW()
  ),
  (
    'c3d4e5f6-a7b8-6c7d-8e9f-0a1b2c3d4e5f', 
    'c7b39075-d94e-4b81-0ba1-8e96b5a0d211', 
    '58e6b15c-3708-4b44-8df7-886a34904901', 
    '2024-06-01', 
    '晴れ', 
    28.0, 
    '08:30', 
    '17:30', 
    20, 
    35.0, 
    '5階部分の内装工事を実施。配線工事と壁面下地処理を完了。',
    '一部資材の納品に遅れがあり、明日に持ち越し。',
    '遅れている資材の確認と6階部分の準備作業を行う。',
    '{"morning_meeting": true, "safety_equipment": true, "risk_assessment": true, "site_clean": false, "tools_inspection": true, "additional_notes": "高所作業が多いため、安全帯の使用を徹底"}',
    ARRAY[]::text[],
    NOW()
  ),
  (
    'd4e5f6a7-b8c9-7d8e-9f0a-1b2c3d4e5f6a', 
    'c7b39075-d94e-4b81-0ba1-8e96b5a0d211', 
    'f14cea7b-b851-4054-bb10-a5f4671d379f', 
    '2024-06-02', 
    '晴れ', 
    29.5, 
    '08:00', 
    '18:00', 
    22, 
    37.5, 
    '配管工事と6階部分の準備作業を実施。遅れていた資材も納品され、作業は予定通り進行。',
    '熱中症の懸念があり、作業員の体調管理に注意。',
    '6階部分の内装工事を本格的に開始する予定。',
    '{"morning_meeting": true, "safety_equipment": true, "risk_assessment": true, "site_clean": true, "tools_inspection": true, "additional_notes": "熱中症対策として冷却グッズを全員に配布"}',
    ARRAY[]::text[],
    NOW()
  ),
  (
    'e5f6a7b8-c9d0-8e9f-0a1b-2c3d4e5f6a7b', 
    'd8c40166-e05f-5c92-1cb2-9f07c6b1e322', 
    'd7bed86e-b310-4896-b4ff-1c0861979859', 
    '2024-06-01', 
    '雨', 
    20.0, 
    '09:00', 
    '16:30', 
    8, 
    45.0, 
    '内装解体作業の最終段階。廃材の搬出と清掃を行った。',
    '雨天のため外部作業に影響があったが、内部作業に切り替えて対応。',
    '新規設備の搬入と設置準備を行う。',
    '{"morning_meeting": true, "safety_equipment": true, "risk_assessment": true, "site_clean": true, "tools_inspection": true, "additional_notes": "滑りやすい床面への注意喚起を徹底"}',
    ARRAY[]::text[],
    NOW()
  ),
  (
    'f6a7b8c9-d0e1-9f0a-1b2c-3d4e5f6a7b8c', 
    'd8c40166-e05f-5c92-1cb2-9f07c6b1e322', 
    '58e6b15c-3708-4b44-8df7-886a34904901', 
    '2024-06-02', 
    '曇り時々雨', 
    21.5, 
    '08:30', 
    '17:00', 
    10, 
    48.0, 
    '新規空調設備の搬入と設置作業を開始。電気配線の更新も同時に進行。',
    '一部の古い配管に劣化が見られたため、交換が必要。',
    '電気配線作業の続きと空調設備の接続テストを行う。',
    '{"morning_meeting": true, "safety_equipment": true, "risk_assessment": true, "site_clean": true, "tools_inspection": true, "additional_notes": "電気作業の安全確認を徹底"}',
    ARRAY[]::text[],
    NOW()
  ),
  (
    'a7b8c9d0-e1f2-0a1b-2c3d-4e5f6a7b8c9d', 
    'e9d51277-f16g-6da3-2dc3-0h18d7c2f433', 
    'f14cea7b-b851-4054-bb10-a5f4671d379f', 
    '2024-06-01', 
    '晴れ', 
    26.0, 
    '08:00', 
    '17:00', 
    25, 
    60.0, 
    '外壁パネルの取り付け作業を実施。南側と東側の設置を完了。',
    '強風により一時作業を中断したが、その後再開できた。',
    '西側と北側の外壁パネル設置を行う予定。',
    '{"morning_meeting": true, "safety_equipment": true, "risk_assessment": true, "site_clean": true, "tools_inspection": true, "additional_notes": "高所作業が多いため、足場の安全確認を頻繁に実施"}',
    ARRAY[]::text[],
    NOW()
  );

-- 資材使用記録のサンプルデータ
INSERT INTO material_usages (
  id, report_id, material_name, quantity, unit, notes, created_at
)
VALUES
  (
    'g7h8i9j0-k1l2-1a2b-3c4d-5e6f7g8h9i0j', 
    'a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d', 
    'コンクリート', 
    15.5, 
    'm³', 
    '基礎部分用', 
    NOW()
  ),
  (
    'h8i9j0k1-l2m3-2b3c-4d5e-6f7g8h9i0j1k', 
    'a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d', 
    '鉄筋 D16', 
    350.0, 
    'kg', 
    '基礎補強用', 
    NOW()
  ),
  (
    'i9j0k1l2-m3n4-3c4d-5e6f-7g8h9i0j1k2l', 
    'b2c3d4e5-f6a7-5b6c-7d8e-9f0a1b2c3d4e', 
    '型枠用合板', 
    30.0, 
    '枚', 
    '2階床用', 
    NOW()
  ),
  (
    'j0k1l2m3-n4o5-4d5e-6f7g-8h9i0j1k2l3m', 
    'c3d4e5f6-a7b8-6c7d-8e9f-0a1b2c3d4e5f', 
    '石膏ボード', 
    150.0, 
    '枚', 
    '内壁用', 
    NOW()
  ),
  (
    'k1l2m3n4-o5p6-5e6f-7g8h-9i0j1k2l3m4n', 
    'c3d4e5f6-a7b8-6c7d-8e9f-0a1b2c3d4e5f', 
    '配線ケーブル', 
    500.0, 
    'm', 
    '電気工事用', 
    NOW()
  ),
  (
    'l2m3n4o5-p6q7-6f7g-8h9i-0j1k2l3m4n5o', 
    'd4e5f6a7-b8c9-7d8e-9f0a-1b2c3d4e5f6a', 
    '塩ビ管', 
    120.0, 
    'm', 
    '配管工事用', 
    NOW()
  ),
  (
    'm3n4o5p6-q7r8-7g8h-9i0j-1k2l3m4n5o6p', 
    'e5f6a7b8-c9d0-8e9f-0a1b-2c3d4e5f6a7b', 
    '断熱材', 
    80.0, 
    'm²', 
    '天井用', 
    NOW()
  ),
  (
    'n4o5p6q7-r8s9-8h9i-0j1k-2l3m4n5o6p7q', 
    'f6a7b8c9-d0e1-9f0a-1b2c-3d4e5f6a7b8c', 
    '空調機器部品', 
    5.0, 
    'セット', 
    '空調設備用', 
    NOW()
  ),
  (
    'o5p6q7r8-s9t0-9i0j-1k2l-3m4n5o6p7q8r', 
    'a7b8c9d0-e1f2-0a1b-2c3d-4e5f6a7b8c9d', 
    '外壁パネル', 
    40.0, 
    '枚', 
    '南・東側用', 
    NOW()
  );

-- 機材使用記録のサンプルデータ
INSERT INTO equipment_usages (
  id, report_id, equipment_name, usage_hours, operator, notes, created_at
)
VALUES
  (
    'p6q7r8s9-t0u1-0j1k-2l3m-4n5o6p7q8r9s', 
    'a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d', 
    'コンクリートミキサー車', 
    5.5, 
    '山本', 
    'コンクリート打設用', 
    NOW()
  ),
  (
    'q7r8s9t0-u1v2-1k2l-3m4n-5o6p7q8r9s0t', 
    'a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d', 
    'バックホウ', 
    4.0, 
    '佐々木', 
    '掘削作業用', 
    NOW()
  ),
  (
    'r8s9t0u1-v2w3-2l3m-4n5o-6p7q8r9s0t1u', 
    'b2c3d4e5-f6a7-5b6c-7d8e-9f0a1b2c3d4e', 
    'クレーン車', 
    6.0, 
    '田村', 
    '資材揚重用', 
    NOW()
  ),
  (
    's9t0u1v2-w3x4-3m4n-5o6p-7q8r9s0t1u2v', 
    'c3d4e5f6-a7b8-6c7d-8e9f-0a1b2c3d4e5f', 
    '高所作業車', 
    7.5, 
    '中村', 
    '内装工事用', 
    NOW()
  ),
  (
    't0u1v2w3-x4y5-4n5o-6p7q-8r9s0t1u2v3w', 
    'd4e5f6a7-b8c9-7d8e-9f0a-1b2c3d4e5f6a', 
    '配管工具セット', 
    8.0, 
    '小林', 
    '配管作業用', 
    NOW()
  ),
  (
    'u1v2w3x4-y5z6-5o6p-7q8r-9s0t1u2v3w4x', 
    'e5f6a7b8-c9d0-8e9f-0a1b-2c3d4e5f6a7b', 
    '解体用重機', 
    6.0, 
    '加藤', 
    '内装解体用', 
    NOW()
  ),
  (
    'v2w3x4y5-z6a7-6p7q-8r9s-0t1u2v3w4x5y', 
    'f6a7b8c9-d0e1-9f0a-1b2c-3d4e5f6a7b8c', 
    '電気工事用工具セット', 
    7.0, 
    '渡辺', 
    '配線作業用', 
    NOW()
  ),
  (
    'w3x4y5z6-a7b8-7q8r-9s0t-1u2v3w4x5y6z', 
    'a7b8c9d0-e1f2-0a1b-2c3d-4e5f6a7b8c9d', 
    'パネル取付用機材', 
    8.5, 
    '斎藤', 
    '外壁パネル設置用', 
    NOW()
  );

-- 作業員記録のサンプルデータ
INSERT INTO worker_attendances (
  id, report_id, worker_name, role, hours_worked, notes, created_at
)
VALUES
  (
    'x4y5z6a7-b8c9-8r9s-0t1u-2v3w4x5y6z7a', 
    'a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d', 
    '山田太郎', 
    '現場監督', 
    8.5, 
    '全体の指示・監督', 
    NOW()
  ),
  (
    'y5z6a7b8-c9d0-9s0t-1u2v-3w4x5y6z7a8b', 
    'a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d', 
    '田中次郎', 
    '作業責任者', 
    8.5, 
    'コンクリート打設の監督', 
    NOW()
  ),
  (
    'z6a7b8c9-d0e1-0t1u-2v3w-4x5y6z7a8b9c', 
    'a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d', 
    '鈴木一郎', 
    '作業員', 
    8.0, 
    '型枠解体担当', 
    NOW()
  ),
  (
    'a7b8c9d0-e1f2-1u2v-3w4x-5y6z7a8b9c0d', 
    'b2c3d4e5-f6a7-5b6c-7d8e-9f0a1b2c3d4e', 
    '佐藤健太', 
    '鉄筋工', 
    8.0, 
    '鉄筋組立担当', 
    NOW()
  ),
  (
    'b8c9d0e1-f2g3-2v3w-4x5y-6z7a8b9c0d1e', 
    'c3d4e5f6-a7b8-6c7d-8e9f-0a1b2c3d4e5f', 
    '高橋幸子', 
    '電気工事士', 
    8.0, 
    '配線工事担当', 
    NOW()
  ),
  (
    'c9d0e1f2-g3h4-3w4x-5y6z-7a8b9c0d1e2f', 
    'd4e5f6a7-b8c9-7d8e-9f0a-1b2c3d4e5f6a', 
    '伊藤誠', 
    '配管工', 
    9.0, 
    '配管工事担当', 
    NOW()
  ),
  (
    'd0e1f2g3-h4i5-4x5y-6z7a-8b9c0d1e2f3g', 
    'e5f6a7b8-c9d0-8e9f-0a1b-2c3d4e5f6a7b', 
    '渡辺浩', 
    '解体作業員', 
    7.5, 
    '内装解体担当', 
    NOW()
  ),
  (
    'e1f2g3h4-i5j6-5y6z-7a8b-9c0d1e2f3g4h', 
    'f6a7b8c9-d0e1-9f0a-1b2c-3d4e5f6a7b8c', 
    '中村大輔', 
    '設備工事士', 
    8.5, 
    '空調設備設置担当', 
    NOW()
  ),
  (
    'f2g3h4i5-j6k7-6z7a-8b9c-0d1e2f3g4h5i', 
    'a7b8c9d0-e1f2-0a1b-2c3d-4e5f6a7b8c9d', 
    '小林隆', 
    'パネル取付工', 
    8.0, 
    '外壁パネル設置担当', 
    NOW()
  );
``` 
</rewritten_file>