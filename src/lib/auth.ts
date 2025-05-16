import { supabase } from './supabase';

// リダイレクトURL取得関数（環境に応じて適切なURLを返す）
function getRedirectUrl(path: string): string {
  // 現在のオリジンを取得
  const origin = window.location.origin;
  console.log('Current origin:', origin);
  
  // GitHub Pagesの場合はハッシュルーターを考慮
  const basePath = window.location.pathname.endsWith('/') 
    ? window.location.pathname 
    : window.location.pathname + '/';
  
  // ハッシュルーターを使用しているため、リダイレクト先には#を含める
  const redirectUrl = `${origin}${basePath}#${path}`;
  console.log('Generated redirect URL:', redirectUrl);
  
  return redirectUrl;
}

// メールリンクでのサインイン
export async function signInWithEmail(email: string) {
  // 環境に応じたリダイレクトURLを生成
  const redirectUrl = getRedirectUrl('/dashboard');
  
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
      shouldCreateUser: true, // ユーザーが存在しなければ作成
    },
  });

  console.log('Sign in attempt result:', error ? 'Error' : 'Success');
  return { data, error };
}

// メールリンクでのサインアップ
export async function signUpWithEmail(email: string, password: string, firstName: string, lastName: string) {
  // 環境に応じたリダイレクトURLを生成
  const redirectUrl = getRedirectUrl('/dashboard');
  
  // 1. 認証ユーザーを作成
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (authError) return { data: null, error: authError };

  // 2. ユーザープロファイルを作成
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
        role: 'employee', // デフォルトロール
      });

    if (profileError) return { data: null, error: profileError };
  }

  return { data: authData, error: null };
}

// サインアウト
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// 現在のユーザーを取得
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Current user data:', user);
  return user;
}

// ユーザープロファイルを取得
export async function getUserProfile(userId: string) {
  console.log('Getting user profile for ID:', userId);
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error(`Error fetching profile for ${userId}:`, error);
    } else {
      console.log(`Successfully fetched profile for ${userId}:`, data);
    }

    return { data, error };
  } catch (err) {
    console.error('Unexpected error in getUserProfile:', err);
    return { data: null, error: err };
  }
}

// パスワードリセット
export async function resetPassword(email: string) {
  // 環境に応じたリダイレクトURLを生成
  const redirectUrl = getRedirectUrl('/reset-password');
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  return { data, error };
}

// 新しいパスワードを設定
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { data, error };
}

// セッションを監視する
export const subscribeToAuthChanges = (callback: (event: any, session: any) => void) => {
  console.log('Setting up auth state change subscription');
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, 'Session:', session ? 'exists' : 'null');
    callback(event, session);
  });
};

// ユーザープロファイル更新
export async function updateUserProfile(userId: string, userData: any) {
  const { data, error } = await supabase
    .from('users')
    .update(userData)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
} 