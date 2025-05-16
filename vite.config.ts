import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 環境変数を明示的に読み込む
  const env = loadEnv(mode, process.cwd(), '');
  
  // コンソールに環境変数の読み込み状態を出力
  console.log('Vite環境変数の読み込み状態:');
  console.log('VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL ? '設定されています' : '設定されていません');
  console.log('VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY ? '設定されています' : '設定されていません');
  
  // GitHub Pagesのリポジトリ名を取得（環境変数から、または空文字列をデフォルトとする）
  const repoName = env.VITE_REPO_NAME || 'katayama-dx';
  const base = mode === 'production' ? `/${repoName}/` : '/';
  
  return {
    plugins: [react()],
    base,
    define: {
      // 環境変数をグローバルに定義
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || 'https://iygiuutslpnvrheqbqgv.supabase.co'),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Z2l1dXRzbHBudnJoZXFicWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNjkzNzksImV4cCI6MjA2Mjg0NTM3OX0.skNBoqKqMl69jLLCyGvfS6CUY7TiCftaUOuLlrdUl10'),
      'import.meta.env.VITE_APP_URL': JSON.stringify(env.VITE_APP_URL || 'http://localhost:5176'),
    }
  }
})
