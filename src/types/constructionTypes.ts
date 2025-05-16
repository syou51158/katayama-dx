// 工事現場の状態を表す型
export type ConstructionSiteStatus = 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

// 天候タイプの定義
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'foggy' | 'windy' | 'stormy' | 'other';

// 写真カテゴリの定義
export type PhotoCategory = 'before' | 'after' | 'progress' | 'issue' | 'safety' | 'material' | 'equipment' | 'other';

// 工事現場の型定義
export interface ConstructionSite {
  id: string;
  name: string;
  address: string;
  client_id?: string;
  client_name?: string; // 関連する顧客名（UI表示用）
  start_date: string;
  expected_end_date?: string;
  actual_end_date?: string;
  status: ConstructionSiteStatus;
  manager_id?: string;
  manager_name?: string; // 関連する管理者名（UI表示用）
  description?: string;
  created_at: string;
  updated_at?: string;
}

// 写真の型定義
export interface ReportPhoto {
  id?: string;
  report_id?: string;
  url: string;
  caption?: string;
  category: PhotoCategory;
  taken_at?: string;
  created_at?: string;
}

// 日報の型定義
export interface ConstructionReport {
  id: string;
  site_id: string;
  site_name?: string; // 現場名（UI表示用）
  user_id: string;
  user_name?: string; // 報告者名（UI表示用）
  report_date: string;
  weather_type?: WeatherType;
  weather?: string;
  temperature?: number;
  humidity?: number;
  wind_speed?: number;
  wind_direction?: string;
  work_start_time?: string;
  work_end_time?: string;
  manpower?: number;
  progress_percentage?: number;
  previous_progress_percentage?: number; // 前回の進捗率（計算用）
  work_description: string;
  issues?: string;
  issue_status?: 'none' | 'pending' | 'resolved';
  next_day_plan?: string;
  safety_checks?: SafetyChecks;
  images?: string[];
  photos?: ReportPhoto[]; // 拡張された写真情報
  created_at: string;
  updated_at?: string;
  
  // フロントエンド用の追加プロパティ
  materials?: MaterialUsage[];
  equipment?: EquipmentUsage[];
  workers?: WorkerAttendance[];
}

// 安全確認事項の型定義
export interface SafetyChecks {
  morning_meeting: boolean;
  safety_equipment: boolean;
  risk_assessment: boolean;
  site_clean: boolean;
  tools_inspection: boolean;
  additional_notes?: string;
}

// 資材使用記録の型定義
export interface MaterialUsage {
  id?: string;
  report_id?: string;
  material_name: string;
  quantity: number;
  unit: string;
  notes?: string;
  created_at?: string;
}

// 機材使用記録の型定義
export interface EquipmentUsage {
  id?: string;
  report_id?: string;
  equipment_name: string;
  usage_hours?: number;
  operator?: string;
  notes?: string;
  created_at?: string;
}

// 作業員記録の型定義
export interface WorkerAttendance {
  id?: string;
  report_id?: string;
  worker_name: string;
  role?: string;
  hours_worked?: number;
  notes?: string;
  created_at?: string;
}

// 月次レポート用の集計データ型
export interface MonthlySummary {
  month: string;
  year: number;
  totalReports: number;
  totalWorkHours: number;
  averageProgress: number;
  sitesWorked: {
    id: string;
    name: string;
    totalHours: number;
    progressChange: number;
  }[];
  materialUsage: {
    material_name: string;
    total_quantity: number;
    unit: string;
  }[];
}

// 日報フォーム用の型
export interface ConstructionReportFormData {
  site_id: string;
  report_date: string;
  weather_type: WeatherType;
  weather: string;
  temperature: string | number;
  humidity: string | number;
  wind_speed: string | number;
  wind_direction: string;
  work_start_time: string;
  work_end_time: string;
  manpower: string | number;
  progress_percentage: string | number;
  work_description: string;
  issues: string;
  issue_status: 'none' | 'pending' | 'resolved';
  next_day_plan: string;
  safety_checks: SafetyChecks;
  images: File[];
  existingImages: string[];
  photos: {
    file?: File;
    url?: string;
    caption: string;
    category: PhotoCategory;
  }[];
  materials: MaterialUsage[];
  equipment: EquipmentUsage[];
  workers: WorkerAttendance[];
}

// 一覧表示用のフィルタ型
export interface ReportFilter {
  site_id?: string;
  start_date?: string;
  end_date?: string;
  user_id?: string;
  weather_type?: WeatherType;
  issue_status?: 'none' | 'pending' | 'resolved';
  progress_min?: number;
  progress_max?: number;
} 