import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { constructionReportsApi } from '../lib/constructionApi';
import type { ConstructionReport, ReportPhoto } from '../types/constructionTypes';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

// 天候アイコンを表示するユーティリティ関数
const getWeatherIcon = (weatherType?: string): string => {
  switch (weatherType) {
    case 'sunny': return '☀️';
    case 'cloudy': return '☁️';
    case 'rainy': return '🌧️';
    case 'snowy': return '❄️';
    case 'foggy': return '🌫️';
    case 'windy': return '💨';
    case 'stormy': return '⛈️';
    case 'other': return '🌡️';
    default: return '';
  }
};

// 課題ステータスに応じたバッジを表示するユーティリティ関数
const getIssueStatusBadge = (status?: 'none' | 'pending' | 'resolved') => {
  switch (status) {
    case 'pending':
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">対応中</span>;
    case 'resolved':
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">解決済み</span>;
    case 'none':
    default:
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">問題なし</span>;
  }
};

// 写真表示コンポーネント
const PhotoGallery = ({ photos, images }: { photos?: ReportPhoto[]; images?: string[] }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // カテゴリ別の写真を取得
  const getFilteredPhotos = () => {
    if (selectedCategory === 'all') {
      return photos || [];
    }
    return (photos || []).filter(photo => photo.category === selectedCategory);
  };

  // カテゴリリスト（存在するもののみ）
  const categories = ['all', ...new Set((photos || []).map(p => p.category))];

  // カテゴリ名を日本語に変換
  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'all': return 'すべて';
      case 'before': return '作業前';
      case 'after': return '作業後';
      case 'progress': return '進捗';
      case 'issue': return '問題';
      case 'safety': return '安全確認';
      case 'material': return '資材';
      case 'equipment': return '機材';
      case 'other': return 'その他';
      default: return category;
    }
  };

  // カテゴリアイコンを取得
  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'all': return '🖼️';
      case 'before': return '🏗️';
      case 'after': return '✅';
      case 'progress': return '📈';
      case 'issue': return '⚠️';
      case 'safety': return '🛡️';
      case 'material': return '📦';
      case 'equipment': return '🔧';
      case 'other': return '📷';
      default: return '📷';
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">現場写真</h3>
      
      {/* カテゴリフィルター */}
      {photos && photos.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm ${selectedCategory === category
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{getCategoryIcon(category)}</span>
              {getCategoryLabel(category)}
              {category === 'all' && <span className="ml-1">({photos.length})</span>}
            </button>
          ))}
        </div>
      )}

      {/* 拡張写真ギャラリー */}
      {photos && photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {getFilteredPhotos().map((photo, index) => (
            <div key={index} className="relative group cursor-pointer" onClick={() => setSelectedPhoto(photo.url)}>
              <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <img 
                  src={photo.url} 
                  alt={photo.caption || `写真 ${index + 1}`} 
                  className="object-cover w-full h-full group-hover:opacity-90 transition-opacity"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white text-sm">
                <div className="flex justify-between items-center">
                  <span className="bg-gray-900/60 px-2 py-0.5 rounded">
                    {getCategoryIcon(photo.category)} {getCategoryLabel(photo.category)}
                  </span>
                </div>
                {photo.caption && (
                  <p className="mt-1 line-clamp-2 text-xs">{photo.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : images && images.length > 0 ? (
        // 従来の画像表示
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="cursor-pointer" onClick={() => setSelectedPhoto(image)}>
              <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <img 
                  src={image} 
                  alt={`現場写真 ${index + 1}`} 
                  className="object-cover w-full h-full hover:opacity-90 transition-opacity"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 bg-gray-50 text-gray-500 text-center rounded">
          写真はありません
        </div>
      )}

      {/* 写真拡大モーダル */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl max-h-full">
            <div className="relative">
              <button
                className="absolute top-2 right-2 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center"
                onClick={(e) => { e.stopPropagation(); setSelectedPhoto(null); }}
              >
                ×
              </button>
              <img 
                src={selectedPhoto} 
                alt="拡大画像" 
                className="max-h-[80vh] max-w-full rounded"
              />
              {photos && selectedPhoto && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white">
                  {photos.find(p => p.url === selectedPhoto)?.caption}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 進捗表示コンポーネント
const ProgressDisplay = ({
  currentProgress,
  previousProgress
}: {
  currentProgress: number | undefined | null;
  previousProgress: number | undefined | null;
}) => {
  if (currentProgress === undefined || currentProgress === null) return null;
  
  // 前回比の計算
  const diff = previousProgress !== undefined && previousProgress !== null
    ? currentProgress - previousProgress
    : null;
  
  // 進捗状況に応じたカラー
  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // 進捗状況に応じたラベル
  const getProgressLabel = (progress: number) => {
    if (progress >= 90) return '完了間近';
    if (progress >= 60) return '順調';
    if (progress >= 30) return '進行中';
    if (progress > 0) return '初期段階';
    return '未着手';
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">進捗状況</h3>
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">{getProgressLabel(currentProgress)}</span>
          <div className="flex items-center">
            <span className="text-lg font-bold">{currentProgress}%</span>
            {diff !== null && (
              <span className={`ml-2 text-sm ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {diff > 0 ? '+' : ''}{diff.toFixed(1)}% <span className="text-gray-500">前回比</span>
              </span>
            )}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className={`h-4 rounded-full ${getProgressColor(currentProgress)}`} 
            style={{ width: `${Math.max(0, Math.min(100, currentProgress))}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// 日報詳細ページコンポーネント
const ReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ConstructionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      
      setLoading(true);
      setError('');
      
      try {
        const data = await constructionReportsApi.getReportById(id);
        setReport(data);
      } catch (err: any) {
        console.error('日報データの取得に失敗しました', err);
        setError(err.message || '日報データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy年M月d日(E)', { locale: ja });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate('/report')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          日報一覧に戻る
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded mb-4">
          日報が見つかりませんでした。
        </div>
        <button
          onClick={() => navigate('/report')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          日報一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">{report.site_name || '現場名不明'}</h1>
          <div className="flex items-center text-gray-600">
            <span className="mr-2">{formatDate(report.report_date)}</span>
            {report.weather_type && (
              <span className="mr-1">{getWeatherIcon(report.weather_type)}</span>
            )}
            <span>{report.weather}</span>
          </div>
        </div>
        <div className="flex">
          <button
            onClick={() => navigate('/report')}
            className="mr-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            一覧に戻る
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左カラム - 基本情報 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 作業内容セクション */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">作業内容</h2>
            <div className="whitespace-pre-line">{report.work_description}</div>
          </div>

          {/* 課題・問題点セクション */}
          {report.issues && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">課題・問題点</h2>
                {getIssueStatusBadge(report.issue_status)}
              </div>
              <div className="whitespace-pre-line">{report.issues}</div>
            </div>
          )}

          {/* 明日の作業予定セクション */}
          {report.next_day_plan && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold mb-4">明日の作業予定</h2>
              <div className="whitespace-pre-line">{report.next_day_plan}</div>
            </div>
          )}

          {/* 写真ギャラリー */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <PhotoGallery photos={report.photos} images={report.images} />
          </div>
        </div>

        {/* 右カラム - 補足情報 */}
        <div className="space-y-6">
          {/* 進捗状況 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <ProgressDisplay 
              currentProgress={report.progress_percentage || 0} 
              previousProgress={report.previous_progress_percentage} 
            />
          </div>

          {/* 天候と作業時間情報 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-4">天候・作業情報</h3>
            
            <div className="space-y-4">
              {/* 天候情報 */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">天候</h4>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 bg-gray-100 rounded-md text-gray-700">
                    {getWeatherIcon(report.weather_type)} {report.weather}
                  </div>
                  {report.temperature !== null && (
                    <div className="px-3 py-1.5 bg-gray-100 rounded-md text-gray-700">
                      🌡️ {report.temperature}℃
                    </div>
                  )}
                  {report.humidity !== null && (
                    <div className="px-3 py-1.5 bg-gray-100 rounded-md text-gray-700">
                      💧 湿度 {report.humidity}%
                    </div>
                  )}
                  {report.wind_speed !== null && (
                    <div className="px-3 py-1.5 bg-gray-100 rounded-md text-gray-700">
                      💨 風速 {report.wind_speed}m/s
                    </div>
                  )}
                  {report.wind_direction && (
                    <div className="px-3 py-1.5 bg-gray-100 rounded-md text-gray-700">
                      🧭 風向 {report.wind_direction}
                    </div>
                  )}
                </div>
              </div>

              {/* 作業時間 */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">作業時間</h4>
                <div className="flex items-center">
                  <span className="text-lg font-semibold">
                    {report.work_start_time || '-'} 〜 {report.work_end_time || '-'}
                  </span>
                </div>
                {report.manpower !== null && report.manpower !== undefined && (
                  <div className="mt-2 flex items-center text-gray-700">
                    <span className="mr-2">👷</span>
                    <span>作業員 {report.manpower}名</span>
                  </div>
                )}
              </div>

              {/* 安全確認 */}
              {report.safety_checks && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">安全確認</h4>
                  <ul className="space-y-1">
                    {report.safety_checks.morning_meeting && (
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>朝礼・KY活動</span>
                      </li>
                    )}
                    {report.safety_checks.safety_equipment && (
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>安全装備の着用</span>
                      </li>
                    )}
                    {report.safety_checks.risk_assessment && (
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>危険箇所の確認</span>
                      </li>
                    )}
                    {report.safety_checks.site_clean && (
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>現場整理整頓</span>
                      </li>
                    )}
                    {report.safety_checks.tools_inspection && (
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>工具・機材の点検</span>
                      </li>
                    )}
                  </ul>
                  {report.safety_checks.additional_notes && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="font-medium">特記事項:</p>
                      <p className="whitespace-pre-line">{report.safety_checks.additional_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 資材使用記録 */}
          {report.materials && report.materials.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium mb-4">使用資材</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">資材名</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">単位</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.materials.map((material, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{material.material_name}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{material.quantity}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{material.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 機材使用記録 */}
          {report.equipment && report.equipment.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium mb-4">使用機材</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">機材名</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">使用時間</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">オペレーター</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.equipment.map((equip, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{equip.equipment_name}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{equip.usage_hours || '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{equip.operator || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 作業員記録 */}
          {report.workers && report.workers.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium mb-4">作業員</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">役割</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">作業時間</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.workers.map((worker, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{worker.worker_name}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{worker.role || '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{worker.hours_worked || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* メタ情報 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium mb-4">レポート情報</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>報告者:</span>
                <span className="font-medium">{report.user_name || '不明'}</span>
              </div>
              <div className="flex justify-between">
                <span>作成日時:</span>
                <span className="font-medium">{report.created_at ? new Date(report.created_at).toLocaleString('ja-JP') : '不明'}</span>
              </div>
              {report.updated_at && report.updated_at !== report.created_at && (
                <div className="flex justify-between">
                  <span>更新日時:</span>
                  <span className="font-medium">{new Date(report.updated_at).toLocaleString('ja-JP')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail; 