import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

const SupabaseConnectionTest = () => {
  const [testResult, setTestResult] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [connectionInfo, setConnectionInfo] = useState({
    url: import.meta.env.VITE_SUPABASE_URL || '未設定',
    hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
  });

  useEffect(() => {
    async function testConnection() {
      try {
        console.log('テスト開始: Supabase接続確認');
        
        // 環境変数の確認
        const apiUrl = import.meta.env.VITE_SUPABASE_URL;
        const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        console.log('API URL:', apiUrl);
        console.log('API Key exists:', !!apiKey);
        
        setConnectionInfo({
          url: apiUrl || '未設定',
          hasKey: !!apiKey
        });
        
        // 最もシンプルなクエリでテスト
        const { data, error } = await supabase
          .from('users')
          .select('id, email')
          .limit(1);
        
        if (error) {
          console.error('Supabase接続エラー:', error);
          setTestResult('error');
          setErrorMessage(error.message);
          return;
        }
        
        console.log('Supabase接続成功:', data);
        setTestResult('success');
        setResponseData(data);
        
        // RLS設定の確認のため認証なしでもテスト
        const { data: rlsData, error: rlsError } = await supabase
          .from('users')
          .select('count()')
          .single();
          
        console.log('RLSテスト結果:', rlsError ? 'RLS制限あり' : 'アクセス可能', 
          rlsError ? rlsError.message : rlsData);
          
      } catch (e) {
        console.error('予期せぬエラー:', e);
        setTestResult('error');
        setErrorMessage(e instanceof Error ? e.message : '不明なエラー');
      }
    }
    
    testConnection();
  }, []);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Supabase接続テスト</h2>
      
      {testResult === 'loading' && (
        <div className="flex items-center text-blue-500">
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          接続テスト中...
        </div>
      )}
      
      {testResult === 'success' && (
        <div>
          <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">
            ✅ Supabase接続に成功しました！
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">接続情報:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>URL: {connectionInfo.url}</li>
              <li>API Key: {connectionInfo.hasKey ? '設定済み' : '未設定'}</li>
            </ul>
          </div>
          
          {responseData && (
            <div>
              <h3 className="font-medium mb-2">テストデータ:</h3>
              <pre className="bg-gray-100 p-3 rounded-md overflow-auto text-sm">
                {JSON.stringify(responseData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
      
      {testResult === 'error' && (
        <div>
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
            ❌ Supabase接続に失敗しました
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">接続情報:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>URL: {connectionInfo.url}</li>
              <li>API Key: {connectionInfo.hasKey ? '設定済み' : '未設定'}</li>
            </ul>
          </div>
          
          {errorMessage && (
            <div>
              <h3 className="font-medium mb-2">エラー詳細:</h3>
              <div className="bg-red-50 p-3 rounded-md border border-red-200 text-sm">
                {errorMessage}
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">トラブルシューティング:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>APIキーとURLが正しいか確認してください</li>
              <li>ブラウザのコンソールでネットワークエラーを確認してください</li>
              <li>CORSの設定が正しいか確認してください</li>
              <li>Row Level Security(RLS)の設定を確認してください</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseConnectionTest;