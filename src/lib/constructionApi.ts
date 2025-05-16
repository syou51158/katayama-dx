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
    const { data, error } = await supabase
      .from('construction_sites')
      .select(`
        *,
        customers(name),
        users!construction_sites_manager_id_fkey(name)
      `)
      .order('name');

    if (error) throw error;

    // 関連データを適切にマッピング
    return data.map(site => ({
      ...site,
      client_name: site.customers?.name,
      manager_name: site.users?.name
    }));
  },

  // 特定の工事現場の取得
  async getSiteById(id: string): Promise<ConstructionSite> {
    const { data, error } = await supabase
      .from('construction_sites')
      .select(`
        *,
        customers(name),
        users!construction_sites_manager_id_fkey(name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      client_name: data.customers?.name,
      manager_name: data.users?.name
    };
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
    let query = supabase
      .from('construction_reports')
      .select(`
        *,
        construction_sites(name),
        users(name)
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

    const { data, error } = await query;

    if (error) throw error;

    // 関連データの取得
    const reports = await Promise.all(
      data.map(async (report) => {
        // 資材使用記録の取得
        const { data: materials } = await supabase
          .from('material_usages')
          .select('*')
          .eq('report_id', report.id);

        // 機材使用記録の取得
        const { data: equipment } = await supabase
          .from('equipment_usages')
          .select('*')
          .eq('report_id', report.id);

        // 作業員記録の取得
        const { data: workers } = await supabase
          .from('worker_attendances')
          .select('*')
          .eq('report_id', report.id);

        return {
          ...report,
          site_name: report.construction_sites?.name,
          user_name: report.users?.name,
          materials: materials || [],
          equipment: equipment || [],
          workers: workers || []
        };
      })
    );

    return reports;
  },

  // 特定の日報の取得
  async getReportById(id: string): Promise<ConstructionReport> {
    const { data, error } = await supabase
      .from('construction_reports')
      .select(`
        *,
        construction_sites(name),
        users(name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // 関連データの取得
    const { data: materials } = await supabase
      .from('material_usages')
      .select('*')
      .eq('report_id', id);

    const { data: equipment } = await supabase
      .from('equipment_usages')
      .select('*')
      .eq('report_id', id);

    const { data: workers } = await supabase
      .from('worker_attendances')
      .select('*')
      .eq('report_id', id);

    return {
      ...data,
      site_name: data.construction_sites?.name,
      user_name: data.users?.name,
      materials: materials || [],
      equipment: equipment || [],
      workers: workers || []
    };
  },

  // 日報の作成（関連データを含む）
  async createReport(
    report: Omit<ConstructionReport, 'id' | 'created_at' | 'updated_at'>,
    materials?: Omit<MaterialUsage, 'id' | 'report_id' | 'created_at'>[],
    equipment?: Omit<EquipmentUsage, 'id' | 'report_id' | 'created_at'>[],
    workers?: Omit<WorkerAttendance, 'id' | 'report_id' | 'created_at'>[]
  ): Promise<ConstructionReport> {
    // トランザクション的に処理するため、独自の実装
    const { data, error } = await supabase
      .from('construction_reports')
      .insert([
        {
          site_id: report.site_id,
          user_id: report.user_id,
          report_date: report.report_date,
          weather: report.weather,
          temperature: report.temperature,
          work_start_time: report.work_start_time,
          work_end_time: report.work_end_time,
          manpower: report.manpower,
          progress_percentage: report.progress_percentage,
          work_description: report.work_description,
          issues: report.issues,
          next_day_plan: report.next_day_plan,
          safety_checks: report.safety_checks,
          images: report.images
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // 資材使用記録の保存
    if (materials && materials.length > 0) {
      const materialData = materials.map(material => ({
        report_id: data.id,
        material_name: material.material_name,
        quantity: material.quantity,
        unit: material.unit,
        notes: material.notes
      }));

      const { error: materialError } = await supabase
        .from('material_usages')
        .insert(materialData);

      if (materialError) throw materialError;
    }

    // 機材使用記録の保存
    if (equipment && equipment.length > 0) {
      const equipmentData = equipment.map(item => ({
        report_id: data.id,
        equipment_name: item.equipment_name,
        usage_hours: item.usage_hours,
        operator: item.operator,
        notes: item.notes
      }));

      const { error: equipmentError } = await supabase
        .from('equipment_usages')
        .insert(equipmentData);

      if (equipmentError) throw equipmentError;
    }

    // 作業員記録の保存
    if (workers && workers.length > 0) {
      const workerData = workers.map(worker => ({
        report_id: data.id,
        worker_name: worker.worker_name,
        role: worker.role,
        hours_worked: worker.hours_worked,
        notes: worker.notes
      }));

      const { error: workerError } = await supabase
        .from('worker_attendances')
        .insert(workerData);

      if (workerError) throw workerError;
    }

    // 最終的なレポートを返す
    return await this.getReportById(data.id);
  },

  // 日報の更新
  async updateReport(
    id: string,
    report: Partial<ConstructionReport>,
    materials?: MaterialUsage[],
    equipment?: EquipmentUsage[],
    workers?: WorkerAttendance[]
  ): Promise<ConstructionReport> {
    const updates = {
      ...report,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('construction_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // 資材使用記録の更新（削除して再作成）
    if (materials !== undefined) {
      // 既存の記録を削除
      await supabase
        .from('material_usages')
        .delete()
        .eq('report_id', id);

      // 新しい記録を作成
      if (materials.length > 0) {
        const materialData = materials.map(material => ({
          report_id: id,
          material_name: material.material_name,
          quantity: material.quantity,
          unit: material.unit,
          notes: material.notes
        }));

        const { error: materialError } = await supabase
          .from('material_usages')
          .insert(materialData);

        if (materialError) throw materialError;
      }
    }

    // 機材使用記録の更新
    if (equipment !== undefined) {
      await supabase
        .from('equipment_usages')
        .delete()
        .eq('report_id', id);

      if (equipment.length > 0) {
        const equipmentData = equipment.map(item => ({
          report_id: id,
          equipment_name: item.equipment_name,
          usage_hours: item.usage_hours,
          operator: item.operator,
          notes: item.notes
        }));

        const { error: equipmentError } = await supabase
          .from('equipment_usages')
          .insert(equipmentData);

        if (equipmentError) throw equipmentError;
      }
    }

    // 作業員記録の更新
    if (workers !== undefined) {
      await supabase
        .from('worker_attendances')
        .delete()
        .eq('report_id', id);

      if (workers.length > 0) {
        const workerData = workers.map(worker => ({
          report_id: id,
          worker_name: worker.worker_name,
          role: worker.role,
          hours_worked: worker.hours_worked,
          notes: worker.notes
        }));

        const { error: workerError } = await supabase
          .from('worker_attendances')
          .insert(workerData);

        if (workerError) throw workerError;
      }
    }

    // 最終的なレポートを返す
    return await this.getReportById(id);
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