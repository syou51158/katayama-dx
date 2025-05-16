import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// 環境変数から認証情報を取得し、取得できない場合はハードコードされた値を使用
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iygiuutslpnvrheqbqgv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Z2l1dXRzbHBudnJoZXFicWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjkzNzksImV4cCI6MjA2Mjg0NTM3OX0.skNBoqKqMl69jLLCyGvfS6CUY7TiCftaUOuLlrdUl10';

// デバッグ用にコンソールに出力
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'not available');
console.log('Supabase Key is valid:', supabaseAnonKey?.includes('.') || false);

// 認証後にリダイレクトする関数
function redirectAfterAuth() {
  console.log('認証成功後にダッシュボードへリダイレクト');
  
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isGitHubPages = hostname.includes('github.io');
  
  let baseUrl;
  
  if (isLocalhost) {
    // ローカル環境
    baseUrl = `${window.location.origin}/`;
    console.log('ローカル環境用ベースURL:', baseUrl);
  } else if (isGitHubPages) {
    // GitHub Pages環境
    const basePath = window.location.pathname.endsWith('/') 
      ? window.location.pathname 
      : window.location.pathname + '/';
    baseUrl = `${window.location.origin}${basePath}`;
    console.log('GitHub Pages環境用ベースURL:', baseUrl);
  } else {
    // その他の環境
    baseUrl = `${window.location.origin}${window.location.pathname}`;
    console.log('その他の環境用ベースURL:', baseUrl);
  }
  
  // 最終的なリダイレクト先URL
  const dashboardUrl = `${baseUrl}#/dashboard`;
  console.log('リダイレクト先URL:', dashboardUrl);
  
  // ページを遷移
  window.location.href = dashboardUrl;
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
        debug: true
      }
    }
  );
  console.log('Supabaseクライアント作成成功');
  
  // 認証状態の変更を監視（より詳細なログ出力）
  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state change detected in Supabase client:', event);
    console.log('Session exists:', !!session);
    
    if (event === 'SIGNED_IN' && session) {
      console.log('User signed in, redirecting to dashboard');
      console.log('Session user:', session.user.email);
      
      // 少し遅延させてセッション確立を確実にする
      setTimeout(() => {
        console.log('Executing redirect after timeout');
        redirectAfterAuth();
      }, 500);
    }
  });
  
  // マジックリンクからのリダイレクト処理を強化
  // URLにアクセストークンパラメータがある場合、ログイン後の処理
  const url = new URL(window.location.href);
  const hasLoginParams = url.hash.includes('access_token') || 
                         url.hash.includes('type=magiclink') || 
                         url.hash.includes('type=recovery');
  
  if (hasLoginParams) {
    console.log('ログイン/認証パラメータを検出: ', url.hash);
    
    // エラーがある場合の処理
    if (url.hash.includes('error')) {
      console.error('認証エラー:', url.hash);
    } else {
      // セッション情報を明示的に更新
      (async () => {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) {
          console.error('セッション取得エラー:', error);
        } else if (data?.session) {
          console.log('有効なセッションを検出:', data.session.user.email);
          
          // 成功時は少し遅延させてSIGNED_INイベントを処理できるようにする
          setTimeout(() => {
            // 念のためSIGNED_INイベントが処理されなかった場合に備えて直接リダイレクト
            console.log('認証パラメータ処理完了後の安全策としてリダイレクト');
            redirectAfterAuth();
          }, 800);
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