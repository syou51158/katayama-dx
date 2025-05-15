import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// 環境変数からSupabase認証情報を取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// デバッグ用にコンソールに出力
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'キーが設定されています' : 'キーが設定されていません');

// 環境変数が設定されていない場合のエラーハンドリング
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URLまたはAnon Keyが設定されていません。.env.localファイルを確認してください。');
  alert('Supabase接続情報が見つかりません。.env.localファイルを確認してください。');
}

// Supabaseクライアントの作成 
export const supabase = createClient<Database>(
  supabaseUrl || 'https://example.supabase.co',  // 暫定的なダミー値を設定
  supabaseAnonKey || 'dummy-key'  // 暫定的なダミー値を設定 
);