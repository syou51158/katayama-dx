// サンプルデータ挿入スクリプト
import { createClient } from '@supabase/supabase-js'

// Supabaseの接続情報（supabase.tsからコピー）
const SUPABASE_URL = 'https://iygiuutslpnvrheqbqgv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Z2l1dXRzbHBudnJoZXFicWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjkzNzksImV4cCI6MjA2Mjg0NTM3OX0.skNBoqKqMl69jLLCyGvfS6CUY7TiCftaUOuLlrdUl10';

// Supabaseクライアントの初期化
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// サンプルデータの実行
const insertSampleData = async () => {
  console.log('サンプルデータの挿入を開始します...');

  try {
    // ユーザーデータの確認と追加
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (!existingUsers || existingUsers.length === 0) {
      console.log('ユーザーデータを追加します...');
      await supabase
        .from('users')
        .insert([
          {
            id: 'd7bed86e-b310-4896-b4ff-1c0861979859',
            email: 'yamada@example.com',
            name: '山田太郎',
            role: 'admin',
            created_at: new Date().toISOString()
          },
          {
            id: '58e6b15c-3708-4b44-8df7-886a34904901',
            email: 'tanaka@example.com',
            name: '田中次郎',
            role: 'manager',
            created_at: new Date().toISOString()
          },
          {
            id: 'f14cea7b-b851-4054-bb10-a5f4671d379f',
            email: 'suzuki@example.com',
            name: '鈴木三郎',
            role: 'user',
            created_at: new Date().toISOString()
          }
        ]);
    }

    // 顧客データの確認と追加
    const { data: existingCustomers } = await supabase
      .from('customers')
      .select('id')
      .limit(1);

    if (!existingCustomers || existingCustomers.length === 0) {
      console.log('顧客データを追加します...');
      await supabase
        .from('customers')
        .insert([
          {
            id: '17b5ab8c-f8a5-4e48-b92b-8a0ead482a2a',
            name: '株式会社東京建設',
            contact_person: '佐藤一郎',
            phone: '03-1234-5678',
            email: 'sato@tokyo-kensetsu.example.com',
            address: '東京都新宿区西新宿1-1-1',
            created_at: new Date().toISOString()
          },
          {
            id: '28c6bc9d-0a96-5f58-c01c-9b1fbd682b3b',
            name: '大阪開発株式会社',
            contact_person: '高橋二郎',
            phone: '06-2345-6789',
            email: 'takahashi@osaka-dev.example.com',
            address: '大阪府大阪市北区梅田2-2-2',
            created_at: new Date().toISOString()
          },
          {
            id: '39d7cd0e-1ba7-6069-d12d-0c20ce793c4c',
            name: '名古屋不動産株式会社',
            contact_person: '伊藤三郎',
            phone: '052-3456-7890',
            email: 'ito@nagoya-fudosan.example.com',
            address: '愛知県名古屋市中区栄3-3-3',
            created_at: new Date().toISOString()
          }
        ]);
    }

    // 工事現場のサンプルデータを追加
    console.log('工事現場データを追加します...');
    const { data: constructionSites, error: sitesError } = await supabase
      .from('construction_sites')
      .insert([
        {
          id: 'f5a28984-c83f-4a80-9fa0-7d85a59b4300',
          name: '新宿オフィスビル建設プロジェクト',
          address: '東京都新宿区西新宿2-8-1',
          client_id: '17b5ab8c-f8a5-4e48-b92b-8a0ead482a2a',
          start_date: '2024-05-01',
          expected_end_date: '2024-12-31',
          status: 'in_progress',
          manager_id: 'd7bed86e-b310-4896-b4ff-1c0861979859',
          description: '地上20階、地下2階のオフィスビル建設プロジェクト。環境に配慮した最新設備を導入予定。',
          created_at: new Date().toISOString()
        },
        {
          id: 'c7b39075-d94e-4b81-0ba1-8e96b5a0d211',
          name: '大阪マンション建設工事',
          address: '大阪府大阪市中央区本町1-5-6',
          client_id: '28c6bc9d-0a96-5f58-c01c-9b1fbd682b3b',
          start_date: '2024-03-15',
          expected_end_date: '2024-09-30',
          status: 'in_progress',
          manager_id: '58e6b15c-3708-4b44-8df7-886a34904901',
          description: '全100戸の高級マンション建設。耐震性能と居住性を重視した設計。',
          created_at: new Date().toISOString()
        },
        {
          id: 'd8c40166-e05f-5c92-1cb2-9f07c6b1e322',
          name: '名古屋商業施設改修工事',
          address: '愛知県名古屋市中区栄4-4-4',
          client_id: '39d7cd0e-1ba7-6069-d12d-0c20ce793c4c',
          start_date: '2024-04-10',
          expected_end_date: '2024-08-15',
          status: 'in_progress',
          manager_id: '58e6b15c-3708-4b44-8df7-886a34904901',
          description: '既存商業施設の全面改修工事。省エネ設備への更新と内装の刷新。',
          created_at: new Date().toISOString()
        },
        {
          id: 'e9d51277-f16a-4da3-9dc3-0b18d7c2f433',
          name: '横浜倉庫建設プロジェクト',
          address: '神奈川県横浜市鶴見区大黒ふ頭1-2-3',
          client_id: '17b5ab8c-f8a5-4e48-b92b-8a0ead482a2a',
          start_date: '2024-02-20',
          expected_end_date: '2024-07-31',
          status: 'in_progress',
          manager_id: 'd7bed86e-b310-4896-b4ff-1c0861979859',
          description: '大規模物流倉庫の建設。自動化システムを導入した最新鋭の設備を実装。',
          created_at: new Date().toISOString()
        },
        {
          id: 'f0e62388-a27b-4eb4-8ed4-1a29e8d3a544',
          name: '札幌ホテル建設工事',
          address: '北海道札幌市中央区北5条西6丁目',
          client_id: '28c6bc9d-0a96-5f58-c01c-9b1fbd682b3b',
          start_date: '2024-06-01',
          expected_end_date: '2025-04-30',
          status: 'planning',
          manager_id: 'f14cea7b-b851-4054-bb10-a5f4671d379f',
          description: '観光客向け高級ホテルの新規建設。温泉設備と北海道の景観を活かした設計。',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (sitesError) {
      console.error('工事現場データの追加に失敗しました:', sitesError);
      return;
    }

    // 建設日報のサンプルデータを追加
    console.log('建設日報データを追加します...');
    const reports = [
      {
        id: 'a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d',
        site_id: 'f5a28984-c83f-4a80-9fa0-7d85a59b4300',
        user_id: 'd7bed86e-b310-4896-b4ff-1c0861979859',
        report_date: '2024-06-01',
        weather: '晴れ',
        temperature: 25.5,
        work_start_time: '08:00',
        work_end_time: '17:30',
        manpower: 15,
        progress_percentage: 12.5,
        work_description: '基礎工事の続き。コンクリート打設を完了し、型枠の解体作業を開始した。予定通り進行中。',
        issues: '特になし。',
        next_day_plan: '型枠解体の続きと鉄筋組立の準備を行う。',
        safety_checks: {
          morning_meeting: true,
          safety_equipment: true,
          risk_assessment: true,
          site_clean: true,
          tools_inspection: true,
          additional_notes: '熱中症対策として休憩時間を増やした'
        },
        images: [],
        created_at: new Date().toISOString()
      },
      {
        id: 'b2c3d4e5-f6a7-5b6c-7d8e-9f0a1b2c3d4e',
        site_id: 'f5a28984-c83f-4a80-9fa0-7d85a59b4300',
        user_id: '58e6b15c-3708-4b44-8df7-886a34904901',
        report_date: '2024-06-02',
        weather: '曇り',
        temperature: 23.0,
        work_start_time: '08:00',
        work_end_time: '17:00',
        manpower: 12,
        progress_percentage: 15.0,
        work_description: '型枠解体を完了し、二階部分の鉄筋組立を開始。資材の搬入も並行して実施。',
        issues: '午後から小雨があり、一部作業に遅れが生じた。',
        next_day_plan: '鉄筋組立の続きと二階部分の型枠設置を開始する。',
        safety_checks: {
          morning_meeting: true,
          safety_equipment: true,
          risk_assessment: true,
          site_clean: true,
          tools_inspection: true,
          additional_notes: '雨天時の滑り対策を強化'
        },
        images: [],
        created_at: new Date().toISOString()
      },
      {
        id: 'c3d4e5f6-a7b8-6c7d-8e9f-0a1b2c3d4e5f',
        site_id: 'c7b39075-d94e-4b81-0ba1-8e96b5a0d211',
        user_id: '58e6b15c-3708-4b44-8df7-886a34904901',
        report_date: '2024-06-01',
        weather: '晴れ',
        temperature: 28.0,
        work_start_time: '08:30',
        work_end_time: '17:30',
        manpower: 20,
        progress_percentage: 35.0,
        work_description: '5階部分の内装工事を実施。配線工事と壁面下地処理を完了。',
        issues: '一部資材の納品に遅れがあり、明日に持ち越し。',
        next_day_plan: '遅れている資材の確認と6階部分の準備作業を行う。',
        safety_checks: {
          morning_meeting: true,
          safety_equipment: true,
          risk_assessment: true,
          site_clean: false,
          tools_inspection: true,
          additional_notes: '高所作業が多いため、安全帯の使用を徹底'
        },
        images: [],
        created_at: new Date().toISOString()
      }
    ];

    const { data: constructionReports, error: reportsError } = await supabase
      .from('construction_reports')
      .insert(reports)
      .select();

    if (reportsError) {
      console.error('建設日報データの追加に失敗しました:', reportsError);
      return;
    }

    // 資材使用記録のサンプルデータを追加
    console.log('資材使用記録を追加します...');
    const materials = [
      {
        id: 'a7b8c9d0-e1f2-1a2b-3c4d-5e6f7a8b9c0d',
        report_id: 'a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d',
        material_name: 'コンクリート',
        quantity: 15.5,
        unit: 'm³',
        notes: '基礎部分用',
        created_at: new Date().toISOString()
      },
      {
        id: 'b8c9d0e1-f2a3-2b3c-4d5e-6f7a8b9c0d1e',
        report_id: 'a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d',
        material_name: '鉄筋 D16',
        quantity: 350.0,
        unit: 'kg',
        notes: '基礎補強用',
        created_at: new Date().toISOString()
      },
      {
        id: 'c9d0e1f2-a3b4-3c4d-5e6f-7a8b9c0d1e2f',
        report_id: 'b2c3d4e5-f6a7-5b6c-7d8e-9f0a1b2c3d4e',
        material_name: '型枠用合板',
        quantity: 30.0,
        unit: '枚',
        notes: '2階床用',
        created_at: new Date().toISOString()
      }
    ];

    const { error: materialsError } = await supabase
      .from('material_usages')
      .insert(materials);

    if (materialsError) {
      console.error('資材使用記録の追加に失敗しました:', materialsError);
      return;
    }

    // 機材使用記録のサンプルデータを追加
    console.log('機材使用記録を追加します...');
    const equipment = [
      {
        id: 'd0e1f2a3-b4c5-4d5e-6f7a-8b9c0d1e2f3a',
        report_id: 'a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d',
        equipment_name: 'コンクリートミキサー車',
        usage_hours: 5.5,
        operator: '山本',
        notes: 'コンクリート打設用',
        created_at: new Date().toISOString()
      },
      {
        id: 'e1f2a3b4-c5d6-5e6f-7a8b-9c0d1e2f3a4b',
        report_id: 'a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d',
        equipment_name: 'バックホウ',
        usage_hours: 4.0,
        operator: '佐々木',
        notes: '掘削作業用',
        created_at: new Date().toISOString()
      },
      {
        id: 'f2a3b4c5-d6e7-6f7a-8b9c-0d1e2f3a4b5c',
        report_id: 'b2c3d4e5-f6a7-5b6c-7d8e-9f0a1b2c3d4e',
        equipment_name: 'クレーン車',
        usage_hours: 6.0,
        operator: '田村',
        notes: '資材揚重用',
        created_at: new Date().toISOString()
      }
    ];

    const { error: equipmentError } = await supabase
      .from('equipment_usages')
      .insert(equipment);

    if (equipmentError) {
      console.error('機材使用記録の追加に失敗しました:', equipmentError);
      return;
    }

    // 作業員記録のサンプルデータを追加
    console.log('作業員記録を追加します...');
    const workers = [
      {
        id: 'a3b4c5d6-e7f8-7a8b-9c0d-1e2f3a4b5c6d',
        report_id: 'a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d',
        worker_name: '山田太郎',
        role: '現場監督',
        hours_worked: 8.5,
        notes: '全体の指示・監督',
        created_at: new Date().toISOString()
      },
      {
        id: 'b4c5d6e7-f8a9-8b9c-0d1e-2f3a4b5c6d7e',
        report_id: 'a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d',
        worker_name: '田中次郎',
        role: '作業責任者',
        hours_worked: 8.5,
        notes: 'コンクリート打設の監督',
        created_at: new Date().toISOString()
      },
      {
        id: 'c5d6e7f8-a9b0-9c0d-1e2f-3a4b5c6d7e8f',
        report_id: 'a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d',
        worker_name: '鈴木一郎',
        role: '作業員',
        hours_worked: 8.0,
        notes: '型枠解体担当',
        created_at: new Date().toISOString()
      }
    ];

    const { error: workersError } = await supabase
      .from('worker_attendances')
      .insert(workers);

    if (workersError) {
      console.error('作業員記録の追加に失敗しました:', workersError);
      return;
    }

    console.log('サンプルデータの挿入が完了しました！');

  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
};

insertSampleData(); 