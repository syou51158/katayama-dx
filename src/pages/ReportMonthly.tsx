import { useState, useEffect } from 'react';
import { constructionReportsApi } from '../lib/constructionApi';
import type { MonthlySummary } from '../types/constructionTypes';

// グラフ表示用のシンプルなバーコンポーネント
const BarGraph = ({ 
  label, 
  value, 
  maxValue, 
  color = 'bg-blue-500',
  unit = '' 
}: { 
  label: string; 
  value: number; 
  maxValue: number; 
  color?: string;
  unit?: string;
}) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-semibold">
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`${color} h-2.5 rounded-full`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

// 月次サマリーカードコンポーネント
const MonthlySummaryCard = ({ summary }: { summary: MonthlySummary }) => {
  // 工事現場ごとの作業時間の最大値を取得
  const maxHours = Math.max(...summary.sitesWorked.map(site => site.totalHours), 1);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 px-6 py-4 text-white">
        <h3 className="text-xl font-bold">{summary.year}年{summary.month}月 作業レポート</h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-4xl font-bold text-blue-600 mb-2">{summary.totalReports}</div>
            <div className="text-sm text-gray-500">日報件数</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-4xl font-bold text-blue-600 mb-2">{summary.totalWorkHours.toFixed(1)}</div>
            <div className="text-sm text-gray-500">総作業時間</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-4xl font-bold text-blue-600 mb-2">{summary.averageProgress.toFixed(1)}%</div>
            <div className="text-sm text-gray-500">平均進捗率</div>
          </div>
        </div>
        
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4">工事現場別作業時間</h4>
          {summary.sitesWorked.length === 0 ? (
            <p className="text-gray-500">データがありません</p>
          ) : (
            <div>
              {summary.sitesWorked.map(site => (
                <BarGraph 
                  key={site.id} 
                  label={site.name} 
                  value={site.totalHours} 
                  maxValue={maxHours}
                  unit="時間"
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-4">工事現場別進捗状況</h4>
          {summary.sitesWorked.filter(site => site.progressChange !== 0).length === 0 ? (
            <p className="text-gray-500">進捗データがありません</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      工事現場
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      進捗変化
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summary.sitesWorked
                    .filter(site => site.progressChange !== 0)
                    .sort((a, b) => b.progressChange - a.progressChange)
                    .map(site => (
                      <tr key={site.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {site.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${site.progressChange > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {site.progressChange > 0 ? '+' : ''}{site.progressChange.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div>
          <h4 className="text-lg font-medium mb-4">資材使用量</h4>
          {summary.materialUsage.length === 0 ? (
            <p className="text-gray-500">資材使用データがありません</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      資材名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      使用量
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summary.materialUsage.map((material, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {material.material_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {material.total_quantity.toFixed(2)} {material.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 月次レポートメインコンポーネント
const ReportMonthly = () => {
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 年月の選択
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  
  // 当月を含む直近12ヶ月の選択肢を生成
  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    for (let i = 0; i < 12; i++) {
      let targetMonth = currentMonth - i;
      let targetYear = currentYear;
      
      if (targetMonth <= 0) {
        targetMonth += 12;
        targetYear -= 1;
      }
      
      options.push({
        year: targetYear,
        month: targetMonth,
        label: `${targetYear}年${targetMonth}月`
      });
    }
    
    return options;
  };
  
  const monthOptions = getMonthOptions();
  
  // 選択した年月の月次データを取得
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await constructionReportsApi.getMonthlySummary(year, month);
        setSummary(data);
      } catch (err) {
        console.error('月次データの取得に失敗しました', err);
        setError('月次データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [year, month]);
  
  // 年月の変更ハンドラ
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const [selectedYear, selectedMonth] = value.split('-').map(Number);
    setYear(selectedYear);
    setMonth(selectedMonth);
  };
  
  // 月次データをCSV形式でエクスポート
  const exportToCsv = () => {
    if (!summary) return;
    
    // ヘッダー行
    let csvContent = "データ項目,値\n";
    
    // 基本情報
    csvContent += `年月,${summary.year}年${summary.month}月\n`;
    csvContent += `日報件数,${summary.totalReports}\n`;
    csvContent += `総作業時間,${summary.totalWorkHours.toFixed(1)}\n`;
    csvContent += `平均進捗率,${summary.averageProgress.toFixed(1)}%\n\n`;
    
    // 工事現場別作業時間
    csvContent += "工事現場,作業時間(時間)\n";
    summary.sitesWorked.forEach(site => {
      csvContent += `${site.name},${site.totalHours.toFixed(1)}\n`;
    });
    csvContent += "\n";
    
    // 進捗状況
    csvContent += "工事現場,進捗変化(%)\n";
    summary.sitesWorked
      .filter(site => site.progressChange !== 0)
      .forEach(site => {
        csvContent += `${site.name},${site.progressChange.toFixed(1)}\n`;
      });
    csvContent += "\n";
    
    // 資材使用量
    csvContent += "資材名,使用量,単位\n";
    summary.materialUsage.forEach(material => {
      csvContent += `${material.material_name},${material.total_quantity.toFixed(2)},${material.unit}\n`;
    });
    
    // CSVファイルを作成
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // ダウンロードリンクを作成して自動クリック
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `月次レポート_${summary.year}年${summary.month}月.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold">月次レポート</h1>
        
        <div className="flex items-center mt-4 md:mt-0">
          <select
            value={`${year}-${month}`}
            onChange={handleMonthChange}
            className="mr-4 p-2 border border-gray-300 rounded"
          >
            {monthOptions.map((option, index) => (
              <option 
                key={index} 
                value={`${option.year}-${option.month}`}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={exportToCsv}
            disabled={!summary || loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
          >
            CSVエクスポート
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : !summary ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">月次データがありません</p>
        </div>
      ) : (
        <MonthlySummaryCard summary={summary} />
      )}
    </div>
  );
};

export default ReportMonthly; 