import { supabase } from './supabase';
import type {
  ConstructionSite,
  ConstructionReport,
  MaterialUsage,
  EquipmentUsage,
  WorkerAttendance,
  MonthlySummary,
  ReportFilter
} from '../types/constructionTypes';

// 工事現場関連のAPI
export const constructionSitesApi = {
  // 全工事現場の取得
  async getAllSites(): Promise<ConstructionSite[]> {
    console.log('getAllSites called');
    try {
      const { data, error } = await supabase
        .from('construction_sites')
        .select(`
          *,
          customers(name),
          users!construction_sites_manager_id_fkey(first_name, last_name)
        `)
        .order('name');

      if (error) {
        console.error('Error fetching construction sites:', error);
        throw error;
      }

      console.log('Sites data fetched:', data?.length || 0);

      // 関連データを適切にマッピング
      return data.map(site => {
        // ユーザー名をフォーマット
        const firstName = site.users?.first_name || '';
        const lastName = site.users?.last_name || '';
        const managerName = firstName && lastName ? `${lastName} ${firstName}` : '';

        return {
          ...site,
          client_name: site.customers?.name,
          manager_name: managerName
        };
      });
    } catch (error) {
      console.error('Error in getAllSites:', error);
      throw error;
    }
  },

  // 特定の工事現場の取得
  async getSiteById(id: string): Promise<ConstructionSite> {
    console.log('getSiteById called for:', id);
    try {
      const { data, error } = await supabase
        .from('construction_sites')
        .select(`
          *,
          customers(name),
          users!construction_sites_manager_id_fkey(first_name, last_name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching construction site ${id}:`, error);
        throw error;
      }

      console.log('Site data fetched:', data?.id);

      // ユーザー名をフォーマット
      const firstName = data.users?.first_name || '';
      const lastName = data.users?.last_name || '';
      const managerName = firstName && lastName ? `${lastName} ${firstName}` : '';

      return {
        ...data,
        client_name: data.customers?.name,
        manager_name: managerName
      };
    } catch (error) {
      console.error(`Error in getSiteById for ${id}:`, error);
      throw error;
    }
  },

  // 工事現場の新規作成
  async createSite(site: Omit<ConstructionSite, 'id' | 'created_at' | 'updated_at'>): Promise<ConstructionSite> {
    const { data, error } = await supabase
      .from('construction_sites')
      .insert([
        {
          name: site.name,
          address: site.address,
          client_id: site.client_id,
          start_date: site.start_date,
          expected_end_date: site.expected_end_date,
          status: site.status,
          manager_id: site.manager_id,
          description: site.description
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 工事現場の更新
  async updateSite(id: string, site: Partial<ConstructionSite>): Promise<ConstructionSite> {
    const updates = {
      ...site,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('construction_sites')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// 日報関連のAPI
export const constructionReportsApi = {
  // 日報の取得（フィルタリング可能）
  async getReports(filter?: ReportFilter): Promise<ConstructionReport[]> {
    console.log('getReports called with filter:', filter);
    try {
      let query = supabase
        .from('construction_reports')
        .select(`
          *,
          construction_sites(id, name),
          users(id, first_name, last_name)
        `)
        .order('report_date', { ascending: false });

      // フィルタの適用
      if (filter) {
        if (filter.site_id) {
          query = query.eq('site_id', filter.site_id);
        }
        if (filter.user_id) {
          query = query.eq('user_id', filter.user_id);
        }
        if (filter.start_date) {
          query = query.gte('report_date', filter.start_date);
        }
        if (filter.end_date) {
          query = query.lte('report_date', filter.end_date);
        }
      }

      console.log('Executing Supabase query for construction reports');
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching construction reports:', error);
        throw error;
      }

      console.log('Reports fetched successfully:', data?.length || 0);

      // 関連データの取得
      const reports = await Promise.all(
        data.map(async (report) => {
          try {
            // 資材使用記録の取得
            const { data: materials, error: materialsError } = await supabase
              .from('material_usages')
              .select('*')
              .eq('report_id', report.id);

            if (materialsError) {
              console.error(`Error fetching materials for report ${report.id}:`, materialsError);
            }

            // 機材使用記録の取得
            const { data: equipment, error: equipmentError } = await supabase
              .from('equipment_usages')
              .select('*')
              .eq('report_id', report.id);

            if (equipmentError) {
              console.error(`Error fetching equipment for report ${report.id}:`, equipmentError);
            }

            // 作業員記録の取得
            const { data: workers, error: workersError } = await supabase
              .from('worker_attendances')
              .select('*')
              .eq('report_id', report.id);

            if (workersError) {
              console.error(`Error fetching workers for report ${report.id}:`, workersError);
            }

            // ユーザー名をフォーマット
            const firstName = report.users?.first_name || '';
            const lastName = report.users?.last_name || '';
            const userName = firstName && lastName ? `${lastName} ${firstName}` : 'Unknown';

            return {
              ...report,
              site_name: report.construction_sites?.name || 'Unknown',
              user_name: userName,
              materials: materials || [],
              equipment: equipment || [],
              workers: workers || []
            };
          } catch (err) {
            console.error(`Error processing report ${report.id}:`, err);
            return {
              ...report,
              site_name: report.construction_sites?.name || 'Unknown',
              user_name: 'Error',
              materials: [],
              equipment: [],
              workers: []
            };
          }
        })
      );

      return reports;
    } catch (error) {
      console.error('Error in getReports:', error);
      throw error;
    }
  },

  // 特定の日報の取得
  async getReportById(id: string): Promise<ConstructionReport> {
    console.log('getReportById called for:', id);
    try {
      const { data, error } = await supabase
        .from('construction_reports')
        .select(`
          *,
          construction_sites(name),
          users(first_name, last_name)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching report ${id}:`, error);
        throw error;
      }

      console.log('Report data fetched:', data?.id);

      // 関連データの取得
      const { data: materials, error: materialsError } = await supabase
        .from('material_usages')
        .select('*')
        .eq('report_id', id);

      if (materialsError) {
        console.error(`Error fetching materials for report ${id}:`, materialsError);
      }

      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment_usages')
        .select('*')
        .eq('report_id', id);

      if (equipmentError) {
        console.error(`Error fetching equipment for report ${id}:`, equipmentError);
      }

      const { data: workers, error: workersError } = await supabase
        .from('worker_attendances')
        .select('*')
        .eq('report_id', id);

      if (workersError) {
        console.error(`Error fetching workers for report ${id}:`, workersError);
      }

      // 拡張写真情報の取得
      const { data: photos, error: photosError } = await supabase
        .from('report_photos')
        .select('*')
        .eq('report_id', id);

      if (photosError) {
        console.error(`Error fetching photos for report ${id}:`, photosError);
      }

      // ユーザー名をフォーマット
      const firstName = data.users?.first_name || '';
      const lastName = data.users?.last_name || '';
      const userName = firstName && lastName ? `${lastName} ${firstName}` : '';

      return {
        ...data,
        site_name: data.construction_sites?.name,
        user_name: userName,
        materials: materials || [],
        equipment: equipment || [],
        workers: workers || [],
        photos: photos || [] // 拡張写真情報を追加
      };
    } catch (error) {
      console.error(`Error in getReportById for ${id}:`, error);
      throw error;
    }
  },

  // 日報の新規作成
  async createReport(
    report: Omit<ConstructionReport, 'id' | 'created_at' | 'updated_at'>,
    materials?: Omit<MaterialUsage, 'id' | 'report_id' | 'created_at'>[],
    equipment?: Omit<EquipmentUsage, 'id' | 'report_id' | 'created_at'>[],
    workers?: Omit<WorkerAttendance, 'id' | 'report_id' | 'created_at'>[]
  ): Promise<ConstructionReport> {
    try {
      console.log('Creating new construction report');
      
      // 日報の登録
      const { data: reportData, error: reportError } = await supabase
        .from('construction_reports')
        .insert([
          {
            site_id: report.site_id,
            user_id: report.user_id,
            report_date: report.report_date,
            weather_type: report.weather_type, // 新しいフィールド
            weather: report.weather,
            temperature: report.temperature,
            humidity: report.humidity, // 新しいフィールド
            wind_speed: report.wind_speed, // 新しいフィールド
            wind_direction: report.wind_direction, // 新しいフィールド
            work_start_time: report.work_start_time,
            work_end_time: report.work_end_time,
            manpower: report.manpower,
            progress_percentage: report.progress_percentage,
            previous_progress_percentage: report.previous_progress_percentage, // 新しいフィールド
            work_description: report.work_description,
            issues: report.issues,
            issue_status: report.issue_status, // 新しいフィールド
            next_day_plan: report.next_day_plan,
            safety_checks: report.safety_checks,
            images: report.images || []
          }
        ])
        .select()
        .single();

      if (reportError) {
        console.error('Error creating report:', reportError);
        throw reportError;
      }

      console.log('Report created successfully:', reportData.id);
      const reportId = reportData.id;

      // 拡張写真情報の登録（存在する場合）
      if (report.photos && report.photos.length > 0) {
        const photoRecords = report.photos.map(photo => ({
          report_id: reportId,
          url: photo.url,
          caption: photo.caption || '',
          category: photo.category,
          taken_at: photo.taken_at || new Date().toISOString()
        }));

        const { error: photosError } = await supabase
          .from('report_photos')
          .insert(photoRecords);

        if (photosError) {
          console.error('Error saving report photos:', photosError);
          // 写真の登録に失敗しても、日報自体は登録済みなので処理は継続
        }
      }

      // 資材使用記録の登録（存在する場合）
      if (materials && materials.length > 0) {
        const materialRecords = materials.map(material => ({
          ...material,
          report_id: reportId
        }));

        const { error: materialsError } = await supabase
          .from('material_usages')
          .insert(materialRecords);

        if (materialsError) {
          console.error('Error saving material usages:', materialsError);
          // 資材記録の登録に失敗しても、日報自体は登録済みなので処理は継続
        }
      }

      // 機材使用記録の登録（存在する場合）
      if (equipment && equipment.length > 0) {
        const equipmentRecords = equipment.map(item => ({
          ...item,
          report_id: reportId
        }));

        const { error: equipmentError } = await supabase
          .from('equipment_usages')
          .insert(equipmentRecords);

        if (equipmentError) {
          console.error('Error saving equipment usages:', equipmentError);
          // 機材記録の登録に失敗しても、日報自体は登録済みなので処理は継続
        }
      }

      // 作業員記録の登録（存在する場合）
      if (workers && workers.length > 0) {
        const workerRecords = workers.map(worker => ({
          ...worker,
          report_id: reportId
        }));

        const { error: workersError } = await supabase
          .from('worker_attendances')
          .insert(workerRecords);

        if (workersError) {
          console.error('Error saving worker attendances:', workersError);
          // 作業員記録の登録に失敗しても、日報自体は登録済みなので処理は継続
        }
      }

      return reportData;
    } catch (error) {
      console.error('Error in createReport:', error);
      throw error;
    }
  },

  // 日報の更新
  async updateReport(
    id: string,
    report: Partial<ConstructionReport>,
    materials?: MaterialUsage[],
    equipment?: EquipmentUsage[],
    workers?: WorkerAttendance[]
  ): Promise<ConstructionReport> {
    try {
      // 日報の更新
      const reportUpdates = {
        ...report,
        updated_at: new Date().toISOString()
      };

      const { data: reportData, error: reportError } = await supabase
        .from('construction_reports')
        .update(reportUpdates)
        .eq('id', id)
        .select()
        .single();

      if (reportError) {
        console.error(`Error updating report ${id}:`, reportError);
        throw reportError;
      }

      // 拡張写真情報の更新（存在する場合）
      if (report.photos) {
        // 1. 既存の写真を削除
        const { error: deletePhotosError } = await supabase
          .from('report_photos')
          .delete()
          .eq('report_id', id);

        if (deletePhotosError) {
          console.error(`Error deleting existing photos for report ${id}:`, deletePhotosError);
          // 失敗しても処理は継続
        }

        // 2. 新しい写真を登録
        if (report.photos.length > 0) {
          const photoRecords = report.photos.map(photo => ({
            report_id: id,
            url: photo.url,
            caption: photo.caption || '',
            category: photo.category,
            taken_at: photo.taken_at || new Date().toISOString()
          }));

          const { error: photosError } = await supabase
            .from('report_photos')
            .insert(photoRecords);

          if (photosError) {
            console.error(`Error saving report photos for report ${id}:`, photosError);
            // 失敗しても処理は継続
          }
        }
      }

      // 資材使用記録の更新
      if (materials) {
        // 既存の記録を削除
        const { error: deleteMaterialsError } = await supabase
          .from('material_usages')
          .delete()
          .eq('report_id', id);

        if (deleteMaterialsError) {
          console.error(`Error deleting material usages for report ${id}:`, deleteMaterialsError);
          // 失敗しても処理は継続
        }

        // 新しい記録を登録
        if (materials.length > 0) {
          const materialRecords = materials.map(material => ({
            ...material,
            id: undefined, // IDは自動生成
            report_id: id
          }));

          const { error: materialsError } = await supabase
            .from('material_usages')
            .insert(materialRecords);

          if (materialsError) {
            console.error(`Error saving material usages for report ${id}:`, materialsError);
            // 失敗しても処理は継続
          }
        }
      }

      // 機材使用記録の更新
      if (equipment) {
        // 既存の記録を削除
        const { error: deleteEquipmentError } = await supabase
          .from('equipment_usages')
          .delete()
          .eq('report_id', id);

        if (deleteEquipmentError) {
          console.error(`Error deleting equipment usages for report ${id}:`, deleteEquipmentError);
          // 失敗しても処理は継続
        }

        // 新しい記録を登録
        if (equipment.length > 0) {
          const equipmentRecords = equipment.map(item => ({
            ...item,
            id: undefined, // IDは自動生成
            report_id: id
          }));

          const { error: equipmentError } = await supabase
            .from('equipment_usages')
            .insert(equipmentRecords);

          if (equipmentError) {
            console.error(`Error saving equipment usages for report ${id}:`, equipmentError);
            // 失敗しても処理は継続
          }
        }
      }

      // 作業員記録の更新
      if (workers) {
        // 既存の記録を削除
        const { error: deleteWorkersError } = await supabase
          .from('worker_attendances')
          .delete()
          .eq('report_id', id);

        if (deleteWorkersError) {
          console.error(`Error deleting worker attendances for report ${id}:`, deleteWorkersError);
          // 失敗しても処理は継続
        }

        // 新しい記録を登録
        if (workers.length > 0) {
          const workerRecords = workers.map(worker => ({
            ...worker,
            id: undefined, // IDは自動生成
            report_id: id
          }));

          const { error: workersError } = await supabase
            .from('worker_attendances')
            .insert(workerRecords);

          if (workersError) {
            console.error(`Error saving worker attendances for report ${id}:`, workersError);
            // 失敗しても処理は継続
          }
        }
      }

      return reportData;
    } catch (error) {
      console.error(`Error in updateReport for ${id}:`, error);
      throw error;
    }
  },

  // 月次レポートデータの取得
  async getMonthlySummary(year: number, month: number): Promise<MonthlySummary> {
    // 対象期間の設定
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    // 期間内の日報データを取得
    const { data: reports, error } = await supabase
      .from('construction_reports')
      .select(`
        *,
        construction_sites(id, name)
      `)
      .gte('report_date', startDate)
      .lte('report_date', endDate);

    if (error) throw error;

    // 資材使用量を取得
    const { data: materials, error: materialError } = await supabase
      .from('material_usages')
      .select(`
        material_name,
        quantity,
        unit,
        report_id
      `)
      .in(
        'report_id',
        reports.map(r => r.id)
      );

    if (materialError) throw materialError;

    // 資材集計
    const materialSummary = materials.reduce((acc, curr) => {
      const existingMaterial = acc.find(
        m => m.material_name === curr.material_name && m.unit === curr.unit
      );

      if (existingMaterial) {
        existingMaterial.total_quantity += curr.quantity;
      } else {
        acc.push({
          material_name: curr.material_name,
          total_quantity: curr.quantity,
          unit: curr.unit
        });
      }

      return acc;
    }, [] as { material_name: string; total_quantity: number; unit: string }[]);

    // 現場ごとの集計
    const siteMap = new Map();

    reports.forEach(report => {
      const siteId = report.construction_sites.id;
      const siteName = report.construction_sites.name;

      if (!siteMap.has(siteId)) {
        siteMap.set(siteId, {
          id: siteId,
          name: siteName,
          totalHours: 0,
          firstProgress: null,
          lastProgress: null,
          progressChange: 0
        });
      }

      const site = siteMap.get(siteId);

      // 作業時間の計算
      if (report.work_start_time && report.work_end_time) {
        const startParts = report.work_start_time.split(':').map(Number);
        const endParts = report.work_end_time.split(':').map(Number);
        
        const startMinutes = startParts[0] * 60 + startParts[1];
        const endMinutes = endParts[0] * 60 + endParts[1];
        
        // 作業時間（時間単位）
        const hours = (endMinutes - startMinutes) / 60;
        site.totalHours += hours > 0 ? hours : 0;
      }

      // 進捗率の計算
      if (report.progress_percentage !== null) {
        const reportDate = new Date(report.report_date);
        
        if (site.firstProgress === null || 
            new Date(site.firstProgressDate) > reportDate) {
          site.firstProgress = report.progress_percentage;
          site.firstProgressDate = report.report_date;
        }
        
        if (site.lastProgress === null || 
            new Date(site.lastProgressDate) < reportDate) {
          site.lastProgress = report.progress_percentage;
          site.lastProgressDate = report.report_date;
        }
      }
    });

    // 進捗率の変化を計算
    siteMap.forEach(site => {
      if (site.firstProgress !== null && site.lastProgress !== null) {
        site.progressChange = site.lastProgress - site.firstProgress;
      }
    });

    // 平均進捗率の計算
    const totalProgressPercentage = reports
      .filter(r => r.progress_percentage !== null)
      .reduce((sum, report) => sum + (report.progress_percentage || 0), 0);
    
    const progressReportCount = reports.filter(r => r.progress_percentage !== null).length;
    const averageProgress = progressReportCount > 0 
      ? totalProgressPercentage / progressReportCount 
      : 0;

    // 総作業時間の計算
    const totalWorkHours = Array.from(siteMap.values())
      .reduce((sum, site) => sum + site.totalHours, 0);

    return {
      month: month.toString().padStart(2, '0'),
      year,
      totalReports: reports.length,
      totalWorkHours,
      averageProgress,
      sitesWorked: Array.from(siteMap.values()).map(site => ({
        id: site.id,
        name: site.name,
        totalHours: site.totalHours,
        progressChange: site.progressChange
      })),
      materialUsage: materialSummary
    };
  }
};

// 顧客データ取得用のヘルパー関数
export const customersApi = {
  async getAllCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }
};

// 画像アップロード用のヘルパー
export const uploadReportImage = async (file: File, reportId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${reportId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `reports/${fileName}`;

  const { error } = await supabase.storage.from('report-images').upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage.from('report-images').getPublicUrl(filePath);
  return data.publicUrl;
}; 