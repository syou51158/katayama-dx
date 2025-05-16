import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// 環境変数から認証情報を取得し、取得できない場合はハードコードされた値を使用
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iygiuutslpnvrheqbqgv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Z2l1dXRzbHBudnJoZXFicWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjkzNzksImV4cCI6MjA2Mjg0NTM3OX0.skNBoqKqMl69jLLCyGvfS6CUY7TiCftaUOuLlrdUl10';

// デバッグ用にコンソールに出力
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'not available');
console.log('Supabase Key is valid:', supabaseAnonKey?.includes('.') || false);

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
  
  // マジックリンクからのリダイレクト処理を強化
  // URLにアクセストークンパラメータがある場合、ログイン後の処理
  const url = new URL(window.location.href);
  const hasLoginParams = url.hash.includes('access_token') || url.hash.includes('error_code');
  
  if (hasLoginParams) {
    console.log('ログイン/認証パラメータを検出: ', url.hash);
    
    // エラーがある場合の処理
    if (url.hash.includes('error')) {
      console.error('認証エラー:', url.hash);
    } else {
      // 成功時の処理 - URLパラメータ処理完了後にダッシュボードへリダイレクト
      // 少し遅延させてセッション確立を確実にする
      setTimeout(() => {
        console.log('認証成功後にダッシュボードへリダイレクト');
        window.location.href = '/#/dashboard';
      }, 500);
    }
  }
  
} catch (error) {
  console.error('Supabaseクライアント作成エラー:', error);
  throw error;
}

// 作成したクライアントをエクスポート
export const supabase = supabaseClient;