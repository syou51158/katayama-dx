import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [counts, setCounts] = useState({
    totalEmployees: 0,
    todayClockIns: 0,
    pendingLeaves: 0,
    todayReports: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // 従業員数を取得
        const { count: employeeCount, error: employeeError } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true });
        
        if (employeeError) throw employeeError;

        // 今日の打刻数を取得
        const today = new Date().toISOString().split('T')[0];
        const { count: todayClockInsCount, error: clockInError } = await supabase
          .from('attendance')
          .select('id', { count: 'exact', head: true })
          .gte('clock_in', `${today}T00:00:00`)
          .lte('clock_in', `${today}T23:59:59`);
        
        if (clockInError) throw clockInError;

        // 承認待ちの休暇申請数を取得
        const { count: pendingLeavesCount, error: leaveError } = await supabase
          .from('leave')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        if (leaveError) throw leaveError;

        // 今日の日報数を取得
        const { count: todayReportsCount, error: reportError } = await supabase
          .from('reports')
          .select('id', { count: 'exact', head: true })
          .eq('visit_date', today);
        
        if (reportError) throw reportError;

        setCounts({
          totalEmployees: employeeCount || 0,
          todayClockIns: todayClockInsCount || 0,
          pendingLeaves: pendingLeavesCount || 0,
          todayReports: todayReportsCount || 0
        });
      } catch (error) {
        console.error('ダッシュボードデータの取得に失敗:', error);
        setError('データの取得に失敗しました。再度お試しください。');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 従業員数カード */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h2 className="text-gray-500 text-sm">従業員数</h2>
                <p className="text-3xl font-bold">{counts.totalEmployees}</p>
              </div>
            </div>
          </div>

          {/* 今日の打刻数カード */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <span className="text-2xl">⏱️</span>
              </div>
              <div>
                <h2 className="text-gray-500 text-sm">今日の打刻数</h2>
                <p className="text-3xl font-bold">{counts.todayClockIns}</p>
              </div>
            </div>
          </div>

          {/* 承認待ち休暇申請カード */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <span className="text-2xl">🏖️</span>
              </div>
              <div>
                <h2 className="text-gray-500 text-sm">承認待ち休暇</h2>
                <p className="text-3xl font-bold">{counts.pendingLeaves}</p>
              </div>
            </div>
          </div>

          {/* 今日の日報数カード */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h2 className="text-gray-500 text-sm">今日の日報</h2>
                <p className="text-3xl font-bold">{counts.todayReports}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ダッシュボード追加情報エリア */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* お知らせセクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">お知らせ</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="text-sm text-gray-500">2025/05/15</p>
              <p>勤怠管理システムが稼働しました。</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="text-sm text-gray-500">2025/05/16</p>
              <p>営業日報の入力もお願いします。</p>
            </div>
          </div>
        </div>

        {/* ヘルプセクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">ヘルプ</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-blue-500 mr-2">📱</span>
              <p>スマートフォンでもアクセスできます。</p>
            </div>
            <div className="flex items-center">
              <span className="text-blue-500 mr-2">🔄</span>
              <p>ネット接続が切れても打刻は記録されます。</p>
            </div>
            <div className="flex items-center">
              <span className="text-blue-500 mr-2">❓</span>
              <p>操作でわからないことは管理者にお問い合わせください。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 