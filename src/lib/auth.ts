import { supabase } from './supabase';

// メールリンクでのサインイン
export async function signInWithEmail(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  });

  return { data, error };
}

// メールリンクでのサインアップ
export async function signUpWithEmail(email: string, password: string, firstName: string, lastName: string) {
  // 1. 認証ユーザーを作成
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
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
  return user;
}

// ユーザープロファイルを取得
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

// パスワードリセット
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
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
  return supabase.auth.onAuthStateChange(callback);
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