import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const SupabaseConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Supabaseの接続テスト（システム時間を取得）
        const { data, error } = await supabase.from('users').select('count()', { count: 'exact', head: true });
        
        if (error) throw error;
        
        setConnectionStatus('success');
      } catch (error) {
        console.error('Supabase接続エラー:', error);
        setConnectionStatus('error');
        setErrorMessage(error instanceof Error ? error.message : '不明なエラーが発生しました');
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mt-8">
      <div className="p-8">
        <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Supabase接続ステータス</div>
        <div className="mt-4">
          {connectionStatus === 'checking' && (
            <p className="text-yellow-500">接続を確認中...</p>
          )}
          {connectionStatus === 'success' && (
            <p className="text-green-500">接続成功！Supabaseと正常に通信できています。</p>
          )}
          {connectionStatus === 'error' && (
            <div>
              <p className="text-red-500">接続エラー</p>
              <p className="text-sm mt-2">{errorMessage}</p>
              <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <p>以下を確認してください：</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>.env.localファイルが正しく設定されているか</li>
                  <li>SupabaseのURLとAnon Keyが正しいか</li>
                  <li>インターネット接続が安定しているか</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupabaseConnectionTest;