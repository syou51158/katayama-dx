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
  ConstructionReportFormData
} from '../types/constructionTypes';

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

// 安全確認事項コンポーネント
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
      <h3 className="text-lg font-medium mb-3">安全確認事項</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="morning_meeting"
            checked={safetyChecks.morning_meeting}
            onChange={e => handleChange('morning_meeting', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="morning_meeting">朝礼の実施</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="safety_equipment"
            checked={safetyChecks.safety_equipment}
            onChange={e => handleChange('safety_equipment', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="safety_equipment">安全装備の確認</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="risk_assessment"
            checked={safetyChecks.risk_assessment}
            onChange={e => handleChange('risk_assessment', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="risk_assessment">危険箇所の確認</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="site_clean"
            checked={safetyChecks.site_clean}
            onChange={e => handleChange('site_clean', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="site_clean">現場の整理整頓</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="tools_inspection"
            checked={safetyChecks.tools_inspection}
            onChange={e => handleChange('tools_inspection', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="tools_inspection">工具・機材の点検</label>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          その他の安全に関する注意点・備考
        </label>
        <textarea
          value={safetyChecks.additional_notes || ''}
          onChange={e => handleChange('additional_notes', e.target.value)}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
    </div>
  );
};

// 画像アップロードコンポーネント
const ImageUploadSection = ({
  images,
  onImagesChange
}: {
  images: File[];
  onImagesChange: (images: File[]) => void;
}) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      onImagesChange([...images, ...newImages]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">現場写真</h3>
      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          JPG, PNG, GIF形式の画像をアップロードできます（最大5MB）
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(image)}
                alt={`現場写真 ${index + 1}`}
                className="w-full h-32 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// メインの日報入力ページコンポーネント
const ReportNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [sites, setSites] = useState<ConstructionSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // フォームデータの状態
  const [formData, setFormData] = useState<ConstructionReportFormData>({
    site_id: '',
    report_date: new Date().toISOString().split('T')[0],
    weather: '',
    temperature: '',
    work_start_time: '08:00',
    work_end_time: '17:00',
    manpower: '',
    progress_percentage: '',
    work_description: '',
    issues: '',
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
    materials: [],
    equipment: [],
    workers: []
  });

  // 現場データの取得
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
      if (formData.images.length > 0) {
        // 一時的なIDを生成（本来はサーバーからのレスポンスで実際のIDを使用）
        const tempId = `temp-${Date.now()}`;
        
        // 画像のアップロード
        const uploadPromises = formData.images.map(file => 
          uploadReportImage(file, tempId)
        );
        
        imageUrls = await Promise.all(uploadPromises);
      }

      // 日報データの送信
      await constructionReportsApi.createReport(
        {
          site_id: formData.site_id,
          user_id: user.id,
          report_date: formData.report_date,
          weather: formData.weather,
          temperature: formData.temperature ? Number(formData.temperature) : undefined,
          work_start_time: formData.work_start_time,
          work_end_time: formData.work_end_time,
          manpower: formData.manpower ? Number(formData.manpower) : undefined,
          progress_percentage: formData.progress_percentage ? Number(formData.progress_percentage) : undefined,
          work_description: formData.work_description,
          issues: formData.issues,
          next_day_plan: formData.next_day_plan,
          safety_checks: formData.safety_checks,
          images: imageUrls
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  天候
                </label>
                <input
                  type="text"
                  name="weather"
                  value={formData.weather}
                  onChange={handleChange}
                  placeholder="例: 晴れ、雨、曇りなど"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  気温 (℃)
                </label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  placeholder="例: 25.5"
                  step="0.1"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  進捗率 (%)
                </label>
                <input
                  type="number"
                  name="progress_percentage"
                  value={formData.progress_percentage}
                  onChange={handleChange}
                  placeholder="例: 45.5"
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* 詳細情報セクション */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">作業内容</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                作業内容の詳細 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="work_description"
                value={formData.work_description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="本日の作業内容を具体的に記入してください"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                問題点・課題
              </label>
              <textarea
                name="issues"
                value={formData.issues}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="発生した問題や課題があれば記入してください"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                明日の作業予定
              </label>
              <textarea
                name="next_day_plan"
                value={formData.next_day_plan}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="翌日の作業予定を記入してください"
              />
            </div>
          </div>

          {/* 資材・機材・作業員セクション */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">資材・機材・作業員</h2>
            <MaterialsSection
              materials={formData.materials}
              onChange={materials => setFormData(prev => ({ ...prev, materials }))}
            />
            
            <EquipmentSection
              equipment={formData.equipment}
              onChange={equipment => setFormData(prev => ({ ...prev, equipment }))}
            />
            
            <WorkersSection
              workers={formData.workers}
              onChange={workers => setFormData(prev => ({ ...prev, workers }))}
            />
          </div>

          {/* 安全確認事項セクション */}
          <SafetyCheckSection
            safetyChecks={formData.safety_checks}
            onChange={safety_checks => setFormData(prev => ({ ...prev, safety_checks }))}
          />

          {/* 画像アップロードセクション */}
          <ImageUploadSection
            images={formData.images}
            onImagesChange={images => setFormData(prev => ({ ...prev, images }))}
          />

          {/* 送信ボタン */}
          <div className="flex justify-end mt-8">
            <button
              type="button"
              onClick={() => navigate('/report')}
              className="px-4 py-2 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            >
              {submitting ? '保存中...' : '日報を保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportNew; 