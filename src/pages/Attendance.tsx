import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AttendanceRecord {
  id: string;
  user_id: string;
  clock_in: string | null;
  clock_out: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

export default function Attendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // 現在のユーザー情報を取得
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        
        // ユーザーロールを取得
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (data && !error) {
          setUserRole(data.role);
        }
      }
    };
    
    getUser();
  }, []);

  // 勤怠データを取得
  useEffect(() => {
    if (!currentUserId) return;

    const fetchAttendanceRecords = async () => {
      setLoading(true);
      try {
        // 選択された月の開始日と終了日
        const [year, month] = selectedMonth.split('-');
        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0); // 月の最終日
        
        // クエリ作成
        let query = supabase
          .from('attendance')
          .select(`
            *,
            users:user_id (first_name, last_name)
          `)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59).toISOString())
          .order('created_at', { ascending: false });
        
        // 管理者以外は自分の記録のみ表示
        if (userRole !== 'admin' && userRole !== 'manager') {
          query = query.eq('user_id', currentUserId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // データ整形
        const formattedData = data?.map(record => ({
          ...record,
          user_name: record.users ? `${record.users.last_name} ${record.users.first_name}` : '不明'
        })) || [];
        
        setRecords(formattedData);
      } catch (error) {
        console.error('勤怠データの取得に失敗:', error);
        setError('データの取得に失敗しました。再度お試しください。');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceRecords();
  }, [currentUserId, selectedMonth, userRole]);

  // 勤務時間を計算
  const calculateWorkHours = (clockIn: string | null, clockOut: string | null): string => {
    if (!clockIn || !clockOut) return '-';
    
    const startTime = new Date(clockIn);
    const endTime = new Date(clockOut);
    const diffMs = endTime.getTime() - startTime.getTime();
    
    if (diffMs < 0) return '-';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}時間${minutes}分`;
  };

  // 日付フォーマット
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    });
  };

  // 時刻フォーマット
  const formatTime = (dateString: string | null): string => {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 選択可能な月のリストを生成
  const getMonthOptions = (): { value: string, label: string }[] => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // 過去12ヶ月分の選択肢を生成
    for (let i = 0; i < 12; i++) {
      let month = currentMonth - i;
      let year = currentYear;
      
      if (month <= 0) {
        month += 12;
        year -= 1;
      }
      
      const value = `${year}-${String(month).padStart(2, '0')}`;
      const label = `${year}年${month}月`;
      
      options.push({ value, label });
    }
    
    return options;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">勤怠一覧</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* 月選択 */}
      <div className="mb-6">
        <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-2">
          表示月
        </label>
        <select
          id="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="mt-1 block w-full md:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
        >
          {getMonthOptions().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 勤怠データテーブル */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            表示するデータがありません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日付
                  </th>
                  {(userRole === 'admin' || userRole === 'manager') && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      氏名
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    出勤時刻
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    退勤時刻
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    勤務時間
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.created_at)}
                    </td>
                    {(userRole === 'admin' || userRole === 'manager') && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.user_name}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(record.clock_in)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(record.clock_out)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {calculateWorkHours(record.clock_in, record.clock_out)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CSV出力ボタン (管理者のみ) */}
      {(userRole === 'admin' || userRole === 'manager') && (
        <div className="mt-6">
          <button
            onClick={() => {
              // CSVデータ作成
              const headers = ['日付', '氏名', '出勤時刻', '退勤時刻', '勤務時間'];
              const csvData = records.map(record => [
                formatDate(record.created_at),
                record.user_name,
                formatTime(record.clock_in),
                formatTime(record.clock_out),
                calculateWorkHours(record.clock_in, record.clock_out)
              ]);
              
              // CSVフォーマット
              const csvContent = [
                headers.join(','),
                ...csvData.map(row => row.join(','))
              ].join('\n');
              
              // ダウンロード
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `勤怠記録_${selectedMonth}.csv`);
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            CSVダウンロード
          </button>
        </div>
      )}
    </div>
  );
} 