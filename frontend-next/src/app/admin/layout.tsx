"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

/**
 * 認証付きfetchラッパー
 * 401レスポンス時に自動的にトークンを削除しログイン画面へリダイレクト
 */
export function useAuthFetch() {
  const router = useRouter();

  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      throw new Error('認証トークンがありません');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      router.push('/admin/login');
      throw new Error('認証の有効期限が切れました。再度ログインしてください。');
    }

    return response;
  }, [router]);

  return authFetch;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('admin_token');
    
    if (token) {
      setIsAuthenticated(true);
      if (pathname === '/admin/login' || pathname === '/admin') {
        router.push('/admin/dashboard');
      }
    } else {
      setIsAuthenticated(false);
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    }
  }, [pathname, router]);

  if (!mounted) return null;

  // ログイン画面はサイドバーなし
  if (pathname === '/admin/login') {
    return <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>{children}</div>;
  }

  // 認証前は何も表示しない（リダイレクト待ち）
  if (!isAuthenticated) return null;

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  const navItems = [
    { name: 'ダッシュボード', path: '/admin/dashboard', icon: '📊' },
    { name: 'お問い合わせ管理', path: '/admin/contacts', icon: '✉️' },
    { name: 'お知らせ管理', path: '/admin/news', icon: '📢' },
    { name: '施工事例管理', path: '/admin/works', icon: '🏠' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb', color: '#111827', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: '#1f2937', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #374151' }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>HM Admin Panel</h1>
        </div>
        <nav style={{ flex: 1, padding: '20px 0' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {navItems.map((item) => (
              <li key={item.path}>
                <a 
                  href={item.path} 
                  style={{ 
                    display: 'flex', alignItems: 'center', padding: '12px 20px', 
                    backgroundColor: pathname === item.path ? '#374151' : 'transparent',
                    color: pathname === item.path ? 'white' : '#9ca3af',
                    textDecoration: 'none', transition: 'background-color 0.2s'
                  }}
                >
                  <span style={{ marginRight: '10px' }}>{item.icon}</span>
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ padding: '20px', borderTop: '1px solid #374151' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', padding: '10px', backgroundColor: 'transparent', 
              color: '#f87171', border: '1px solid #f87171', borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ログアウト
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ backgroundColor: 'white', padding: '20px 30px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{navItems.find(i => i.path === pathname)?.name || 'Admin'}</h2>
          <div>
            <a href="/" target="_blank" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '0.9rem' }}>↗ サイトを確認</a>
          </div>
        </header>
        <div style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
