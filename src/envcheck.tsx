import React from 'react';

// 環境変数チェック用のコンポーネント
const EnvCheck: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">環境変数確認</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Supabase 設定</h2>
        
        <div className="mb-4">
          <p className="font-medium">VITE_SUPABASE_URL:</p>
          <p className="bg-gray-100 p-2 rounded">
            {supabaseUrl || '設定されていません'}
          </p>
        </div>
        
        <div className="mb-4">
          <p className="font-medium">VITE_SUPABASE_ANON_KEY:</p>
          <p className="bg-gray-100 p-2 rounded">
            {supabaseAnonKey ? 'キーが設定されています' : '設定されていません'}
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">ホスト情報</h2>
        <p><strong>ホスト:</strong> {window.location.host}</p>
        <p><strong>プロトコル:</strong> {window.location.protocol}</p>
      </div>
    </div>
  );
};

export default EnvCheck; 