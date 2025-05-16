import './App.css'
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import SupabaseConnectionTest from './components/SupabaseConnectionTest'
import { lazy, Suspense } from 'react'
import { useAuth } from './contexts/AuthContext'

// レイアウトコンポーネント
const MainLayout = lazy(() => import('./components/templates/MainLayout'))

// ページコンポーネント (遅延ロード)
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ClockIn = lazy(() => import('./pages/ClockIn'))
const Attendance = lazy(() => import('./pages/Attendance'))
const Leave = lazy(() => import('./pages/Leave'))
const EnvCheck = lazy(() => import('./envcheck'))

// 日報機能コンポーネント
const ReportNew = lazy(() => import('./pages/ReportNew'))
const Reports = lazy(() => import('./pages/Reports'))
const ReportMonthly = lazy(() => import('./pages/ReportMonthly'))
const ConstructionSites = lazy(() => import('./pages/ConstructionSites'))

// 仮のページコンポーネント（未実装ページ用）
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-6">{title}</h1>
    <div className="bg-white rounded-lg shadow-md p-6">
      <p className="text-center py-8 text-gray-500">このページは準備中です</p>
    </div>
  </div>
);

// 未実装ページの仮のコンポーネント
const AdminMaster = () => <PlaceholderPage title="マスター管理" />;
const AdminSettings = () => <PlaceholderPage title="システム設定" />;

// ローディングコンポーネント
const Loading = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
)

// 認証が必要なルートを保護するためのラッパー
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

function App() {
  return (
    <HashRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* 認証不要のルート */}
          <Route path="/login" element={<Login />} />
          <Route path="/test" element={
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold text-center mb-8">Supabase接続テスト</h1>
              <div className="max-w-4xl mx-auto">
                <SupabaseConnectionTest />
              </div>
            </div>
          } />
          <Route path="/envcheck" element={<EnvCheck />} />

          {/* 保護されたルート */}
          <Route element={<ProtectedRoute />}>
            {/* トップページはダッシュボードにリダイレクト */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* メインレイアウト内のルーティング */}
            <Route path="/" element={<MainLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="clockin" element={<ClockIn />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="leave" element={<Leave />} />
              <Route path="report">
                <Route path="new" element={<ReportNew />} />
                <Route index element={<Reports />} />
                <Route path="monthly" element={<ReportMonthly />} />
              </Route>
              <Route path="sites" element={<ConstructionSites />} />
              <Route path="admin">
                <Route path="master" element={<AdminMaster />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>
          </Route>

          {/* 404ページ */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-screen">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-xl mb-8">ページが見つかりませんでした</p>
              <a href="/#/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                ホームに戻る
              </a>
            </div>
          } />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
