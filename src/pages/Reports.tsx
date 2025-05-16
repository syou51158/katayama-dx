import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { constructionReportsApi, constructionSitesApi } from '../lib/constructionApi';
import { useAuth } from '../contexts/AuthContext';
import type { 
  ConstructionReport, 
  ConstructionSite, 
  ReportFilter, 
  WeatherType, 
  ReportPhoto 
} from '../types/constructionTypes';

// 日付フォーマット用関数
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  });
};

// 天候タイプに対応するアイコンを取得
const getWeatherIcon = (weatherType?: WeatherType): string => {
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

// 課題ステータスに対応するラベルとスタイルを取得
const getIssueStatusInfo = (status?: 'none' | 'pending' | 'resolved') => {
  switch (status) {
    case 'pending':
      return {
        label: '対応中',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200'
      };
    case 'resolved':
      return {
        label: '解決済み',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200'
      };
    default:
      return {
        label: '問題なし',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-200'
      };
  }
};

// レポートフィルターコンポーネント
const ReportFilters = ({
  filter,
  onFilterChange,
  sites
}: {
  filter: ReportFilter;
  onFilterChange: (filter: ReportFilter) => void;
  sites: ConstructionSite[];
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filter,
      [name]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium mb-3">検索条件</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            工事現場
          </label>
          <select
            name="site_id"
            value={filter.site_id || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">すべての現場</option>
            {sites.map(site => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            開始日
          </label>
          <input
            type="date"
            name="start_date"
            value={filter.start_date || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            終了日
          </label>
          <input
            type="date"
            name="end_date"
            value={filter.end_date || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            天候
          </label>
          <select
            name="weather_type"
            value={filter.weather_type || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">すべての天候</option>
            <option value="sunny">晴れ ☀️</option>
            <option value="cloudy">曇り ☁️</option>
            <option value="rainy">雨 🌧️</option>
            <option value="snowy">雪 ❄️</option>
            <option value="foggy">霧 🌫️</option>
            <option value="windy">風 💨</option>
            <option value="stormy">嵐 ⛈️</option>
            <option value="other">その他 🌡️</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            課題ステータス
          </label>
          <select
            name="issue_status"
            value={filter.issue_status || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">すべてのステータス</option>
            <option value="none">問題なし</option>
            <option value="pending">対応中</option>
            <option value="resolved">解決済み</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            進捗率
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              name="progress_min"
              value={filter.progress_min || ''}
              onChange={handleChange}
              placeholder="最小"
              min="0"
              max="100"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <span>〜</span>
            <input
              type="number"
              name="progress_max"
              value={filter.progress_max || ''}
              onChange={handleChange}
              placeholder="最大"
              min="0"
              max="100"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <span>%</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={clearFilters}
          className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
        >
          クリア
        </button>
      </div>
    </div>
  );
};

// 写真コンポーネント
const ReportPhotos = ({ photos, images }: { photos?: ReportPhoto[]; images?: string[] }) => {
  const [activeTab, setActiveTab] = useState<'enhanced' | 'legacy'>(photos?.length ? 'enhanced' : 'legacy');
  
  // 表示する画像の取得
  const getDisplayImages = () => {
    if (activeTab === 'enhanced' && photos?.length) {
      return photos.slice(0, 3).map((photo, index) => (
        <div key={index} className="aspect-w-1 aspect-h-1">
          <img 
            src={photo.url} 
            alt={photo.caption || `写真 ${index + 1}`}
            className="w-full h-20 object-cover rounded"
          />
          {photo.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
              {photo.caption}
            </div>
          )}
        </div>
      ));
    } else if (images?.length) {
      return images.slice(0, 3).map((image, index) => (
        <div key={index} className="aspect-w-1 aspect-h-1">
          <img 
            src={image} 
            alt={`現場写真 ${index + 1}`}
            className="w-full h-20 object-cover rounded"
          />
        </div>
      ));
    }
    
    return null;
  };

  // 残りの枚数表示
  const getRemainingCount = () => {
    if (activeTab === 'enhanced' && photos?.length) {
      return photos.length > 3 ? photos.length - 3 : 0;
    } else if (images?.length) {
      return images.length > 3 ? images.length - 3 : 0;
    }
    return 0;
  };

  // 写真がない場合は表示しない
  if ((!photos || photos.length === 0) && (!images || images.length === 0)) {
    return null;
  }
  
  return (
    <div className="mb-4">
      {/* 切替タブ（両方の種類の写真がある場合のみ表示） */}
      {photos?.length && images?.length ? (
        <div className="flex border-b mb-2">
          <button
            className={`px-3 py-1 text-xs ${
              activeTab === 'enhanced' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('enhanced')}
          >
            分類済み写真 ({photos.length})
          </button>
          <button
            className={`px-3 py-1 text-xs ${
              activeTab === 'legacy' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('legacy')}
          >
            基本写真 ({images.length})
          </button>
        </div>
      ) : null}

      {/* 写真グリッド */}
      <div className="grid grid-cols-3 gap-2 relative">
        {getDisplayImages()}
        
        {getRemainingCount() > 0 && (
          <div className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            +{getRemainingCount()}
          </div>
        )}
      </div>
    </div>
  );
};

// 日報カードコンポーネント
const ReportCard = ({ report }: { report: ConstructionReport }) => {
  // 課題ステータス情報の取得
  const issueStatusInfo = getIssueStatusInfo(report.issue_status);
  
  // 前回比の計算
  const getProgressDiff = () => {
    if (report.previous_progress_percentage !== undefined && 
        report.progress_percentage !== undefined) {
      const diff = report.progress_percentage - report.previous_progress_percentage;
      return {
        value: diff.toFixed(1),
        isPositive: diff > 0,
        isNegative: diff < 0
      };
    }
    return null;
  };
  
  const progressDiff = getProgressDiff();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <span className="font-bold">{report.site_name}</span>
          <div className="flex items-center space-x-2">
            {report.weather_type && (
              <span className="text-sm">{getWeatherIcon(report.weather_type)}</span>
            )}
            <span className="text-sm text-gray-500">{formatDate(report.report_date)}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <h3 className="font-semibold mb-2">作業内容</h3>
          <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-3">
            {report.work_description}
          </p>
        </div>

        {/* 進捗率表示 */}
        {report.progress_percentage !== null && report.progress_percentage !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">進捗率</span>
              <div className="flex items-center">
                <span className="text-sm font-semibold">
                  {report.progress_percentage.toFixed(1)}%
                </span>
                {progressDiff && (
                  <span className={`ml-2 text-xs ${
                    progressDiff.isPositive ? 'text-green-600' : 
                    progressDiff.isNegative ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {progressDiff.isPositive ? '+' : ''}{progressDiff.value}%
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  report.progress_percentage >= 90 ? 'bg-green-600' :
                  report.progress_percentage >= 60 ? 'bg-blue-600' :
                  report.progress_percentage >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${report.progress_percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* 課題表示 */}
        {report.issues && report.issue_status && report.issue_status !== 'none' && (
          <div className={`mb-4 p-2 rounded-md ${issueStatusInfo.bgColor} ${issueStatusInfo.borderColor} border`}>
            <div className="flex items-start">
              <div className={`text-xs font-medium ${issueStatusInfo.textColor} mr-1`}>
                {issueStatusInfo.label}:
              </div>
              <div className="text-xs text-gray-700 line-clamp-2">
                {report.issues}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {report.weather && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {report.weather_type ? getWeatherIcon(report.weather_type) : ''} {report.weather}
            </span>
          )}
          {report.temperature && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              🌡️ {report.temperature}℃
            </span>
          )}
          {report.work_start_time && report.work_end_time && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              ⏰ {report.work_start_time} 〜 {report.work_end_time}
            </span>
          )}
          {report.manpower !== null && report.manpower !== undefined && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              👷 作業員: {report.manpower}名
            </span>
          )}
        </div>

        {/* 写真表示コンポーネント */}
        <ReportPhotos photos={report.photos} images={report.images} />

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            報告者: {report.user_name || '不明'}
          </span>
          <Link
            to={`/report/${report.id}`}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
          >
            詳細
          </Link>
        </div>
      </div>
    </div>
  );
};

// メインの日報一覧ページコンポーネント
const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ConstructionReport[]>([]);
  const [sites, setSites] = useState<ConstructionSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<ReportFilter>({});

  // データの取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('Fetching data for reports page with user:', user?.id);
        
        // 工事現場データの取得
        try {
          const sitesData = await constructionSitesApi.getAllSites();
          setSites(sitesData);
          console.log('Sites loaded successfully:', sitesData.length);
        } catch (sitesErr: any) {
          console.error('工事現場データの取得に失敗しました', sitesErr);
          setError(`工事現場データの取得に失敗しました: ${sitesErr.message || '不明なエラー'}`);
        }
        
        // 日報データの取得
        try {
          const reportsData = await constructionReportsApi.getReports(filter);
          setReports(reportsData);
          console.log('Reports loaded successfully:', reportsData.length);
        } catch (reportsErr: any) {
          console.error('日報データの取得に失敗しました', reportsErr);
          setError(`日報データの取得に失敗しました: ${reportsErr.message || '不明なエラー'}`);
        }
      } catch (err: any) {
        console.error('データの取得に失敗しました', err);
        setError(`データの取得に失敗しました: ${err.message || '不明なエラー'}`);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setLoading(false);
      setError('ログインしているユーザーが見つかりません。再度ログインしてください。');
    }
  }, [filter, user]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">日報一覧</h1>
        <Link
          to="/report/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          新規日報作成
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <ReportFilters 
        filter={filter}
        onFilterChange={setFilter}
        sites={sites}
      />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 mb-4">日報データがありません</p>
          <Link
            to="/report/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            最初の日報を作成する
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map(report => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports; 