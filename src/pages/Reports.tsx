import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { constructionReportsApi, constructionSitesApi } from '../lib/constructionApi';
import { useAuth } from '../contexts/AuthContext';
import type { ConstructionReport, ConstructionSite, ReportFilter } from '../types/constructionTypes';

// 日付フォーマット用関数
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  });
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

// 日報カードコンポーネント
const ReportCard = ({ report }: { report: ConstructionReport }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <span className="font-bold">{report.site_name}</span>
          <span className="text-sm text-gray-500">{formatDate(report.report_date)}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <h3 className="font-semibold mb-2">作業内容</h3>
          <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-3">
            {report.work_description}
          </p>
        </div>

        {report.progress_percentage !== null && report.progress_percentage !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">進捗率</span>
              <span className="text-sm font-semibold">
                {report.progress_percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${report.progress_percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {report.weather && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              天候: {report.weather}
            </span>
          )}
          {report.work_start_time && report.work_end_time && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {report.work_start_time} 〜 {report.work_end_time}
            </span>
          )}
          {report.manpower !== null && report.manpower !== undefined && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              作業員: {report.manpower}名
            </span>
          )}
        </div>

        {report.images && report.images.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-3 gap-2">
              {report.images.slice(0, 3).map((image, index) => (
                <div key={index} className="aspect-w-1 aspect-h-1">
                  <img 
                    src={image} 
                    alt={`現場写真 ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                </div>
              ))}
              {report.images.length > 3 && (
                <div className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  +{report.images.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

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