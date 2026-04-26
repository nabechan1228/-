"use client";

import { useState, useEffect } from 'react';
import { useAuthFetch } from '../layout';

interface DashboardStats {
  unread_contacts: number;
  total_contacts: number;
  published_news: number;
  total_works: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const authFetch = useAuthFetch();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/admin/dashboard/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error('統計情報の取得に失敗:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [authFetch]);

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>ダッシュボード概要</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ fontSize: '1rem', color: '#6b7280', margin: '0 0 10px 0' }}>未読のお問い合わせ</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#111827' }}>
            {loading ? '...' : stats?.unread_contacts ?? '-'}
          </p>
          <a href="/admin/contacts" style={{ display: 'inline-block', marginTop: '10px', fontSize: '0.85rem', color: '#3b82f6' }}>確認する →</a>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981' }}>
          <h3 style={{ fontSize: '1rem', color: '#6b7280', margin: '0 0 10px 0' }}>公開中のお知らせ</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#111827' }}>
            {loading ? '...' : stats?.published_news ?? '-'}
          </p>
          <a href="/admin/news" style={{ display: 'inline-block', marginTop: '10px', fontSize: '0.85rem', color: '#10b981' }}>管理する →</a>
        </div>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ fontSize: '1rem', color: '#6b7280', margin: '0 0 10px 0' }}>登録済みの施工事例</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#111827' }}>
            {loading ? '...' : stats?.total_works ?? '-'}
          </p>
          <a href="/admin/works" style={{ display: 'inline-block', marginTop: '10px', fontSize: '0.85rem', color: '#f59e0b' }}>管理する →</a>
        </div>
      </div>
      
      <div style={{ marginTop: '40px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px' }}>システム情報</h2>
        <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>
          この管理画面からホームページの主要なコンテンツ（お知らせ、施工事例）の更新と、お客様からのお問い合わせ内容の確認が可能です。<br/>
          左側のメニューから各機能へアクセスしてください。
        </p>
      </div>
    </div>
  );
}
