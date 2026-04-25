"use client";

import { useState, useEffect } from 'react';

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchNews = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/admin/news`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNews(Array.isArray(data) ? data : []);
      } else {
        setNews([]);
      }
    } catch (err) {
      console.error(err);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/admin/news`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ title, content, is_published: true })
      });
      if (response.ok) {
        setTitle('');
        setContent('');
        fetchNews();
      }
    } catch (err) {
      alert('エラーが発生しました');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/admin/news/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchNews();
      }
    } catch (err) {
      alert('エラーが発生しました');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>お知らせ管理</h1>
      
      {/* 新規追加フォーム */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>新規作成</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>タイトル</label>
            <input 
              type="text" value={title} onChange={e => setTitle(e.target.value)} required
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>本文</label>
            <textarea 
              value={content} onChange={e => setContent(e.target.value)} required rows={4}
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
          <button type="submit" style={{ alignSelf: 'flex-start', background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
            登録する
          </button>
        </form>
      </div>

      {/* 一覧 */}
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '15px', fontWeight: '500', color: '#4b5563', fontSize: '0.9rem' }}>公開日時</th>
              <th style={{ padding: '15px', fontWeight: '500', color: '#4b5563', fontSize: '0.9rem' }}>タイトル</th>
              <th style={{ padding: '15px', fontWeight: '500', color: '#4b5563', fontSize: '0.9rem' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</td></tr>
            ) : news.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>お知らせはありません</td></tr>
            ) : (
              news.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '15px', fontSize: '0.9rem' }}>{item.published_at ? new Date(item.published_at).toLocaleString('ja-JP') : '-'}</td>
                  <td style={{ padding: '15px', fontSize: '0.9rem', fontWeight: '500' }}>{item.title}</td>
                  <td style={{ padding: '15px', fontSize: '0.9rem' }}>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
