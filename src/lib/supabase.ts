import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// 環境変数から認証情報を取得し、取得できない場合はハードコードされた値を使用
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iygiuutslpnvrheqbqgv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Z2l1dXRzbHBudnJoZXFicWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjkzNzksImV4cCI6MjA2Mjg0NTM3OX0.skNBoqKqMl69jLLCyGvfS6CUY7TiCftaUOuLlrdUl10';

// デバッグ用にコンソールに出力
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'not available');
console.log('Supabase Key is valid:', supabaseAnonKey?.includes('.') || false);

// ダッシュボードへリダイレクトする関数
function redirectToDashboard() {
  const origin = window.location.origin;
  console.log('ダッシュボードへリダイレクト処理実行');
  window.location.href = `${origin}/#/dashboard`;
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
        debug: true
      }
    }
  );
  console.log('Supabaseクライアント作成成功');
  
  // 認証状態の変更を監視
  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log(`Auth event detected: ${event}`, session ? 'セッションあり' : 'セッションなし');
    
    if (event === 'SIGNED_IN' && session) {
      console.log('サインイン検出:', session.user?.email);
      
      // セッションが検出されたらダッシュボードにリダイレクト
      // main.tsxにも同様の処理があるが、どちらかが動作するように冗長化
      setTimeout(() => {
        redirectToDashboard();
      }, 500);
    }
  });
  
} catch (error) {
  console.error('Supabaseクライアント作成エラー:', error);
  throw error;
}

// 作成したクライアントをエクスポート
export const supabase = supabaseClient;