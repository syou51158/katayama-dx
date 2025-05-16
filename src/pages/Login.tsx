import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLinkSent, setIsLinkSent] = useState(false);
  
  const { user, isLoading, signIn } = useAuth();

  // すでにログインしている場合はダッシュボードへリダイレクト
  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!email) {
      setFormError('メールアドレスを入力してください');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await signIn(email);
      
      if (error) {
        setFormError(error.message || 'ログインに失敗しました');
      } else {
        setIsLinkSent(true);
      }
    } catch (error) {
      console.error('ログインエラー:', error);
      setFormError('ログイン処理中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-katayama-900 to-katayama-950 relative overflow-hidden">
      {/* 背景の装飾 */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-repeat bg-[url('/images/construction-pattern.svg')]"></div>
      <div className="absolute top-0 left-0 w-full h-16 bg-construction-500 opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-construction-500"></div>
      
      {/* ログインカード */}
      <div className="relative w-full max-w-md bg-white bg-opacity-95 rounded-lg shadow-premium p-8 border border-gray-100 mx-4">
        {/* ロゴ部分 */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-katayama-800 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">K</span>
            </div>
            <div className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full bg-construction-500 border-2 border-white"></div>
          </div>
        </div>

        {/* タイトル部分 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-katayama-900 font-serif">片山建設工業</h1>
          <div className="h-0.5 w-32 bg-construction-500 mx-auto my-3"></div>
          <p className="text-katayama-700 font-medium tracking-wider">勤怠管理システム</p>
        </div>
        
        {isLinkSent ? (
          <div className="text-center">
            <div className="bg-green-50 border-l-4 border-green-600 text-green-800 p-4 mb-6 rounded-r shadow-sm" role="alert">
              <p className="font-bold mb-1">メールを送信しました</p>
              <p>ログインリンクを記載したメールを送信しました。<br />メールをご確認ください。</p>
            </div>
            <button
              onClick={() => setIsLinkSent(false)}
              className="w-full py-3 px-4 rounded transition duration-150 
                bg-katayama-700 text-white font-medium shadow-sm 
                hover:bg-katayama-800 focus:outline-none focus:ring-2 focus:ring-katayama-600 focus:ring-opacity-50"
            >
              戻る
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {formError && (
              <div className="bg-red-50 border-l-4 border-red-600 text-red-800 p-4 rounded-r shadow-sm" role="alert">
                <p>{formError}</p>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-katayama-800 mb-2">
                メールアドレス
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md shadow-sm 
                    focus:ring-2 focus:ring-katayama-500 focus:border-katayama-500 focus:outline-none
                    transition duration-150"
                  placeholder="your-email@example.com"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {email && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent 
                  rounded-md shadow-md text-white font-medium bg-gradient-to-r 
                  ${isSubmitting 
                    ? 'from-gray-500 to-gray-600 cursor-not-allowed' 
                    : 'from-katayama-700 to-katayama-800 hover:from-katayama-800 hover:to-katayama-900'} 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-katayama-600 transition duration-150`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    送信中...
                  </>
                ) : 'マジックリンクを送信'}
              </button>
            </div>
            
            <div className="text-sm text-center">
              <p className="text-katayama-600">
                登録済みのメールアドレスにログインリンクを送信します。<br />
                受信したリンクをクリックしてログインしてください。
              </p>
            </div>
            
            <div className="pt-4 mt-4 border-t border-gray-200">
              <p className="text-center text-xs text-katayama-600 mt-2">© 2025 片山建設工業株式会社 - All Rights Reserved</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 