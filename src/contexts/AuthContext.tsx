import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getCurrentUser, signInWithEmail, signOut, getUserProfile } from '../lib/auth';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextProps {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<{ error: any }>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初期ロード時のユーザー情報取得
  useEffect(() => {
    async function loadUserData() {
      setIsLoading(true);
      try {
        // 現在のセッションユーザーを取得
        const currentUser = await getCurrentUser();

        if (currentUser) {
          setUser(currentUser);

          // ユーザープロファイルを取得
          const { data: profileData } = await getUserProfile(currentUser.id);
          setProfile(profileData || null);
        }
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserData();

    // 認証状態の変化を監視
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const { data: profileData } = await getUserProfile(session.user.id);
          setProfile(profileData || null);
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // サインイン処理
  const signIn = async (email: string) => {
    const { error } = await signInWithEmail(email);
    return { error };
  };

  // ログアウト処理
  const logOut = async () => {
    await signOut();
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    isLoading,
    signIn,
    logOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// コンテキストを使用するためのカスタムフック
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 