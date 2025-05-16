import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { constructionSitesApi, constructionReportsApi, uploadReportImage } from '../lib/constructionApi';
import type {
  ConstructionSite,
  MaterialUsage,
  EquipmentUsage,
  WorkerAttendance,
  SafetyChecks,
  ConstructionReportFormData,
  WeatherType,
  PhotoCategory
} from '../types/constructionTypes';
import EnhancedPhotoUpload from '../components/EnhancedPhotoUpload';
import WeatherInfoInput from '../components/WeatherInfoInput';
import IssueTracker from '../components/IssueTracker';
import ProgressVisualizer from '../components/ProgressVisualizer';

// 資材使用記録コンポーネント
const MaterialsSection = ({
  materials,
  onChange
}: {
  materials: MaterialUsage[];
  onChange: (materials: MaterialUsage[]) => void;
}) => {
  const handleChange = (index: number, field: keyof MaterialUsage, value: string | number) => {
    const updatedMaterials = [...materials];
    updatedMaterials[index] = {
      ...updatedMaterials[index],
      [field]: field === 'quantity' ? Number(value) : value
    };
    onChange(updatedMaterials);
  };

  const handleAdd = () => {
    onChange([
      ...materials,
      { material_name: '', quantity: 0, unit: '' }
    ]);
  };

  const handleRemove = (index: number) => {
    const updatedMaterials = [...materials];
    updatedMaterials.splice(index, 1);
    onChange(updatedMaterials);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">使用資材</h3>
      {materials.map((material, index) => (
        <div key={index} className="flex flex-wrap mb-2 -mx-2">
          <div className="px-2 w-full sm:w-1/3 mb-2 sm:mb-0">
            <input
              type="text"
              placeholder="資材名"
              value={material.material_name}
              onChange={e => handleChange(index, 'material_name', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="px-2 w-full sm:w-1/4 mb-2 sm:mb-0">
            <input
              type="number"
              placeholder="数量"
              value={material.quantity}
              onChange={e => handleChange(index, 'quantity', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="px-2 w-full sm:w-1/4 mb-2 sm:mb-0">
            <input
              type="text"
              placeholder="単位"
              value={material.unit}
              onChange={e => handleChange(index, 'unit', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="px-2 w-full sm:w-1/6 flex items-center">
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="text-red-500 hover:text-red-700"
            >
              削除
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        資材を追加
      </button>
    </div>
  );
};

// 機材使用記録コンポーネント
const EquipmentSection = ({
  equipment,
  onChange
}: {
  equipment: EquipmentUsage[];
  onChange: (equipment: EquipmentUsage[]) => void;
}) => {
  const handleChange = (index: number, field: keyof EquipmentUsage, value: string | number) => {
    const updatedEquipment = [...equipment];
    updatedEquipment[index] = {
      ...updatedEquipment[index],
      [field]: field === 'usage_hours' ? Number(value) : value
    };
    onChange(updatedEquipment);
  };

  const handleAdd = () => {
    onChange([
      ...equipment,
      { equipment_name: '', usage_hours: 0, operator: '' }
    ]);
  };

  const handleRemove = (index: number) => {
    const updatedEquipment = [...equipment];
    updatedEquipment.splice(index, 1);
    onChange(updatedEquipment);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">使用機材</h3>
      {equipment.map((item, index) => (
        <div key={index} className="flex flex-wrap mb-2 -mx-2">
          <div className="px-2 w-full sm:w-1/3 mb-2 sm:mb-0">
            <input
              type="text"
              placeholder="機材名"
              value={item.equipment_name}
              onChange={e => handleChange(index, 'equipment_name', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="px-2 w-full sm:w-1/4 mb-2 sm:mb-0">
            <input
              type="number"
              placeholder="使用時間"
              value={item.usage_hours}
              onChange={e => handleChange(index, 'usage_hours', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              min="0"
              step="0.5"
            />
          </div>
          <div className="px-2 w-full sm:w-1/4 mb-2 sm:mb-0">
            <input
              type="text"
              placeholder="オペレーター"
              value={item.operator}
              onChange={e => handleChange(index, 'operator', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="px-2 w-full sm:w-1/6 flex items-center">
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="text-red-500 hover:text-red-700"
            >
              削除
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        機材を追加
      </button>
    </div>
  );
};

// 作業員記録コンポーネント
const WorkersSection = ({
  workers,
  onChange
}: {
  workers: WorkerAttendance[];
  onChange: (workers: WorkerAttendance[]) => void;
}) => {
  const handleChange = (index: number, field: keyof WorkerAttendance, value: string | number) => {
    const updatedWorkers = [...workers];
    updatedWorkers[index] = {
      ...updatedWorkers[index],
      [field]: field === 'hours_worked' ? Number(value) : value
    };
    onChange(updatedWorkers);
  };

  const handleAdd = () => {
    onChange([
      ...workers,
      { worker_name: '', role: '', hours_worked: 8 }
    ]);
  };

  const handleRemove = (index: number) => {
    const updatedWorkers = [...workers];
    updatedWorkers.splice(index, 1);
    onChange(updatedWorkers);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">作業員</h3>
      {workers.map((worker, index) => (
        <div key={index} className="flex flex-wrap mb-2 -mx-2">
          <div className="px-2 w-full sm:w-1/3 mb-2 sm:mb-0">
            <input
              type="text"
              placeholder="作業員名"
              value={worker.worker_name}
              onChange={e => handleChange(index, 'worker_name', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="px-2 w-full sm:w-1/4 mb-2 sm:mb-0">
            <input
              type="text"
              placeholder="役割"
              value={worker.role}
              onChange={e => handleChange(index, 'role', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="px-2 w-full sm:w-1/4 mb-2 sm:mb-0">
            <input
              type="number"
              placeholder="作業時間"
              value={worker.hours_worked}
              onChange={e => handleChange(index, 'hours_worked', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              min="0"
              step="0.5"
            />
          </div>
          <div className="px-2 w-full sm:w-1/6 flex items-center">
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="text-red-500 hover:text-red-700"
            >
              削除
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        作業員を追加
      </button>
    </div>
  );
};

// 安全チェックセクション
const SafetyCheckSection = ({
  safetyChecks,
  onChange
}: {
  safetyChecks: SafetyChecks;
  onChange: (safetyChecks: SafetyChecks) => void;
}) => {
  const handleChange = (field: keyof SafetyChecks, value: boolean | string) => {
    onChange({
      ...safetyChecks,
      [field]: value
    });
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">安全確認</h3>
      <div className="space-y-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="morning_meeting"
            checked={safetyChecks.morning_meeting}
            onChange={(e) => handleChange('morning_meeting', e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="morning_meeting" className="ml-2 block text-sm text-gray-700">
            朝礼・KY活動の実施
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="safety_equipment"
            checked={safetyChecks.safety_equipment}
            onChange={(e) => handleChange('safety_equipment', e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="safety_equipment" className="ml-2 block text-sm text-gray-700">
            安全装備の着用確認
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="risk_assessment"
            checked={safetyChecks.risk_assessment}
            onChange={(e) => handleChange('risk_assessment', e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="risk_assessment" className="ml-2 block text-sm text-gray-700">
            危険箇所の確認と対策
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="site_clean"
            checked={safetyChecks.site_clean}
            onChange={(e) => handleChange('site_clean', e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="site_clean" className="ml-2 block text-sm text-gray-700">
            現場整理整頓の実施
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="tools_inspection"
            checked={safetyChecks.tools_inspection}
            onChange={(e) => handleChange('tools_inspection', e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="tools_inspection" className="ml-2 block text-sm text-gray-700">
            工具・機材の点検
          </label>
        </div>

        <div>
          <label htmlFor="additional_notes" className="block text-sm font-medium text-gray-700 mb-1">
            安全に関する特記事項
          </label>
          <textarea
            id="additional_notes"
            value={safetyChecks.additional_notes || ''}
            onChange={(e) => handleChange('additional_notes', e.target.value)}
            placeholder="安全上の特記事項があれば入力してください"
            className="w-full p-2 border border-gray-300 rounded h-20"
          />
        </div>
      </div>
    </div>
  );
};

// メインの日報入力コンポーネント
const ReportNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sites, setSites] = useState<ConstructionSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previousProgress, setPreviousProgress] = useState<number | null>(null);

  // フォームデータ
  const [formData, setFormData] = useState<ConstructionReportFormData>({
    site_id: '',
    report_date: new Date().toISOString().split('T')[0],
    weather_type: 'sunny',
    weather: '晴れ',
    temperature: '',
    humidity: '',
    wind_speed: '',
    wind_direction: '',
    work_start_time: '08:00',
    work_end_time: '17:00',
    manpower: '',
    progress_percentage: '',
    work_description: '',
    issues: '',
    issue_status: 'none',
    next_day_plan: '',
    safety_checks: {
      morning_meeting: false,
      safety_equipment: false,
      risk_assessment: false,
      site_clean: false,
      tools_inspection: false
    },
    images: [],
    existingImages: [],
    photos: [],
    materials: [],
    equipment: [],
    workers: []
  });

  // 現場データと前回の進捗率の取得
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const data = await constructionSitesApi.getAllSites();
        setSites(data);
        
        // 現場がある場合は最初の現場をデフォルト選択
        if (data.length > 0) {
          setFormData(prev => ({
            ...prev,
            site_id: data[0].id
          }));

          // 前回の日報を取得して進捗率を設定
          try {
            const reportsData = await constructionReportsApi.getReports({
              site_id: data[0].id,
            });
            
            if (reportsData.length > 0) {
              // 日付で降順ソート
              const sortedReports = reportsData.sort((a, b) => 
                new Date(b.report_date).getTime() - new Date(a.report_date).getTime()
              );
              
              // 最新の報告の進捗率を取得
              const latestProgress = sortedReports[0].progress_percentage;
              if (latestProgress !== undefined && latestProgress !== null) {
                setPreviousProgress(latestProgress);
              }
            }
          } catch (err) {
            console.error('前回の日報データの取得に失敗しました', err);
          }
        }
      } catch (err) {
        console.error('工事現場データの取得に失敗しました', err);
        setError('工事現場データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  // 現場変更時に前回の進捗率を取得
  useEffect(() => {
    const fetchPreviousProgress = async () => {
      if (!formData.site_id) return;
      
      try {
        const reportsData = await constructionReportsApi.getReports({
          site_id: formData.site_id,
        });
        
        if (reportsData.length > 0) {
          // 日付で降順ソート
          const sortedReports = reportsData.sort((a, b) => 
            new Date(b.report_date).getTime() - new Date(a.report_date).getTime()
          );
          
          // 最新の報告の進捗率を取得
          const latestProgress = sortedReports[0].progress_percentage;
          if (latestProgress !== undefined && latestProgress !== null) {
            setPreviousProgress(latestProgress);
          } else {
            setPreviousProgress(null);
          }
        } else {
          setPreviousProgress(null);
        }
      } catch (err) {
        console.error('前回の日報データの取得に失敗しました', err);
        setPreviousProgress(null);
      }
    };

    fetchPreviousProgress();
  }, [formData.site_id]);

  // 入力フィールド変更ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 写真データ更新ハンドラ
  const handlePhotosChange = (photos: { file?: File; url?: string; caption: string; category: PhotoCategory }[]) => {
    setFormData(prev => ({
      ...prev,
      photos
    }));
  };

  // フォーム送信ハンドラ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('ユーザー情報が取得できません。再ログインしてください。');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      // 画像ファイルをアップロードしてURLを取得
      let imageUrls: string[] = [];
      let photoUrls: { url: string; caption?: string; category: PhotoCategory }[] = [];
      
      // 1. 従来の画像アップロード処理
      if (formData.images.length > 0) {
        const tempId = `temp-${Date.now()}`;
        const uploadPromises = formData.images.map(file => 
          uploadReportImage(file, tempId)
        );
        imageUrls = await Promise.all(uploadPromises);
      }
      
      // 2. 拡張写真アップロード処理
      if (formData.photos.length > 0) {
        const tempId = `temp-${Date.now()}-photos`;
        
        // ファイルがある写真のみアップロード
        const photoUploadPromises = formData.photos
          .filter(photo => photo.file)
          .map(async photo => {
            if (photo.file) {
              const url = await uploadReportImage(photo.file, tempId);
              return {
                url,
                caption: photo.caption || '',
                category: photo.category
              };
            }
            return null;
          });
        
        // すでにURLがある写真はそのまま使用
        const existingPhotoUrls = formData.photos
          .filter(photo => photo.url)
          .map(photo => ({
            url: photo.url!,
            caption: photo.caption || '',
            category: photo.category
          }));
        
        const uploadedPhotoUrls = await Promise.all(photoUploadPromises);
        photoUrls = [
          ...existingPhotoUrls,
          ...uploadedPhotoUrls.filter((item): item is { url: string; caption: string; category: PhotoCategory } => 
            item !== null
          )
        ];
      }

      // 日報データの送信
      await constructionReportsApi.createReport(
        {
          site_id: formData.site_id,
          user_id: user.id,
          report_date: formData.report_date,
          weather_type: formData.weather_type,
          weather: formData.weather,
          temperature: formData.temperature ? Number(formData.temperature) : undefined,
          humidity: formData.humidity ? Number(formData.humidity) : undefined,
          wind_speed: formData.wind_speed ? Number(formData.wind_speed) : undefined,
          wind_direction: formData.wind_direction,
          work_start_time: formData.work_start_time,
          work_end_time: formData.work_end_time,
          manpower: formData.manpower ? Number(formData.manpower) : undefined,
          progress_percentage: formData.progress_percentage ? Number(formData.progress_percentage) : undefined,
          previous_progress_percentage: previousProgress !== null ? previousProgress : undefined,
          work_description: formData.work_description,
          issues: formData.issues,
          issue_status: formData.issue_status,
          next_day_plan: formData.next_day_plan,
          safety_checks: formData.safety_checks,
          images: imageUrls,
          photos: photoUrls
        },
        formData.materials,
        formData.equipment,
        formData.workers
      );

      // 日報一覧ページへ遷移
      navigate('/report');
    } catch (err: any) {
      console.error('日報の保存に失敗しました', err);
      setError(err.message || '日報の保存に失敗しました');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">日報入力</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          {/* 基本情報セクション */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">基本情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  工事現場 <span className="text-red-500">*</span>
                </label>
                <select
                  name="site_id"
                  value={formData.site_id}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">-- 選択してください --</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日付 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="report_date"
                  value={formData.report_date}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* 天候情報セクション */}
          <WeatherInfoInput 
            weatherType={formData.weather_type}
            weather={formData.weather}
            temperature={formData.temperature}
            humidity={formData.humidity}
            windSpeed={formData.wind_speed}
            windDirection={formData.wind_direction}
            onWeatherTypeChange={(value) => setFormData(prev => ({ ...prev, weather_type: value }))}
            onWeatherChange={(value) => setFormData(prev => ({ ...prev, weather: value }))}
            onTemperatureChange={(value) => setFormData(prev => ({ ...prev, temperature: value }))}
            onHumidityChange={(value) => setFormData(prev => ({ ...prev, humidity: value }))}
            onWindSpeedChange={(value) => setFormData(prev => ({ ...prev, wind_speed: value }))}
            onWindDirectionChange={(value) => setFormData(prev => ({ ...prev, wind_direction: value }))}
          />

          {/* 作業時間セクション */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">作業時間</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  作業開始時間
                </label>
                <input
                  type="time"
                  name="work_start_time"
                  value={formData.work_start_time}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  作業終了時間
                </label>
                <input
                  type="time"
                  name="work_end_time"
                  value={formData.work_end_time}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  作業人数
                </label>
                <input
                  type="number"
                  name="manpower"
                  value={formData.manpower}
                  onChange={handleChange}
                  placeholder="例: 5"
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* 進捗状況セクション */}
          <ProgressVisualizer
            currentProgress={formData.progress_percentage}
            previousProgress={previousProgress}
            onProgressChange={(value) => setFormData(prev => ({ ...prev, progress_percentage: value }))}
          />

          {/* 作業内容セクション */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">作業内容 <span className="text-red-500">*</span></h3>
            <textarea
              name="work_description"
              value={formData.work_description}
              onChange={handleChange}
              placeholder="本日の作業内容を詳細に記入してください"
              required
              className="w-full p-3 border border-gray-300 rounded h-32"
            />
          </div>

          {/* 課題・問題点セクション */}
          <IssueTracker
            issues={formData.issues}
            issueStatus={formData.issue_status}
            onIssuesChange={(value) => setFormData(prev => ({ ...prev, issues: value }))}
            onIssueStatusChange={(value) => setFormData(prev => ({ ...prev, issue_status: value }))}
          />

          {/* 明日の作業予定セクション */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">明日の作業予定</h3>
            <textarea
              name="next_day_plan"
              value={formData.next_day_plan}
              onChange={handleChange}
              placeholder="翌日の作業予定を記入してください"
              className="w-full p-3 border border-gray-300 rounded h-32"
            />
          </div>

          {/* 安全確認セクション */}
          <SafetyCheckSection
            safetyChecks={formData.safety_checks}
            onChange={(safetyChecks) => setFormData(prev => ({ ...prev, safety_checks: safetyChecks }))}
          />

          {/* 写真アップロードセクション（拡張版） */}
          <EnhancedPhotoUpload
            photos={formData.photos}
            onPhotosChange={handlePhotosChange}
            maxPhotos={20}
          />

          {/* 資材使用記録セクション */}
          <MaterialsSection
            materials={formData.materials}
            onChange={(materials) => setFormData(prev => ({ ...prev, materials }))}
          />

          {/* 機材使用記録セクション */}
          <EquipmentSection
            equipment={formData.equipment}
            onChange={(equipment) => setFormData(prev => ({ ...prev, equipment }))}
          />

          {/* 作業員記録セクション */}
          <WorkersSection
            workers={formData.workers}
            onChange={(workers) => setFormData(prev => ({ ...prev, workers }))}
          />

          {/* 送信ボタン */}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/report')}
              className="mr-4 px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={submitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="inline-block animate-spin mr-2">⟳</span>
                  保存中...
                </>
              ) : (
                '日報を保存'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportNew; 