import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getCurrentUser, signInWithEmail, signOut, getUserProfile, subscribeToAuthChanges } from '../lib/auth';
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

// 認証状態が変わったときのリダイレクト処理
function handleAuthChange(event: string, session: any) {
  console.log('AuthContext: Auth state changed:', event);
  
  // URLチェック - 認証パラメータがあるか確認
  const hasAuthParams = window.location.hash.includes('access_token=') || 
                       window.location.hash.includes('type=magiclink');
                       
  if (hasAuthParams && event === 'SIGNED_IN' && session) {
    console.log('マジックリンク認証成功後のリダイレクト処理');
    
    // ダッシュボードに移動
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isGitHubPages = hostname.includes('github.io');
    
    let baseUrl;
    if (isLocalhost) {
      baseUrl = origin + '/';
    } else if (isGitHubPages) {
      baseUrl = origin + (pathname.endsWith('/') ? pathname : pathname + '/');
    } else {
      baseUrl = origin + pathname;
    }
    
    window.location.href = baseUrl + '#/dashboard';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初期ロード時のユーザー情報取得
  useEffect(() => {
    console.log('AuthProvider initialized, checking for existing session');
    console.log('Environment URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Environment Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    async function loadUserData() {
      setIsLoading(true);
      try {
        // 現在のセッションユーザーを取得
        const currentUser = await getCurrentUser();
        console.log('Initial load - Current user:', currentUser ? JSON.stringify(currentUser) : 'Not found');

        if (currentUser) {
          setUser(currentUser);
          console.log('Setting user in state:', currentUser.email);

          // ユーザープロファイルを取得
          const { data: profileData, error } = await getUserProfile(currentUser.id);
          if (error) {
            console.error('Error fetching user profile:', error);
            
            // プロファイル取得失敗時、usersテーブルにレコードが存在するか確認
            const { error: checkError } = await supabase
              .from('users')
              .select('id')
              .eq('id', currentUser.id)
              .single();
              
            if (checkError) {
              console.error('User does not exist in users table:', checkError);
              
              // ユーザーが存在しない場合は作成を試みる
              const { error: insertError } = await supabase
                .from('users')
                .insert({
                  id: currentUser.id,
                  email: currentUser.email || '',
                  first_name: currentUser.user_metadata?.first_name || '名前未設定',
                  last_name: currentUser.user_metadata?.last_name || '姓未設定',
                  role: 'employee',
                });
                
              if (insertError) {
                console.error('Failed to create user profile:', insertError);
              } else {
                console.log('Created new user profile for:', currentUser.id);
                // 作成後に再取得
                const { data: newProfileData } = await getUserProfile(currentUser.id);
                setProfile(newProfileData || null);
              }
            }
          } else {
            console.log('User profile loaded:', profileData);
            setProfile(profileData || null);
          }
        } else {
          console.log('No current user found during initial load');
        }
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserData();

    // 認証状態の変化を監視
    const { data: authListener } = subscribeToAuthChanges(
      async (event, session) => {
        console.log('Auth state changed in context:', event);
        
        // 認証状態変更を処理
        handleAuthChange(event, session);
        
        if (event === 'SIGNED_IN') {
          console.log('Sign in detected, user signed in');
          if (session?.user) {
            console.log('Setting user from session after sign in:', session.user.email);
            setUser(session.user);
            // プロファイル情報を取得
            try {
              const { data: profileData, error } = await getUserProfile(session.user.id);
              if (error) {
                console.error('Error loading profile after sign in:', error);
                
                // プロファイルが存在しない場合は作成を試みる
                const { error: insertError } = await supabase
                  .from('users')
                  .insert({
                    id: session.user.id,
                    email: session.user.email || '',
                    first_name: session.user.user_metadata?.first_name || '名前未設定',
                    last_name: session.user.user_metadata?.last_name || '姓未設定',
                    role: 'employee',
                  });
                  
                if (insertError) {
                  console.error('Failed to create user profile after sign in:', insertError);
                } else {
                  console.log('Created new user profile after sign in for:', session.user.id);
                  // 作成後に再取得
                  const { data: newProfileData } = await getUserProfile(session.user.id);
                  setProfile(newProfileData || null);
                }
              } else {
                console.log('Profile loaded after sign in:', profileData);
                setProfile(profileData || null);
              }
            } catch (err) {
              console.error('Failed to load profile after sign in:', err);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('Sign out detected, clearing user data');
          setUser(null);
          setProfile(null);
        } else if (event === 'USER_UPDATED') {
          console.log('User updated event received');
          if (session?.user) {
            setUser(session.user);
          }
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      console.log('Cleaning up auth subscription');
      authListener.subscription.unsubscribe();
    };
  }, []);

  // サインイン処理
  const signIn = async (email: string) => {
    console.log('SignIn function called with email:', email);
    const { error } = await signInWithEmail(email);
    if (error) {
      console.error('Error during sign in:', error);
    } else {
      console.log('Sign in successful, magic link sent');
    }
    return { error };
  };

  // ログアウト処理
  const logOut = async () => {
    console.log('Logout function called');
    const { error } = await signOut();
    if (error) {
      console.error('Error during sign out:', error);
    } else {
      console.log('Sign out successful');
      setUser(null);
      setProfile(null);
    }
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