"use client";

import { useState, useEffect } from 'react';
import { useAuthFetch } from '../layout';

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const authFetch = useAuthFetch();
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const fetchNews = async () => {
    try {
      const r = await authFetch(`${API}/api/admin/news`);
      if (r.ok) { const d = await r.json(); setNews(Array.isArray(d) ? d : []); }
      else setNews([]);
    } catch { setNews([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchNews(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await authFetch(`${API}/api/admin/news`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, is_published: true })
      });
      if (r.ok) { setTitle(''); setContent(''); fetchNews(); }
    } catch { alert('エラーが発生しました'); }
  };

  const handleEdit = (item: any) => { setEditingId(item.id); setEditTitle(item.title); setEditContent(item.content || ''); };
  const handleCancelEdit = () => { setEditingId(null); setEditTitle(''); setEditContent(''); };

  const handleUpdate = async (id: number) => {
    try {
      const r = await authFetch(`${API}/api/admin/news/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, content: editContent })
      });
      if (r.ok) { handleCancelEdit(); fetchNews(); }
    } catch { alert('エラーが発生しました'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;
    try { const r = await authFetch(`${API}/api/admin/news/${id}`, { method: 'DELETE' }); if (r.ok) fetchNews(); }
    catch { alert('エラーが発生しました'); }
  };

  const btnStyle = (bg: string, color: string, border?: string) => ({
    background: bg, color, border: border || 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' as const, fontSize: '0.8rem'
  });

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>お知らせ管理</h1>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>新規作成</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>タイトル</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>本文</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} required rows={4} style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
          </div>
          <button type="submit" style={{ alignSelf: 'flex-start', background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>登録する</button>
        </form>
      </div>
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
            {loading ? (<tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</td></tr>) 
            : news.length === 0 ? (<tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>お知らせはありません</td></tr>) 
            : news.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '15px', fontSize: '0.9rem' }}>{item.published_at ? new Date(item.published_at).toLocaleString('ja-JP') : '-'}</td>
                <td style={{ padding: '15px', fontSize: '0.9rem', fontWeight: '500' }}>
                  {editingId === item.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                      <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={3} style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                    </div>
                  ) : item.title}
                </td>
                <td style={{ padding: '15px', fontSize: '0.9rem' }}>
                  {editingId === item.id ? (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleUpdate(item.id)} style={btnStyle('#3b82f6', 'white')}>保存</button>
                      <button onClick={handleCancelEdit} style={btnStyle('#6b7280', 'white')}>キャンセル</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button onClick={() => handleEdit(item)} style={btnStyle('#3b82f6', 'white')}>編集</button>
                      <button onClick={() => handleDelete(item.id)} style={btnStyle('transparent', '#ef4444', '1px solid #ef4444')}>削除</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
