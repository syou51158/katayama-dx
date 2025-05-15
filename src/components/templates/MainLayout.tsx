import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';

// アクティブなリンククラス
const activeClass = "bg-blue-700 text-white";
const inactiveClass = "hover:bg-gray-700 hover:text-white";

export default function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // ナビゲーションリンク
  const navLinks = [
    { path: '/dashboard', label: 'ダッシュボード', icon: '📊' },
    { path: '/clockin', label: '打刻', icon: '⏱️' },
    { path: '/attendance', label: '勤怠一覧', icon: '📅' },
    { path: '/leave', label: '休暇申請', icon: '🏖️' },
    { path: '/report', label: '営業日報', icon: '📝' },
    { path: '/admin/master', label: 'マスター管理', icon: '⚙️' },
    { path: '/admin/settings', label: '設定', icon: '🔧' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 現在のパスがナビリンクのパスで始まるかをチェック
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <nav className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="font-bold text-xl">片山建設工業</span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        isActive(link.path) ? activeClass : inactiveClass
                      }`}
                    >
                      <span className="mr-1">{link.icon}</span>
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
            <div className="block md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
              >
                <span className="sr-only">メニューを開く</span>
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(link.path) ? activeClass : inactiveClass
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-1">{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* メインコンテンツエリア */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          <Outlet />
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} 片山建設工業株式会社. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 