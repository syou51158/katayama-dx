import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// 環境変数から認証情報を取得し、取得できない場合はハードコードされた値を使用
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iygiuutslpnvrheqbqgv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Z2l1dXRzbHBudnJoZXFicWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjkzNzksImV4cCI6MjA2Mjg0NTM3OX0.skNBoqKqMl69jLLCyGvfS6CUY7TiCftaUOuLlrdUl10';

// デバッグ用にコンソールに出力
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'not available');
console.log('Supabase Key is valid:', supabaseAnonKey?.includes('.') || false);

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
  
  const dashboardUrl = `${baseUrl}#/dashboard`;
  console.log('生成されたダッシュボードURL:', dashboardUrl);
  return dashboardUrl;
}

// クライアント作成を試みる
let supabaseClient;
try {
  supabaseClient = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: localStorage,
        storageKey: 'katayama-dx-auth',
        debug: true
      }
    }
  );
  console.log('Supabaseクライアント作成成功');
  
  // 認証状態の変更を監視
  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log(`Auth event detected: ${event}`, session ? 'セッションあり' : 'セッションなし');
    
    if (event === 'SIGNED_IN' && session) {
      console.log('サインイン検出:', session.user.email);
      
      // サインイン直後はダッシュボードに遷移
      const dashboardUrl = getDashboardUrl();
      window.location.href = dashboardUrl;
    }
  });
  
  // 認証パラメータ検出
  const hash = window.location.hash;
  const hasAuthParams = hash.includes('access_token=') || 
                       hash.includes('type=recovery') || 
                       hash.includes('type=magiclink');
  
  if (hasAuthParams) {
    console.log('認証パラメータを検出:', hash);
    
    // エラーチェック
    if (hash.includes('error=') || hash.includes('error_description=')) {
      console.error('認証エラーを検出:', hash);
    } else {
      // 認証処理実行
      (async () => {
        try {
          // セッション取得を試みる
          const { data, error } = await supabaseClient.auth.getSession();
          
          if (error) {
            console.error('セッション取得エラー:', error);
          } else if (data.session) {
            console.log('有効なセッションを取得:', data.session.user.email);
            
            // 明示的にダッシュボードに遷移
            const dashboardUrl = getDashboardUrl();
            console.log('ダッシュボードへリダイレクト:', dashboardUrl);
            window.location.href = dashboardUrl;
          } else {
            console.log('セッションが見つかりませんでした');
          }
        } catch (err) {
          console.error('認証処理中のエラー:', err);
        }
      })();
    }
  }
  
} catch (error) {
  console.error('Supabaseクライアント作成エラー:', error);
  throw error;
}

// 作成したクライアントをエクスポート
export const supabase = supabaseClient;