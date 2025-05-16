import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// 環境変数から認証情報を取得し、取得できない場合はハードコードされた値を使用
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iygiuutslpnvrheqbqgv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Z2l1dXRzbHBudnJoZXFicWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjkzNzksImV4cCI6MjA2Mjg0NTM3OX0.skNBoqKqMl69jLLCyGvfS6CUY7TiCftaUOuLlrdUl10';

// デバッグ用にコンソールに出力
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'not available');
console.log('Supabase Key is valid:', supabaseAnonKey?.includes('.') || false);

// 認証リダイレクト検出
const hash = window.location.hash;
const hasAuthParams = hash.includes('access_token=') || hash.includes('type=magiclink');

if (hasAuthParams) {
  console.log('【supabase.ts】認証パラメータを検出:', hash);
  // 強制的にダッシュボードに遷移
  window.location.href = `${window.location.origin}/#/dashboard`;
  // 処理停止
  throw new Error('認証パラメータを検出。ダッシュボードに遷移中...');
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
      console.log('サインイン検出!');
      window.location.href = `${window.location.origin}/#/dashboard`;
    }
  });
  
} catch (error) {
  console.error('Supabaseクライアント作成エラー:', error);
  throw error;
}

// 作成したクライアントをエクスポート
export const supabase = supabaseClient;