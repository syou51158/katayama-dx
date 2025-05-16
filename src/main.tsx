import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { supabase } from './lib/supabase'

// 認証リダイレクトを行う関数（本番環境とローカル環境の両方で動作）
function redirectToDashboard() {
  // 現在のURL基点を取得
  const origin = window.location.origin;
  
  // 明示的にハッシュルーターのパスを指定
  const dashboardUrl = `${origin}/#/dashboard`;
  console.log('リダイレクト先URL:', dashboardUrl);
  
  // 画面遷移
  window.location.href = dashboardUrl;
}

// 認証リダイレクト検出とハンドリング（マジックリンクからの戻り）
async function handleAuthRedirect() {
  // URLのハッシュ部分を確認
  const hash = window.location.hash;
  
  // 認証パラメータの存在を確認
  const hasAuthParams = hash.includes('access_token=') || 
                      hash.includes('type=magiclink') || 
                      hash.includes('type=recovery');
  
  if (hasAuthParams) {
    console.log('認証パラメータを検出:', hash);
    
    try {
      // セッションを処理してユーザー情報を取得
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('セッション取得エラー:', error);
        return;
      }
      
      if (data.session) {
        console.log('セッションが見つかりました:', data.session.user.email);
        
        // 少し遅延してからリダイレクト（セッション確立を確実にするため）
        setTimeout(() => {
          console.log('ダッシュボードへリダイレクト実行');
          redirectToDashboard();
        }, 300);
        
        return; // リダイレクト処理を開始したので関数終了
      }
    } catch (err) {
      console.error('認証処理エラー:', err);
    }
  }
}

// 認証リダイレクト処理を実行
handleAuthRedirect();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
