import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { supabase } from './lib/supabase'

// 最優先実行 - URLに認証パラメータがあるか確認
const currentHash = window.location.hash;
const hasAuthRedirect = (
  currentHash.includes('access_token=') || 
  currentHash.includes('type=magiclink') || 
  currentHash.includes('type=recovery')
);

// 認証リダイレクトが検出された場合、即時にダッシュボードに遷移
if (hasAuthRedirect) {
  console.log('【最優先処理】認証リダイレクトを検出:', currentHash);
  // ダッシュボードURLを構築
  const origin = window.location.origin;
  // 強制的にダッシュボードに遷移
  window.location.href = `${origin}/#/dashboard`;
  
  // 以降の処理は実行しない
  throw new Error('認証リダイレクト処理中...');
}

// 環境に応じたダッシュボードURLを生成
function getDashboardUrl() {
  const hostname = window.location.hostname;
  const origin = window.location.origin;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isGitHubPages = hostname.includes('github.io');
  
  let baseUrl;
  if (isLocalhost) {
    baseUrl = `${origin}/`;
  } else if (isGitHubPages) {
    const basePath = window.location.pathname.endsWith('/') 
      ? window.location.pathname 
      : window.location.pathname + '/';
    baseUrl = `${origin}${basePath}`;
  } else {
    baseUrl = `${origin}${window.location.pathname}`;
  }
  
  return `${baseUrl}#/dashboard`;
}

// 認証リダイレクト検出とハンドリング（マジックリンクからの戻り）
async function handleAuthRedirect() {
  // URLのハッシュ部分にアクセストークンが含まれているか確認
  const hasAccessToken = location.hash.includes('access_token');
  const hasTypeOTP = location.hash.includes('type=magiclink') || location.hash.includes('type=recovery');
  
  if (hasAccessToken || hasTypeOTP) {
    console.log('認証パラメータを検出:', location.hash);
    
    try {
      // セッションを明示的に取得
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('セッション取得エラー:', error);
        return;
      }
      
      if (data.session) {
        console.log('有効なセッションを検出:', data.session.user.email);
        
        // ダッシュボードへのURL
        const dashboardUrl = getDashboardUrl();
        console.log('リダイレクト先URL:', dashboardUrl);
        
        // ダッシュボードへリダイレクト（遅延なし）
        console.log('即時ダッシュボードへリダイレクト');
        window.location.href = dashboardUrl;
      } else {
        console.log('セッションが見つかりませんでした');
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
