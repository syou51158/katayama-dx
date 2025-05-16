import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// 型の不一致を一時的に回避するためのany型を使用
type Activity = any;

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    totalEmployees: 0,
    todayClockIns: 0,
    pendingLeaves: 0,
    todayReports: 0
  });

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // リフレッシュのためのキー

  // 今月のカレンダーデータ
  const [calendarData, setCalendarData] = useState<{
    dates: Date[];
    attendanceMap: Record<string, boolean>;
  }>({
    dates: [],
    attendanceMap: {}
  });

  useEffect(() => {
    // 今月の日付配列を生成
    const generateCalendarDates = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      
      // 月の初日
      const firstDay = new Date(year, month, 1);
      // 月の最終日
      const lastDay = new Date(year, month + 1, 0);
      
      const dates: Date[] = [];
      for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
      
      return dates;
    };

    setCalendarData(prev => ({ ...prev, dates: generateCalendarDates() }));
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);
        
        // ユーザー認証状態を確認
        console.log('Dashboard - Current user:', user);
        console.log('Dashboard - User ID:', user?.id);
        
        // Supabase接続状態を確認
        console.log('Dashboard - Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('Dashboard - Using Supabase client:', !!supabase);

        try {
          // テスト用のシンプルなクエリでSupabaseへの接続を確認
          const { data: connectionTest, error: connectionError } = await supabase
            .from('users')
            .select('id')
            .limit(1);
            
          console.log('Supabase connection test:', 
            connectionError ? 'Failed' : 'Success', 
            connectionError ? connectionError : connectionTest
          );
        } catch (connErr) {
          console.error('Supabase connection test error:', connErr);
        }

        // 従業員数を取得
        const { count: employeeCount, error: employeeError } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true });
        
        if (employeeError) {
          console.error('従業員数取得エラー:', employeeError);
          throw employeeError;
        }

        // 今日の打刻数を取得
        const today = new Date().toISOString().split('T')[0];
        const { count: todayClockInsCount, error: clockInError } = await supabase
          .from('attendance')
          .select('id', { count: 'exact', head: true })
          .gte('clock_in', `${today}T00:00:00`)
          .lte('clock_in', `${today}T23:59:59`);
        
        if (clockInError) {
          console.error('今日の打刻数取得エラー:', clockInError);
          throw clockInError;
        }

        // 承認待ちの休暇申請数を取得
        const { count: pendingLeavesCount, error: leaveError } = await supabase
          .from('leave')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        if (leaveError) {
          console.error('休暇申請取得エラー:', leaveError);
          throw leaveError;
        }

        // 今日の日報数を取得
        const { count: todayReportsCount, error: reportError } = await supabase
          .from('reports')
          .select('id', { count: 'exact', head: true })
          .eq('visit_date', today);
        
        if (reportError) {
          console.error('日報数取得エラー:', reportError);
          throw reportError;
        }

        // 最近の活動を取得
        const { data: recentActivities, error: activityError } = await supabase
          .from('attendance')
          .select(`
            id, 
            clock_in, 
            clock_out,
            users:user_id (first_name, last_name)
          `)
          .order('clock_in', { ascending: false })
          .limit(5);
          
        if (activityError) {
          console.error('最近の活動取得エラー:', activityError);
          throw activityError;
        }

        console.log('最近の活動データ:', recentActivities);

        // ログインユーザーの今月の勤怠状況を取得
        if (user) {
          console.log('Fetching attendance for user ID:', user.id);
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
          
          const { data: monthAttendance, error: monthError } = await supabase
            .from('attendance')
            .select('clock_in')
            .eq('user_id', user.id)
            .gte('clock_in', `${startOfMonth}T00:00:00`)
            .lte('clock_in', `${endOfMonth}T23:59:59`);
          
          console.log('Month attendance query result:', { data: monthAttendance, error: monthError });
          
          if (monthError) {
            console.error('Error fetching month attendance:', monthError);
            setError('月間出勤データの取得に失敗しました');
          } else if (monthAttendance) {
            // 出勤日のマップを作成
            const attendanceMap: Record<string, boolean> = {};
            monthAttendance.forEach(record => {
              if (record.clock_in) {
                const dateStr = new Date(record.clock_in).toISOString().split('T')[0];
                attendanceMap[dateStr] = true;
              }
            });
            
            setCalendarData(prev => ({ ...prev, attendanceMap }));
          }
        } else {
          console.warn('ユーザーが認証されていないため、勤怠データを取得できません');
        }

        setCounts({
          totalEmployees: employeeCount || 0,
          todayClockIns: todayClockInsCount || 0,
          pendingLeaves: pendingLeavesCount || 0,
          todayReports: todayReportsCount || 0
        });

        setActivities(recentActivities as Activity[] || []);
      } catch (error) {
        console.error('ダッシュボードデータの取得に失敗:', error);
        setError('データの取得に失敗しました。再度お試しください。');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user, refreshKey]); // refreshKeyを依存配列に追加

  // データの手動更新関数
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // 日付をフォーマットする関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="section-container fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title mb-0">ダッシュボード</h1>
        <button 
          onClick={handleRefresh}
          className="btn btn-outline flex items-center text-sm"
          disabled={loading}
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {loading ? "更新中..." : "データを更新"}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-600 text-red-800 p-4 mb-6 rounded-r shadow-sm" role="alert">
          <p>{error}</p>
        </div>
      )}

      {loading && counts.totalEmployees === 0 ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-katayama-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 従業員数カード */}
          <div className="card-base p-6 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center">
              <div className="rounded-full bg-katayama-100 p-3 mr-4 text-katayama-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-katayama-600 text-sm font-medium">従業員数</h2>
                <p className="text-3xl font-bold text-katayama-800">{counts.totalEmployees}</p>
              </div>
            </div>
          </div>

          {/* 今日の打刻数カード */}
          <div className="card-base p-6 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4 text-green-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-green-600 text-sm font-medium">今日の打刻数</h2>
                <p className="text-3xl font-bold text-green-800">{counts.todayClockIns}</p>
              </div>
            </div>
          </div>

          {/* 承認待ち休暇申請カード */}
          <div className="card-base p-6 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center">
              <div className="rounded-full bg-construction-100 p-3 mr-4 text-construction-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-construction-600 text-sm font-medium">承認待ち休暇</h2>
                <p className="text-3xl font-bold text-construction-800">{counts.pendingLeaves}</p>
              </div>
            </div>
          </div>

          {/* 今日の日報数カード */}
          <div className="card-base p-6 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4 text-purple-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-purple-600 text-sm font-medium">今日の日報</h2>
                <p className="text-3xl font-bold text-purple-800">{counts.todayReports}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツエリア：カレンダーと最近の活動 */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* カレンダー表示（今月の勤怠状況） */}
        <div className="card-base p-6 lg:col-span-1">
          <h2 className="section-title flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-katayama-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            今月の勤怠状況
          </h2>
          
          <div className="mt-4">
            <div className="text-center mb-2">
              {new Date().getFullYear()}年{new Date().getMonth() + 1}月
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
              <div className="text-red-600">日</div>
              <div>月</div>
              <div>火</div>
              <div>水</div>
              <div>木</div>
              <div>金</div>
              <div className="text-blue-600">土</div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {/* 月の最初の日の曜日に合わせて空のセルを追加 */}
              {calendarData.dates.length > 0 && Array.from({ length: calendarData.dates[0].getDay() }).map((_, index) => (
                <div key={`empty-${index}`} className="h-8"></div>
              ))}
              
              {/* 各日付を表示 */}
              {calendarData.dates.map((date, index) => {
                const dateStr = date.toISOString().split('T')[0];
                const hasAttendance = calendarData.attendanceMap[dateStr];
                const isToday = new Date().toISOString().split('T')[0] === dateStr;
                
                return (
                  <div 
                    key={index}
                    className={`h-8 flex items-center justify-center rounded-full text-xs
                      ${isToday ? 'border-2 border-katayama-500 font-bold' : ''}
                      ${hasAttendance ? 'bg-katayama-100 text-katayama-800' : ''}
                      ${date.getDay() === 0 ? 'text-red-600' : ''}
                      ${date.getDay() === 6 ? 'text-blue-600' : ''}
                    `}
                  >
                    {date.getDate()}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-xs text-gray-500 flex items-center">
              <div className="w-4 h-4 bg-katayama-100 rounded-full mr-2"></div>
              <span>出勤日</span>
            </div>
          </div>
        </div>
        
        {/* 最近の活動 */}
        <div className="card-base p-6 lg:col-span-2">
          <h2 className="section-title flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-katayama-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            最近の活動
          </h2>
          
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              最近の活動記録はありません
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="border-l-4 border-katayama-300 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-katayama-800">
                        {activity.users?.last_name} {activity.users?.first_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.clock_in && `出勤: ${formatDate(activity.clock_in)}`}
                        {activity.clock_out && ` / 退勤: ${formatDate(activity.clock_out)}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* お知らせとヘルプセクション */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* お知らせセクション */}
        <div className="card-base p-6">
          <h2 className="section-title flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-katayama-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            お知らせ
          </h2>
          <div className="space-y-4 mt-4">
            <div className="border-l-4 border-katayama-500 pl-4 py-2 bg-katayama-50 rounded-r">
              <p className="text-sm text-katayama-600 font-medium">2025/05/15</p>
              <p className="text-katayama-800">勤怠管理システムが稼働しました。</p>
            </div>
            <div className="border-l-4 border-construction-500 pl-4 py-2 bg-construction-50 rounded-r">
              <p className="text-sm text-construction-600 font-medium">2025/05/16</p>
              <p className="text-construction-800">営業日報の入力もお願いします。</p>
            </div>
            <div className="border-l-4 border-katayama-500 pl-4 py-2 bg-katayama-50 rounded-r">
              <p className="text-sm text-katayama-600 font-medium">2025/05/17</p>
              <p className="text-katayama-800">新規案件の書類提出期限は今月末までです。</p>
            </div>
          </div>
        </div>

        {/* ヘルプセクション */}
        <div className="card-base p-6">
          <h2 className="section-title flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-katayama-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ヘルプ
          </h2>
          <div className="space-y-4 mt-4">
            <div className="flex items-start p-3 bg-katayama-50 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-katayama-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-katayama-700">スマートフォンでもアクセスできます。外出先でも打刻可能です。</p>
            </div>
            <div className="flex items-start p-3 bg-construction-50 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-construction-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p className="text-construction-700">ネット接続が切れても打刻は記録されます。復旧後に自動で同期します。</p>
            </div>
            <div className="flex items-start p-3 bg-katayama-50 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-katayama-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-katayama-700">操作でわからないことは管理者にお問い合わせください。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 