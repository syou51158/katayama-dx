import React from 'react';

// 環境変数チェック用のコンポーネント
const EnvCheck: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const appUrl = import.meta.env.VITE_APP_URL;
  
  // すべての環境変数のキーを取得
  const allEnvKeys = Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">環境変数確認</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Supabase 設定</h2>
        
        <div className="mb-4">
          <p className="font-medium">VITE_SUPABASE_URL:</p>
          <p className="bg-gray-100 p-2 rounded mt-1 break-all">
            {supabaseUrl || '設定されていません'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            型: {typeof supabaseUrl}, 文字列長: {supabaseUrl?.length || 0}
          </p>
        </div>
        
        <div className="mb-4">
          <p className="font-medium">VITE_SUPABASE_ANON_KEY:</p>
          <p className="bg-gray-100 p-2 rounded mt-1 break-all">
            {supabaseAnonKey ? (supabaseAnonKey.substring(0, 10) + '...' + supabaseAnonKey.substring(supabaseAnonKey.length - 10)) : '設定されていません'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            型: {typeof supabaseAnonKey}, 文字列長: {supabaseAnonKey?.length || 0}
          </p>
        </div>
        
        <div className="mb-4">
          <p className="font-medium">VITE_APP_URL:</p>
          <p className="bg-gray-100 p-2 rounded mt-1 break-all">
            {appUrl || '設定されていません'}
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">すべての環境変数</h2>
        <ul className="list-disc pl-5">
          {allEnvKeys.map(key => (
            <li key={key} className="mb-2">
              <span className="font-medium">{key}</span>: 設定されています
            </li>
          ))}
        </ul>
        {allEnvKeys.length === 0 && <p className="text-red-500">環境変数が見つかりません</p>}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">ホスト情報</h2>
        <p><strong>ホスト:</strong> {window.location.host}</p>
        <p><strong>プロトコル:</strong> {window.location.protocol}</p>
        <p><strong>オリジン:</strong> {window.location.origin}</p>
        <p><strong>ポート:</strong> {window.location.port || '(デフォルト)'}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">ブラウザ/環境情報</h2>
        <p><strong>ユーザーエージェント:</strong> {navigator.userAgent}</p>
        <p><strong>言語:</strong> {navigator.language}</p>
        <p><strong>ビルドモード:</strong> {import.meta.env.MODE}</p>
        <p><strong>開発環境:</strong> {import.meta.env.DEV ? 'はい' : 'いいえ'}</p>
      </div>
    </div>
  );
};

export default EnvCheck; 