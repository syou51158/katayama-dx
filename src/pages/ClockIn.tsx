import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: number;
}

export default function ClockIn() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any | null>(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // オフライン状態を監視
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 現在のユーザー情報を取得
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // ユーザー情報を取得
        const { data, error } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
        
        if (data && !error) {
          setUserName(`${data.last_name} ${data.first_name}`);
        }
      }
    };
    
    getUser();
  }, []);

  // 今日の打刻データを取得
  useEffect(() => {
    if (!userId) return;

    const fetchTodayAttendance = async () => {
      // 今日の日付
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data && !error) {
        setTodayAttendance(data);
      }
    };

    fetchTodayAttendance();
  }, [userId]);

  // 位置情報を取得
  const getLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ text: '位置情報が利用できません', type: 'error' });
      return Promise.resolve(null);
    }

    setIsLocationLoading(true);
    
    return new Promise<LocationData | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          setLocationData(locationData);
          setIsLocationLoading(false);
          resolve(locationData);
        },
        (error) => {
          console.error('位置情報の取得に失敗しました:', error);
          setMessage({ text: '位置情報の取得に失敗しました', type: 'warning' });
          setIsLocationLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  // 打刻処理
  const handleClockIn = async () => {
    if (!userId) {
      setMessage({ text: 'ログインしてください', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      // 位置情報を取得
      const location = await getLocation();
      
      if (isOffline) {
        // オフラインの場合、IndexedDBに保存（実装が必要）
        console.log('オフライン: 打刻データをローカルに保存します');
        setMessage({ text: 'オフラインです。再接続後に打刻が同期されます', type: 'warning' });
        // TODO: IndexedDBに保存する処理
        return;
      }

      // 出勤打刻
      if (!todayAttendance || todayAttendance.clock_out) {
        const { data, error } = await supabase
          .from('attendance')
          .insert([
            { 
              user_id: userId, 
              clock_in: new Date().toISOString(), 
              location_in: location,
              offline_sync: isOffline
            }
          ])
          .select()
          .single();

        if (error) throw error;
        setTodayAttendance(data);
        setMessage({ text: '出勤打刻が完了しました', type: 'success' });
      } 
      // 退勤打刻
      else if (todayAttendance && !todayAttendance.clock_out) {
        const { data, error } = await supabase
          .from('attendance')
          .update({ 
            clock_out: new Date().toISOString(),
            location_out: location
          })
          .eq('id', todayAttendance.id)
          .select()
          .single();

        if (error) throw error;
        setTodayAttendance(data);
        setMessage({ text: '退勤打刻が完了しました', type: 'success' });
      }
    } catch (error) {
      console.error('打刻に失敗しました:', error);
      setMessage({ text: '打刻に失敗しました', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 打刻ステータスに応じたボタンテキストを取得
  const getButtonText = () => {
    if (!todayAttendance || todayAttendance.clock_out) {
      return '出勤打刻';
    }
    return '退勤打刻';
  };

  // 時刻を整形
  const formatTime = (dateString: string | null) => {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">打刻</h1>
      
      {/* 接続状態 */}
      {isOffline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p className="font-bold">オフラインモード</p>
          <p>インターネット接続がありません。打刻データは再接続時に同期されます。</p>
        </div>
      )}

      {/* メッセージ表示 */}
      {message.text && (
        <div 
          className={`border-l-4 p-4 mb-6 ${
            message.type === 'success' ? 'bg-green-100 border-green-500 text-green-700' :
            message.type === 'error' ? 'bg-red-100 border-red-500 text-red-700' :
            'bg-yellow-100 border-yellow-500 text-yellow-700'
          }`} 
          role="alert"
        >
          <p>{message.text}</p>
        </div>
      )}

      {/* ユーザー情報 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">勤務者情報</h2>
        <p className="text-xl mb-2">{userName || '読み込み中...'}</p>
        <p className="text-gray-500 text-sm">
          {new Date().toLocaleDateString('ja-JP', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
          })}
        </p>
      </div>
      
      {/* 打刻状況 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">今日の打刻状況</h2>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">出勤時刻</p>
            <p className="text-xl font-semibold">
              {todayAttendance ? formatTime(todayAttendance.clock_in) : '--:--'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">退勤時刻</p>
            <p className="text-xl font-semibold">
              {todayAttendance ? formatTime(todayAttendance.clock_out) : '--:--'}
            </p>
          </div>
        </div>
      </div>

      {/* 打刻ボタン */}
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={handleClockIn}
          disabled={loading || isLocationLoading}
          className={`w-full py-3 px-4 rounded-lg text-white font-semibold flex justify-center items-center ${
            (!todayAttendance || todayAttendance.clock_out) 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-green-600 hover:bg-green-700'
          } ${(loading || isLocationLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading || isLocationLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isLocationLoading ? '位置情報取得中...' : '処理中...'}
            </>
          ) : getButtonText()}
        </button>
        
        {/* 位置情報表示 */}
        {locationData && (
          <div className="mt-4 text-xs text-gray-500">
            <p>緯度: {locationData.latitude?.toFixed(6)}</p>
            <p>経度: {locationData.longitude?.toFixed(6)}</p>
            <p>精度: {locationData.accuracy?.toFixed(0)}m</p>
          </div>
        )}
      </div>
    </div>
  );
} 