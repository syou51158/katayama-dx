import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { supabase } from './lib/supabase'

// 認証リダイレクト検出とハンドリング（マジックリンクからの戻り）
async function handleAuthRedirect() {
  // URLのハッシュ部分にアクセストークンが含まれているか確認
  const hasAccessToken = location.hash.includes('access_token');
  const hasTypeOTP = location.hash.includes('type=magiclink') || location.hash.includes('type=recovery');
  
  if (hasAccessToken || hasTypeOTP) {
    console.log('認証パラメータを検出:', location.hash);
    
    try {
      // セッションを処理
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error('セッション取得エラー:', error);
        return;
      }
      
      // 現在のユーザーを取得
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        console.log('ユーザー認証成功:', data.user.email);
        
        // ダッシュボードへリダイレクト
        // 少し遅延させて確実にセッションが保存されるようにする
        setTimeout(() => {
          console.log('ダッシュボードへリダイレクト');
          window.location.href = '/#/dashboard';
        }, 500);
      }
    } catch (err) {
      console.error('認証パラメータ処理エラー:', err);
    }
  }
}

// 認証リダイレクトを処理
handleAuthRedirect();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
